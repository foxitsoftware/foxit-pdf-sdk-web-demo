import * as UIExtension from "UIExtension";
import {
    getClientX,
    getClientY
} from "../../../common/util"

const {
    PDFViewCtrl: {
        IStateHandler
    },
    vendors: {
        jQuery: $,
        Hammer
    }
} = UIExtension;
const operateType = {
    content: 'content',
    pages: 'pages'
}
import './index.less';

export var CropPagesStateHandler = function (pdfViewer) {
    this.pdfViewer = pdfViewer
    this.cursorStyle = "fv__cursor-crosshair";
};
CropPagesStateHandler.getStateName = function () {
    return 'create-crop-pages';
};
_inherits(CropPagesStateHandler, IStateHandler);

function resizeDom(size=8){
    let str = '';
    for (let index = 0; index < size; index++) {
        str += `<div class="resize" action-type="resize"></div>`
    }
    return str
}
CropPagesStateHandler.prototype.pageHandler = function (pageRender) {
    this.pageRender = pageRender;
    this.$handler = pageRender.$handler;
    this.$handler.addClass('fv__crop-pages-state-handler').attr('action-type', 'create');
    this.$rectangleControl = $(`
            <div class="rectangle-control">
                <div class="rect"></div>
                <div class="move" action-type="move">${resizeDom()}</div>
                <div class="control">
                    <div class="operate_bg active">
                        <img class="operate" action-type="content" src="${location.origin + "/assets/cropContent.png"}"/>
                        <span class="tip">Current Page</span>
                    </div>
                    <div class="operate_bg">
                        <img class="operate" action-type="pages" src="${location.origin + "/assets/cropPages.png"}"/>
                        <span class="tip">All Pages</span>
                    </div>
                    <div class="operate_bg">
                        <img class="operate" action-type="close" src="${location.origin + "/assets/close.png"}"/>
                        <span class="tip">Cancel</span>
                    </div>
                    <div class="operate_bg">
                        <img class="operate" action-type="marked" src="${location.origin + "/assets/marked.png"}"/>
                        <span class="tip">Apply</span>
                    </div>
                </div>
            </div>
        `);
    this.$handler.append(this.$rectangleControl);
    this.bindHammerEvent();
    this.bindClickEvent();
    this.operateType = operateType.content;
}

CropPagesStateHandler.prototype.destroyPageHandler = function () {
    const $handler = this.$handler;
    $handler.removeClass('fv__crop-pages-state-handler fv__cursor-crosshair').removeAttr('action-type');
    this.$rectangleControl.remove();
    $handler.off('mousedown touchstart', this.startHandler)
        .off('mousemove touchmove', this.moveHandler)
        .off('mouseup touchend', this.endHandler)
        .off('mouseleave touchcancel', this.endHandler);
    this.handlerHammer && this.handlerHammer.destroy();
}

CropPagesStateHandler.prototype.bindHammerEvent = function () {
    const $handler = this.$handler;
    const eHandler = $handler[0];
    this.handlerHammer = new Hammer.Manager(eHandler);
    const $rectangleControl = this.$rectangleControl = $handler.find(".rectangle-control");
    let startPoint = null;
    let startPointFake = null;
    let endPoint = null;
    let actionType = null;
    let recordControlBound = null;
    let targetResizeIndex = 0;
    const startHandler = e => {
        actionType = $(e.target).attr('action-type');
        if (!actionType) return;
        const {
            left: handlerL,
            top: handlerT
        } = eHandler.getBoundingClientRect();
        startPoint = [getClientX(e) - handlerL, getClientY(e) - handlerT];
        if(actionType === 'create'){
            this.hideAllRectangle();
            this.operateType = operateType.content;
            $rectangleControl.find('.operate_bg').eq(0).addClass('active').siblings().removeClass('active');
        }else if (actionType === 'resize') {
            const bound = $rectangleControl[0].getBoundingClientRect();
            const resizeDivIndex = targetResizeIndex = $(e.target).index();
            switch (resizeDivIndex) {
                case 0:
                case 1:
                    startPointFake = [bound.left + bound.width - handlerL, bound.top + bound.height - handlerT];
                    break;
                case 2:
                case 3:
                    startPointFake = [bound.left - handlerL, bound.top + bound.height - handlerT];
                    break;
                case 4:
                case 5:
                    startPointFake = [bound.left - handlerL, bound.top - handlerT];
                    break;
                case 6:
                case 7:
                    startPointFake = [bound.left + bound.width - handlerL, bound.top - handlerT];
                    break
                default:
                    break;
            }
        } else if (actionType === 'move') {
            this.$rectangleControl.find(".move").addClass('cursorGrabbing')
            recordControlBound = $rectangleControl[0].getBoundingClientRect();
        }
    }

    const moveHandler = e => {
        if (!startPoint) return;

        const {
            left: handlerL,
            top: handlerT,
            width: handlerW,
            height: handlerH,
        } = eHandler.getBoundingClientRect();
        const [deltaX, deltaY] = [getClientX(e) - handlerL - startPoint[0], getClientY(e) - handlerT - startPoint[1]];
        endPoint = [startPoint[0] + deltaX, startPoint[1] + deltaY];

        let style = null;
        if (actionType === 'create') {
            if (actionType === 'create') {
                if(this.$rectangleControl.is(":hidden")){
                    this.$rectangleControl.css({width:0,height:0}).show();
                }
            }
            style = getRectangleStyle(startPoint, endPoint, handlerW, handlerH);
        } else if (actionType === 'resize') {
            style = getRectangleStyle(startPointFake, endPoint, handlerW, handlerH, targetResizeIndex);
        } else if (actionType === 'move') {
            const bound = recordControlBound;
            style = {
                top: bound.top - handlerT + deltaY,
                left: bound.left - handlerL + deltaX,
            };
            style.top = (style.top < 0 ? 0 : (style.top + bound.height > handlerH ? handlerH - bound.height : style.top)) / handlerH * 100 + '%';
            style.left = (style.left < 0 ? 0 : (style.left + bound.width > handlerW ? handlerW - bound.width : style.left)) / handlerW * 100 + '%';
        }
        style && $rectangleControl.css(style);
        this.$rectangleControl.find(".control").hide();
    };

    const endHandler = e => {
        if (!startPoint) return;

        let style = null;
        if (endPoint) {
            const {
                top: handlerT,
                left: handlerL,
                width: handlerW,
                height: handlerH,
            } = eHandler.getBoundingClientRect();
            const [deltaX, deltaY] = [getClientX(e) - handlerL - startPoint[0], getClientY(e) - handlerT - startPoint[1]];
            endPoint = [startPoint[0] + deltaX, startPoint[1] + deltaY];
            endPoint[0] = endPoint[0] < 0 ? 0 : (endPoint[0] > handlerW ? handlerW : endPoint[0]);
            endPoint[1] = endPoint[1] < 0 ? 0 : (endPoint[1] > handlerH ? handlerH : endPoint[1]);

            if (actionType === 'create') {
                style = getRectangleStyle(startPoint, endPoint, handlerW, handlerH);
                $rectangleControl.css(style);
            } else if (actionType === 'resize') {
                style = getRectangleStyle(startPointFake, endPoint, handlerW, handlerH, targetResizeIndex);
                $rectangleControl.css(style);
            } else if (actionType === 'move') {
                this.$rectangleControl.find(".move").removeClass('cursorGrabbing');
                const bound = this.$rectangleControl[0].getBoundingClientRect();
                style = {
                    top: (bound.top - handlerT) / handlerH * 100 + '%',
                    left: (bound.left - handlerL) / handlerW * 100 + '%',
                };
            }
            style && $rectangleControl.css(style);
            this.$rectangleControl.find(".control").show();
        }

        startPoint = null;
        startPointFake = null;
        endPoint = null;
        actionType = null;
    };

    $handler.on('mousedown touchstart', startHandler)
        .on('mousemove touchmove', moveHandler)
        .on('mouseup touchend', endHandler)
        .on('mouseleave touchcancel', endHandler);
}
CropPagesStateHandler.prototype.setBox = function () {
    let indexes = []
    const currentPageIndex = this.pageRender.index;
    if (this.operateType === operateType.content) {
        indexes.push(this.pageRender.index);
    } else {
        const pageCount = this.pageRender.getPDFDoc().getPageCount();
        indexes = Array.from({
            length: pageCount
        }, (v, i) => i);
    }
    const doc = this.pageRender.getPDFDoc();
    return Promise.all([doc.getAllBoxesByPageIndex(currentPageIndex), this.pageRender.getPDFPage()]).then(([boxes, page]) => {
        const degree = page.getRotation();
        let width = boxes.width;
        let height = boxes.height;
        boxes.cropBox = getDegreeBox(boxes.cropBox, width, height, degree);
        boxes.artBox = getDegreeBox(boxes.artBox, width, height, degree);
        boxes.trimBox = getDegreeBox(boxes.trimBox, width, height, degree);
        boxes.bleedBox = getDegreeBox(boxes.bleedBox, width, height, degree);

        width = boxes.cropBox.right - boxes.cropBox.left;
        height = boxes.cropBox.top - boxes.cropBox.bottom;
        const bound = this.getRectangleBound();
        bound.left = Math.abs(width * bound.left + boxes.cropBox.left);
        bound.right = Math.abs(width * (1 - bound.right) + boxes.cropBox.left);
        bound.top = Math.abs(height * (1 - bound.top) + boxes.cropBox.bottom);
        bound.bottom = Math.abs(height * bound.bottom + boxes.cropBox.bottom);
        boxes.cropBox = {
            ...bound
        };

        if (boxes.artBox.left === undefined) {
            boxes.artBox = {
                ...boxes.cropBox
            };
        }

        if (boxes.trimBox.left === undefined) {
            boxes.trimBox = {
                ...boxes.cropBox
            };
        }

        if (boxes.bleedBox.left === undefined) {
            boxes.bleedBox = {
                ...boxes.cropBox
            };
        }
        return doc.setPagesBox({
            indexes,
            boxes
        })
    })
}

CropPagesStateHandler.prototype.getRectangleBound = function () {
    const $rectangle = this.$rectangleControl;
    const handlerBound = this.$handler[0].getBoundingClientRect();
    const bound = $rectangle[0].getBoundingClientRect();
    return {
        top: (bound.top - handlerBound.top) / handlerBound.height,
        bottom: (handlerBound.bottom - bound.bottom) / handlerBound.height,
        left: (bound.left - handlerBound.left) / handlerBound.width,
        right: (handlerBound.right - bound.right) / handlerBound.width,
    }
}

CropPagesStateHandler.prototype.bindClickEvent = function () {
    this.$handler.on("click", e => {
        const actionType = $(e.target).attr('action-type');
        switch (actionType) {
            case operateType.content:
            case operateType.pages:
                this.operateType = actionType;
                $(e.target).parent().addClass('active').siblings().removeClass("active");
                break;
            case "close":
                this.hideRectangleControl();
                break;
            case "marked":
                this.setBox().then(_ => {
                    this.hideRectangleControl();
                });
                break;
            default:
                break;
        }
    })
}

CropPagesStateHandler.prototype.hideRectangleControl = function () {
    this.$rectangleControl.hide();
    this.operateType = operateType.content;
    this.$rectangleControl.find('.operate').removeClass("active");
};

CropPagesStateHandler.prototype.hideAllRectangle = function() {
    const style = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    };
    this.pdfViewer.getPDFDocRender().pagesRender.pageRenders.forEach(pageRender => {
        (pageRender.stateHandler && pageRender.stateHandler.$rectangleIndicator) && pageRender.stateHandler.$rectangleIndicator.hide().css(style).removeClass('resize move');
        (pageRender.stateHandler && pageRender.stateHandler.$rectangleControl) && pageRender.stateHandler.$rectangleControl.hide().css(style);
    });
}

CropPagesStateHandler.prototype.out = function () {
    this.destroyPageHandler();
};

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function getRectangleStyle(startPoint, endPoint, handlerW, handlerH, targetIndex) {
    let result = {}
    switch (targetIndex) {
        case 1:
        case 5:
            result = {
                top: Math.min(startPoint[1], endPoint[1]) / handlerH * 100 + '%',
                height: Math.abs(startPoint[1] - endPoint[1]) / handlerH * 100 + '%',
            }
            break;
        case 3:
        case 7:
            result = {
                left: Math.min(startPoint[0], endPoint[0]) / handlerW * 100 + '%',
                width: Math.abs(startPoint[0] - endPoint[0]) / handlerW * 100 + '%',
            }
            break;
        default:
            result = {
                top: Math.min(startPoint[1], endPoint[1]) / handlerH * 100 + '%',
                left: Math.min(startPoint[0], endPoint[0]) / handlerW * 100 + '%',
                width: Math.abs(startPoint[0] - endPoint[0]) / handlerW * 100 + '%',
                height: Math.abs(startPoint[1] - endPoint[1]) / handlerH * 100 + '%',
            }
            break;
    }
    return result
};

function getDegreeBox(box, width, height, degree) {
    let temp;
    if (box.left === undefined) {
        return {};
    }
    switch (degree) {
        case 1:
            temp = {
                top: height - box.left,
                right: width - (height - box.top),
                bottom: width - box.right,
                left: box.bottom
            };
            break;
        case 2:
            temp = {
                top: height - box.bottom,
                right: width - box.left,
                bottom: height - box.top,
                left: width - box.right
            };
            break;
        case 3:
            temp = {
                top: height - (width - box.right),
                right: width - box.bottom,
                bottom: box.left,
                left: height - box.top
            };
            break;
        default:
            temp = box;
    }
    return temp;
}

export function openRectControlOnPage(pdfui,pageIndex=2){
    return pdfui.getPDFPageRender(pageIndex).then(pageRender=>{
        pageRender.$handler.addClass("demo")
    })
}
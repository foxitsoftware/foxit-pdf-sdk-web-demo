import * as UIExtension from "UIExtension";

const {
    PDFViewCtrl,
    vendors: {
        jQuery: $,
        Hammer
    }
} = UIExtension;
const boxType = PDFViewCtrl.PDF.constant.Box_Type;
import './index.less';

const cropTargetPageIndex = 2;
const $rectangleControl = $(`
    <div class="rectangle-control">
        <div class="rect"></div>
        <div class="move">
            <div class="resize" action-type="resize"></div>
            <div class="resize" action-type="resize"></div>
            <div class="resize" action-type="resize"></div>
            <div class="resize" action-type="resize"></div>
            <div class="resize" action-type="resize"></div>
            <div class="resize" action-type="resize"></div>
            <div class="resize" action-type="resize"></div>
            <div class="resize" action-type="resize"></div>
        </div>
        <div class="control">
            <img class="operate" src="${location.origin + "/assets/cropContent.png"}"/>
            <img class="operate" src="${location.origin + "/assets/cropPages.png"}"/>
            <img class="operate" src="${location.origin + "/assets/close.png"}"/>
            <img class="operate" src="${location.origin + "/assets/marked.png"}"/>
        </div>
    </div>
`);
export function customizeCropTool() {
    return pdfui.getPDFPageRender(cropTargetPageIndex).then(pageRender => {
        const $handler = pageRender.$handler;
        $handler.addClass('fv__crop-pages-state-handler').attr('action-type', 'create');
        $handler.append($rectangleControl);
        bindHammerEvent($handler)
    })
}

function bindHammerEvent($handler) {
    const eHandler = $handler[0];
    const handlerHammer = new Hammer.Manager(eHandler);
    this.startHandler = e => {
        actionType = $(e.target).attr('action-type');
        if (!actionType) return;

        const {
            left: handlerL,
            top: handlerT
        } = eHandler.getBoundingClientRect();
        startPoint = [getClientX(e) - handlerL, getClientY(e) - handlerT];

        if (actionType === 'create') {
            this.hideAllRectangle();
            this.$rectangleIndicator.show();
        } else if (actionType === 'resize') {
            const bound = this.$rectangleControl[0].getBoundingClientRect();
            const resizeDivIndex = $(e.target).index();
            if (resizeDivIndex === 0) {
                startPointFake = [bound.left + bound.width - handlerL, bound.top + bound.height - handlerT];
            } else if (resizeDivIndex === 1) {
                startPointFake = [bound.left - handlerL, bound.top + bound.height - handlerT];
            } else if (resizeDivIndex === 2) {
                startPointFake = [bound.left + bound.width - handlerL, bound.top - handlerT];
            } else if (resizeDivIndex === 3) {
                startPointFake = [bound.left - handlerL, bound.top - handlerT];
            }
            this.$rectangleIndicator.addClass('resize').show();
        } else if (actionType === 'move') {
            this.$rectangleIndicator.show();
        }
    };

    this.moveHandler = e => {
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
            style = getRectangleStyle(startPoint, endPoint, handlerW, handlerH);
        } else if (actionType === 'resize') {
            style = getRectangleStyle(startPointFake, endPoint, handlerW, handlerH);
        } else if (actionType === 'move') {
            const bound = this.$rectangleControl[0].getBoundingClientRect();
            style = {
                top: bound.top - handlerT + deltaY,
                left: bound.left - handlerL + deltaX,
            };
            style.top = (style.top < 0 ? 0 : (style.top + bound.height > handlerH ? handlerH - bound.height : style.top)) / handlerH * 100 + '%';
            style.left = (style.left < 0 ? 0 : (style.left + bound.width > handlerW ? handlerW - bound.width : style.left)) / handlerW * 100 + '%';
        }
        style && this.$rectangleIndicator.css(style);
    };

    this.endHandler = e => {
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
                this.$rectangleIndicator.css(style);
            } else if (actionType === 'resize') {
                style = getRectangleStyle(startPointFake, endPoint, handlerW, handlerH);
                this.$rectangleIndicator.css(style);
            } else if (actionType === 'move') {
                const bound = this.$rectangleIndicator[0].getBoundingClientRect();
                style = {
                    top: (bound.top - handlerT) / handlerH * 100 + '%',
                    left: (bound.left - handlerL) / handlerW * 100 + '%',
                };
            }
            this.$rectangleControl.show();
            style && this.$rectangleControl.css(style);
            this.$rectangleIndicator.hide();
        }

        startPoint = null;
        startPointFake = null;
        endPoint = null;
        if (actionType === 'create') {
            this.openCropPagesDialog();
        } else if (actionType === 'resize') {
            this.$rectangleIndicator.removeClass('resize')
        }

        actionType = null;

    };

    $handler.on('mousedown touchstart', this.startHandler)
        .on('mousemove touchmove', this.moveHandler)
        .on('mouseup touchend', this.endHandler)
        .on('mouseleave touchcancel', this.endHandler);

}

function bindOperateEvent(){
    
}
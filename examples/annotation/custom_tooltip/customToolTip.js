import './customToolTip.less';

/**
 * Set custom annotation toolTip
 * The Settings are valid before Initialize pdfui in the following example
 * @example
    var pdfui = new PDFUI({
        ...
        viewerOptions: {
            ...
            showAnnotTooltip: true,//Specifies whether a Tooltip is used or not used.
            showFormFieldTooltip: true,//Specifies whether a Tooltip is used or not used for form fields.
            customs: {
                AnnotTooltip: customToolTip //Bind custom tooltip
            }
        }
    })
 */
export class customToolTip {
    constructor(pdfViewer, annot) {
        this.pdfViewer = pdfViewer;
        this.annot = annot.isGrouped && annot.isGrouped() ? annot.getGroupHeader() : annot;
        this.positionThreshold = 10;
        this.tooltip = '';
        this.tipElement = document.createElement('div');
        if (document.getElementsByClassName('fv_viewer-tooltip-container').length > 0) {
            this.tooltip = document.getElementsByClassName('fv_viewer-tooltip-container')[0];
        }
        this.createToolTip();
    }
    createToolTip() {
        if (document.getElementsByClassName('fv_viewer-tooltip-container').length > 0) return
        this.tipElement.classList.add("fv_viewer-tooltip-container");
        this.tipElement.classList.add("tooltip-unactive");
        var contentHTML = '<div class="fv_viewer-tooltip-title"></div><div class="fv_viewer-tooltip-content"></div>';
        this.tipElement.innerHTML = contentHTML;
        document.getElementsByTagName("body")[0].appendChild(this.tipElement);
        this.tooltip = document.getElementsByClassName('fv_viewer-tooltip-container')[0];
    }
    getPosition(clientX, clientY) {
        var viewerHeight = document.documentElement.clientHeight;
        var toolWidth = this.tooltip.getBoundingClientRect().width;
        var toolHeight = this.tooltip.getBoundingClientRect().height;
        var x = clientX + this.positionThreshold;
        var y = clientY + this.positionThreshold;
        if (document.documentElement.clientWidth - clientX < toolWidth + this.positionThreshold) {
            x -= (toolWidth + this.positionThreshold);
        }
        if (viewerHeight - y < toolHeight) {
            y = clientY - toolHeight;
        }
        return {
            x: x,
            y: y
        }
    }
    setTooltipPosition(elem, x, y) {
        elem.style.left = x + 'px';
        elem.style.top = y + 'px';
    }
    show(x, y) {
        var contentNode = document.getElementsByClassName('fv_viewer-tooltip-content')[0];
        var titleNode = document.getElementsByClassName('fv_viewer-tooltip-title')[0];
        var titleText = "";
        var contentText = "";
        if (this.annot.getType() == 'widget') {
            contentText = this.annot.getField().getAlternateName();
        } else {
            titleText = this.annot.getTitle();
            contentText = this.annot.getContent();
        }
        contentNode.innerHTML = contentText.trim();
        titleNode.innerHTML = titleText.trim();
        let ptInfo = this.getPosition(x, y);
        this.setTooltipPosition(this.tooltip, ptInfo.x, ptInfo.y);
        if (this.annot.getType() == 'widget' && this.annot.getField().getAlternateName().trim() == '') {
            return;
        }
        this.tooltip.classList.remove("tooltip-unactive");
        this.tooltip.classList.add("tooltip-active");
    }
    hide() {
        this.tooltip.classList.remove("tooltip-active");
        this.tooltip.classList.add("tooltip-unactive");
    }
}
    
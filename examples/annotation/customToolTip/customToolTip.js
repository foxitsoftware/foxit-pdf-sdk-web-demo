import './customToolTip.less';

/**
 * Set custom annotation toolTip
 * The Settings are valid before Initialize pdfui in the following example
 * @example
    var pdfui = new PDFUI({
        viewerOptions: {
            ...
            showAnnotTooltip: true,//Specifies whether a Tooltip is used or not used.
            showFormFieldTooltip: true,//Specifies whether a Tooltip is used or not used for form fields.
            customs: {
                activeTooltip: customToolTip //Bind custom tooltip
            }
        }
        ...
    })
 */
export function customToolTip(pdfViewer, annot){
    var pageRender = pdfViewer.getPDFPageRender(annot.getPage().getIndex());
    var rect = annot.getRect();
    var component = pageRender.annotsRender.getAnnotRender(annot.getId()).component;
    var element = annot.getType()=='widget' ? component.eHandler : component.eUi;
    rect = pageRender.transformRectArray(annot.getPage(), [rect])[0];
    var tooltip = '';
    var tipElement = document.createElement('div');
    if(annot.getType() !== 'widget'){
        annot = annot.isGrouped() ? annot.getGroupHeader() : annot;
    }
    if(document.getElementsByClassName('fv_viewer-tooltip-container').length > 0){
        tooltip = document.getElementsByClassName('fv_viewer-tooltip-container')[0];
    }
    // 1: Create the container node and append it under the body.
    var createTooltipElement = function (){
        if(document.getElementsByClassName('fv_viewer-tooltip-container').length > 0) return;
        tipElement.classList.add("fv_viewer-tooltip-container");
        tipElement.classList.add("tooltip-unactive");
        var contentHTML = '<div class="fv_viewer-tooltip-title"></div><div class="fv_viewer-tooltip-content"></div>';
        tipElement.innerHTML = contentHTML;
        document.getElementsByTagName("body")[0].appendChild(tipElement);
        tooltip = document.getElementsByClassName('fv_viewer-tooltip-container')[0];
    }
    // 2: Gets the x,y coordinates based on the event object.
    var getTooltipXY = function(e){
        var viewerHeight = document.documentElement.clientHeight;
        var toolWidth = 150;
        var toolHeight = 80;
        var x = e.clientX;
        var y = e.clientY - e.layerY + element.clientHeight;
        var sidebar = document.getElementsByClassName("fv__ui-sidebar")[0];
        var sidebarFlag = sidebar.classList.contains("expand");
        if(!sidebarFlag && annot.getType() !== 'widget'){
            x += toolWidth / 2;
        }
        if(document.documentElement.clientWidth - e.clientX <  toolWidth + 20){
            x -= toolWidth;
        }
        if(viewerHeight - y < toolHeight){
            y = e.clientY - e.layerY - toolHeight;
        }
        return {
            x: x,
            y: y
        }
    }
    
    // 3: Dynamically set the coordinates of the Tooltip on the x, y axis.
    var setTooltipPosition = function(elem, x, y){
        elem.style.left = x + 'px';
        elem.style.top = y + 'px';
    }
    // 4: Hide tooltip container.
    var hideTooltip = function(e){
        tooltip.classList.remove("tooltip-active");
        tooltip.classList.add("tooltip-unactive");
    };
    // 5: Show tooltip container;
    var showTooltip = function(e){
        var contentNode = document.getElementsByClassName('fv_viewer-tooltip-content')[0];
        var titleNode = document.getElementsByClassName('fv_viewer-tooltip-title')[0];
        var titleText = "";
        var contentText = "";
        if(annot.getType() == 'widget'){
            contentText = annot.getField().getAlternateName();
        }else{
            titleText = annot.getTitle();
            contentText = annot.getContent();
        }
        contentNode.innerHTML = contentText.trim();
        titleNode.innerHTML = titleText.trim();
        setTooltipPosition(tooltip, getTooltipXY(e).x, getTooltipXY(e).y);
        if(annot.getType() == 'widget' && annot.getField().getAlternateName().trim() == ''){
            return;
        }
        tooltip.classList.remove("tooltip-unactive");
        tooltip.classList.add("tooltip-active");
        e.target.parentNode.addEventListener("mouseleave", hideTooltip);
    }
    createTooltipElement();
    // 6: Control the display of tooltips through events.
    element.addEventListener("mouseenter", showTooltip);
}
    
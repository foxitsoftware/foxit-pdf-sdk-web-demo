import * as UIExtension from "UIExtension";
import './customPopup.less'
const { PDFViewCtrl, UIConsts, UIEvents, controllers } = UIExtension;

/**
 * Set custom annotation popup
 * The Settings are valid before Initialize pdfui in the following example
 * @example
    var pdfui = new PDFUI({
        ...
        fragments:customFragments,
    })
 */

// Set popup template
const customPopupTemplate = `
            <layer @draggable @resizable="{minWidth:400,minHeight:200}" name="custom-annotation-popup-layer" class="annotation-popup-layer" 
                style="top: calc(50vh - 100px); left: calc(50vw - 200px)">
                <layer-header name="annotation-popup-layer-header"></layer-header>
                <textarea @stop-drag name="annotation-popup-content"></textarea>
            </layer>`

// set custom fragments
export const customFragments = [{
    target: 'fv--annottext-tooltip',
    config:{
        callback: PDFViewCtrl.shared.createClass({
            mounted: function() {
                let datakeys = [{
                    key: "title"
                },{
                    key: "content"
                }];
                let tpl = '<div class="fv__ui-annottext-title"><text>[title]</text></div><div class="fv__ui-annottext-content"><text>[content]</text></div>';
                this.component.setShowType(datakeys, tpl)
            }
        },controllers.Controller)
    }
},{
    target: 'template-container',
    template: customPopupTemplate,
    // append the custom-annotation-popup-layer to the 'template-container' in built-in layer template.
    action: UIConsts.FRAGMENT_ACTION.APPEND,
    config:[{
        target: 'annotation-popup-content',
        callback: PDFViewCtrl.shared.createClass({
            setActiveAnnot: function(annotComponent) {
                if (!popupAvailable(annotComponent)) return;
                var model = annotComponent.getModel();
                var layerComponent = this.component.parent; 

                var headerComponent = layerComponent.getComponentByName('annotation-popup-layer-header');
                var modifyTimeStr = formatDatetime(model.getModifiedDateTime());

                headerComponent.setTitle(model.getType() + Array(5).fill('　').join('') + modifyTimeStr);

                layerComponent.currentAnnot = model;
            },
            mounted:function() {
                var self = this;
                var layerComponent = this.component.parent;
                
                var textarea = this.component.element;
                function blurEventHandler() {
                    layerComponent.currentAnnot.setContent(textarea.value);
                }
                textarea.addEventListener('blur', blurEventHandler);

                this.addDestroyHook(function() {
                    textarea.removeEventListener('blur', blurEventHandler);
                }, layerComponent.on(UIConsts.COMPONENT_EVENTS.SHOWN, function() {
                    layerComponent.currentAnnot && (textarea.value = 'This is a pop-up window');
                }), this.pdfUI.addViewerEventListener(PDFViewCtrl.ViewerEvents.annotationUpdated, function(annots){
                    if(layerComponent.currentAnnot === annots[0]) {
                        layerComponent.currentAnnot && (textarea.value = layerComponent.currentAnnot.getContent());
                    }
                }), this.pdfUI.addViewerEventListener(PDFViewCtrl.ViewerEvents.activeAnnotation, function(annotRender) {
                    self.setActiveAnnot(annotRender.component);
                    layerComponent.currentAnnot && (textarea.value = 'This is a pop-up window');
                }));
            }
        },controllers.Controller)
    }]
}]

// registerMatchRule inside of the initializationCompleted event's callback to override AnnotComponent's onDoubleTap method.
export function initializationCompleted(pdfui){
    pdfui.addUIEventListener(UIEvents.initializationCompleted, () => {
        pdfui.registerMatchRule(function(annot, ParentClass) {
            if(!annot.isMarkup()) {
                return ParentClass;
            }
            return PDFViewCtrl.shared.createClass({
                showReplyDialog() {
                    var annotComponent = this;
                    ParentClass.prototype.showReplyDialog.apply(this, arguments);
                    if (popupAvailable(annotComponent)){
                        pdfui.getComponentByName('custom-annotation-popup-layer').then(function(layerComponent) {
                            if(!layerComponent){return}
                            var textareaComponent = layerComponent.getComponentByName('annotation-popup-content');
                            textareaComponent.controller.setActiveAnnot(annotComponent);
                            // ensure that the UIConsts.COMPONENT_EVENTS.HIDDEN event should be triggered correctly
                            if(layerComponent.isVisible) {
                                layerComponent.hide();
                            }
                            layerComponent.show();
                            textareaComponent.element.focus();
                        });
                    }
                }
            }, ParentClass);
        });
    });
}

function popupAvailable(annotComponent) {
    var model = annotComponent.getModel();
    if (!model || !model.getPopup ) return false;
    var popup = model.getPopup();
    if (!popup) return false;
    var {annot} = annotComponent;
    var annots = annot.getPDFPage().annots;
    var targetAnnot = annots.find(annot=>{
        return annot.getIconName&&annot.getIconName()=='Insert'
    })
    console.log(annot.getId() , targetAnnot.getId())
    return targetAnnot&&annot.getId() == targetAnnot.getId()?true:false;
}

function formatDatetime(time) {
    return time ? [
        time.getFullYear(), '/',formatNumber(time.getMonth() + 1), '/', formatNumber(time.getDate()), ' ',
        formatNumber(time.getHours()),':',formatNumber(time.getMinutes()),':',formatNumber(time.getSeconds())
    ].join('') : '';
    function formatNumber(n) {
        return n < 10 ? '0' + n : n;
    }
}
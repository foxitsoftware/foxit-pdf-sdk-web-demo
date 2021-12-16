import * as UIExtension from 'UIExtension';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import { createPDFUI, initMobileTab } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { DeviceInfo, Events } = PDFViewCtrl;

const pdfui = createPDFUI({});

// Search for matching 'county' text and redaction on the first page.
export function searchTextsAndMarkRedact(){
    return pdfui.getCurrentPDFDoc()
        .then(doc=>{
            // search the specified word
            return Promise.all([doc.searchText([0],['123-45-6789'],{
                wholeWordsOnly: true,
                caseSensitive: false
            }),doc.getPageByIndex(0)])
        .then(([searchResult,page])=>{
            var rects = [];
            Object.values(searchResult).forEach(matchPageArr=>{
                matchPageArr.forEach(matchItem=>rects.push(...matchItem.rects))
            })
            // Mark as redaction annotation by the Rects
            return page.markRedactAnnot(rects)
        })
        .then((annots) => {
            //Apply redaction in marked areas
            annots[0].apply();
        })
    })
}

export function markAreaRedaction(){
    const rects = [
        {
            "left": 277.2560119628906,
            "top": 732.7030029296875,
            "right": 407.76806640625,
            "bottom": 710.1190185546875
        }
    ]
    const pageIndex = 0;
    return pdfui.getCurrentPDFDoc()
        .then(doc=>{
            return doc.getPageByIndex(pageIndex)
        }).then(page=>{
            return page.markRedactAnnot(rects)
        }).then(annots=>{
            return pdfui.getAnnotRender(pageIndex,annots[0].getName())
        }).then(annotRender=>{
            pdfui.activeElement(annotRender.getComponent())
        });
}

export function closeSidebarRight(){
    return pdfui.getComponentByName("sidebar-right-tabs")
        .then(rightTab=>{
            return rightTab.closeTab()
        })
}

export function redactionSearch(){
    return pdfui.getComponentByName("redaction-search")
        .then(redactionSearch=>{
            redactionSearch.element.click();
            setTimeout(() => {
                pdfui.getComponentByName("advanced-search")
                .then(advancedSearch=>{
                    var SearchInput = advancedSearch.element.querySelector(".fv__ui-search-with-text .fv__ui-search-text");
                    var searchBtn = advancedSearch.element.querySelector(".fv__ui-search-with-text .fv__ui-dialog-ok-button");
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('input',true,true);
                    SearchInput.value = '123-45-6789';
                    SearchInput.dispatchEvent(evt);
                    searchBtn.click();
                    setTimeout(()=>{
                        var checkAllBox = advancedSearch.element.querySelector(".fv__ui-search-result-panel .fv__ui-checkbox-wrapper .fv__ui-checkbox-input");
                        checkAllBox.click();
                    },300)
                })   
            });
        })
}

export function unActiveAnnot(){
    return pdfui.activeElement()
}

if(!DeviceInfo.isMobile){
    pdfui.getRootComponent().then((root) => {
        const protectTab = root.getComponentByName('protect-tab');
        protectTab.active();
    });
}else{
    initMobileTab(pdfui,"protect-tab-li")
}
pdfui.addViewerEventListener(Events.openFileSuccess, () => {
    pdfui.getRootComponent().then((root) => {
        const protectTab = root.getComponentByName('protect-tab');
        protectTab.active();
        const redactionGroup = root.getComponentByName('redaction');
        redactionGroup.setRetainCount(100);
    });
});

pdfui.openPDFByHttpRangeRequest(
    {
        range: {
            url: '/assets/5-feature-example_forms.pdf',
        },
    },
    { fileName: '5-feature-example_forms.pdf' }
).then(() => {
    markAreaRedaction();
    if(DeviceInfo.isMobile){
        searchTextsAndMarkRedact()
    }
  });

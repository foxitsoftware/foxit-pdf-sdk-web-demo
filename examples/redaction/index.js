import * as UIExtension from 'UIExtension';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import { createPDFUI } from '../../common/pdfui';

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
        .then(() => {
            //Apply redaction in marked areas
            doc.applyRedaction()
        })
    })
}
export function openRedactionSearchBar(){
    pdfui.addonInstanceMap.SearchAddon.openPanel()
}

if(!DeviceInfo.isMobile){
    pdfui.getRootComponent().then((root) => {
        const commentTab = root.getComponentByName('protect-tab');
        commentTab.active();
    });
}
pdfui.addViewerEventListener(Events.openFileSuccess, () => {
    pdfui.getRootComponent().then((root) => {
        const commentTab = root.getComponentByName('protect-tab');
        commentTab.active();
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
    if(DeviceInfo.isMobile){
        searchTextsAndMarkRedact()
    }
  });

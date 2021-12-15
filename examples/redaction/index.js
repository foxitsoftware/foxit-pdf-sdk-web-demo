import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import { createPDFUI, initTab } from '../../common/pdfui';

const pdfui = createPDFUI({});
initTab(pdfui,{
    menuTabName: "protect-tab",
    group:[
        {
            groupTabName: "redaction",
            retainCount: 100
        }
    ]
});

// Search and redact on the first page.
export function searchTextsAndMarkRedact(){
    return pdfui.getCurrentPDFDoc()
        .then(doc=>{
            // search the specified text
            return Promise.all([doc.searchText([0],['123-45-6789'],{
                wholeWordsOnly: true,
                caseSensitive: false
            }),doc.getPageByIndex(0)])
        .then(([searchResult,page])=>{
            var rects = [];
            Object.values(searchResult).forEach(matchPageArr=>{
                matchPageArr.forEach(matchItem=>rects.push(...matchItem.rects))
            })
            // Set rect for redaction
            return page.markRedactAnnot(rects)
        })
        .then(() => {
            //Apply redaction
            doc.applyRedaction()
        })
    })
}

//Show the search panel 
export function openRedactionSearchBar(){
    pdfui.addonInstanceMap.SearchAddon.openPanel('redaction',"exact")
}

pdfui.openPDFByHttpRangeRequest(
    {
        range: {
            url: '/assets/5-feature-example_forms.pdf',
        },
    },
    { fileName: '5-feature-example_forms.pdf' }
).then((doc) => {
    searchTextsAndMarkRedact()
  });

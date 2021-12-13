import * as UIExtension from 'UIExtension';
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';
import { openSidebarRightTab } from "../../src/snippets"

const {
  PDFViewCtrl: {
    ViewerEvents,
    DeviceInfo
  }
} = UIExtension;

const pdfui = createPDFUI({})

pdfui.addViewerEventListener(ViewerEvents.openFileSuccess, () => {
  if(DeviceInfo.isMobile){return}
  openSidebarRightTab(pdfui,'right-search-panel','',0);
});

// Search text on the first three pages.
export function searchTexts(){
  return pdfui.getCurrentPDFDoc().then(doc=>{
    return doc.searchText([0,1,2],['want', 'over'],{
      wholeWordsOnly: true,
      caseSensitive: false
    })
  })
}

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/Feature-example_search-annotation.pdf",
    },
  },
  { fileName: "Feature-example_search-annotation.pdf" }
);

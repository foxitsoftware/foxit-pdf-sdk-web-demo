import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI, isDesktop } from '../../common/pdfui';
import { openSidebar, openSidebarRightTab } from "../../src/snippets"

const pdfui = createPDFUI({})

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
).then(doc=>{
  if(!isDesktop){
    openSidebar(pdfui, "sidebar-search");
    return
  }
  pdfui.getRootComponent().then((root) => {
    root.querySelector('@sidebar-tabs');
    return pdfui.getComponentByName('sidebar-right')
    .then((rightPanel) => {
      rightPanel.show();
      return pdfui.getComponentByName('sidebar-right-tabs');
    }).then((tabs) => {
      tabs.openTab('right-search-panel');
      tabs.setActivetab('right-search-panel');
      return pdfui.getComponentByName('advanced-search').then((searchComp)=>{
        searchComp.setSearchType('normal');
      });
    })
  });
});

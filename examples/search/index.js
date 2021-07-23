import * as UIExtension from 'UIExtension';
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const {
  PDFViewCtrl: {
    ViewerEvents
  }
} = UIExtension;

const pdfui = createPDFUI({})

function openSidebar(sidebarTabName) {
  pdfui.getRootComponent().then((root) => {
    const sidebarPanel = root.getComponentByName(sidebarTabName);
    if (sidebarPanel) {
      sidebarPanel.active();
    }
  });
}


pdfui.addViewerEventListener(ViewerEvents.openFileSuccess, () => {
  openSidebar('sidebar-search');
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/Feature-example_search-annotation.pdf",
    },
  },
  { fileName: "Feature-example_search-annotation.pdf" }
);

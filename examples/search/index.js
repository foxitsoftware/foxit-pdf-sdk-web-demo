import * as UIExtension from 'UIExtension';
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const {
  PDFViewCtrl: {
    ViewerEvents
  }
} = UIExtension;

function openSidebar(pdfui, sidebarTabName) {
  pdfui.getRootComponent().then((root) => {
    const sidebarPanel = root.getComponentByName(sidebarTabName);
    if (sidebarPanel) {
      sidebarPanel.active();
    }
  });
}

const pdfui = createPDFUI({})

pdfui.addViewerEventListener(ViewerEvents.openFileSuccess, () => {
  openSidebar(pdfui, 'sidebar-search');
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/Feature-example_search-annotation.pdf",
    },
  },
  { fileName: "Feature-example_search-annotation.pdf" }
);

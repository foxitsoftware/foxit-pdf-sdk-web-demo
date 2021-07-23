import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import "./index.css";
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;

const pdfui = createPDFUI({});

//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
  const downloadLink = root.getComponentByName("download-file-button");
  downloadLink.hide();
});


pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("edit-tab");
    commentTab.active();
  });
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      //Default PDF file path
      url: "/assets/2-feature-example_edit-pdf.pdf",
    },
  },
  { fileName: "2-feature-example_edit-pdf.pdf" }
);

import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;

const pdfui = createPDFUI({});

pdfui.getAllComponentsByName("form-tab-group-fields").then((group) => {
  group[2].setRetainCount(1000)
});
//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
  const formTab = root.getComponentByName("form-tab");
  formTab.active();
});

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("form-tab");
    commentTab.active();
  });
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      //Default PDF file path
      url: "/assets/5-feature-example_forms.pdf",
    },
  },
  { fileName: "5-feature-example_forms.pdf" }
);

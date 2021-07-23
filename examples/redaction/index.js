import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import "./index.css";
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;

const pdfui = createPDFUI({});
//This method forces the viewer into mobile layout view. Use it instead of the responsive mobile design
//DeviceInfo.isMobile = true;

//Toolbar element show/hide control

pdfui.getComponentByName("redaction").then((group) => {
  group.setRetainCount(100);
});

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("protect-tab");
    commentTab.active();
  });
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/5-feature-example_forms.pdf",
    },
  },
  { fileName: "5-feature-example_forms.pdf" }
);
import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { DeviceInfo, Events } = PDFViewCtrl;

const pdfui = createPDFUI({});

if(!DeviceInfo.isMobile){
  pdfui.getAllComponentsByName("form-tab-group-fields").then((group) => {
    group[2].setRetainCount(1000)
  });
  pdfui.addViewerEventListener(Events.openFileSuccess, () => {
    pdfui.getRootComponent().then((root) => {
      const formTab = root.getComponentByName("form-tab");
      formTab.active();
    });
  });
}


pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      //Default PDF file path
      url: "/assets/5-feature-example_forms.pdf",
    },
  },
  { fileName: "5-feature-example_forms.pdf" }
);
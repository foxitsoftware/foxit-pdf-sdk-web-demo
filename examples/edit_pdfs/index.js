import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { DeviceInfo, Events } = PDFViewCtrl;

const pdfui = createPDFUI({});

let rotate = 0;
export function rotatePage() {
  return pdfui
    .getCurrentPDFDoc()
    .then((doc) => {
      return doc.getPageByIndex(0);
    })
    .then((page) => {
      rotate ? rotate-- : rotate++;
      return page.setRotation(rotate);
    });
}

export function movePage(fromIndex, toIndex) {
  return pdfui.getCurrentPDFDoc().then((doc) => {
    return doc.movePageTo(fromIndex, toIndex);
  });
}

//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
  const downloadLink = root.getComponentByName("download-file-button");
  downloadLink.hide();
});


pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  if(!DeviceInfo.isMobile){
    pdfui.getRootComponent().then((root) => {
      const commentTab = root.getComponentByName("edit-tab");
      commentTab.active();
    });
  }
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

import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import "./index.css";

const { PDFUI, PDFViewCtrl } = UIExtension;
const { DeviceInfo, Events } = PDFViewCtrl;
const File_Type = PDFViewCtrl.PDF.constant.File_Type;
const libPath = "/lib/";
const pdfui = new PDFUI({
  viewerOptions: {
    libPath: libPath,
    jr: {
      workerPath: libPath,
      enginePath: libPath + "jr-engine/gsdk/",
      fontPath: "https://webpdf.foxitsoftware.com/webfonts/",
      brotli: {
        core: false,
      },
      licenseSN: licenseSN,
      licenseKey: licenseKey,
    },
  },
  renderTo: "#pdf-ui",
  appearance: UIExtension.appearances.adaptive,
  addons: DeviceInfo.isMobile
    ? "/lib/uix-addons/allInOne.mobile.js"
    : "/lib/uix-addons/allInOne.js",
});
window.pdfui = pdfui;
window.isDesktopDevise = DeviceInfo.isDesktop;

pdfui.addViewerEventListener(PDFViewCtrl.ViewerEvents.openFileSuccess, () => {
  window.pdfui = pdfui;
  console.dir(pdfui)
});
pdfui.getAllComponentsByName("form-tab-group-fields").then((group) => {
  group[2].setRetainCount(1000)
});
//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
  const formTab = root.getComponentByName("form-tab");
  formTab.active();
  const formTabGroup = root.getComponentByName("form-tab-group-text");
  formTabGroup.setRetainCount(4);
});

if(window.innerWidth < 900){
  DeviceInfo.isMobile = true
}else{
  DeviceInfo.isMobile = false
}
window.addEventListener(
  DeviceInfo.isDesktop ? "resize" : "orientationchange",
  () => {
    pdfui.redraw();
  }
);

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  console.info("open file success");
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
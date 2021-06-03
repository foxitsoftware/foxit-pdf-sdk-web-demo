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
});

//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
  const formTab = root.getComponentByName("form-tab");
  formTab.active();
  const formTabGroup = root.getComponentByName("form-tab-group-text");
  formTabGroup.setRetainCount(4);
});

window.addEventListener(
  DeviceInfo.isDesktop ? "resize" : "orientationchange",
  () => {
    pdfui.redraw();
  }
);
window.addEventListener(`resize`, event => {
  if((DeviceInfo.isMobile === false && window.innerWidth < 900)||
  (DeviceInfo.isMobile === true && window.innerWidth >= 900)){
  document.location.reload();
  }
}, false);

if(window.innerWidth < 900){
  DeviceInfo.isMobile = true
}else{
  DeviceInfo.isMobile = false
}
pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  console.info("open file success");
  pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("protect-tab");
    commentTab.active();
  });
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      //Default PDF file path
      url: "/assets/Feature-example_digital-signature.pdf",
    },
  },
  { fileName: "Feature-example_digital-signature.pdf" }
);

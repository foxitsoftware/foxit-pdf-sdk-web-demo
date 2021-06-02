import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import "./index.css";

const { PDFUI, PDFViewCtrl } = UIExtension;
const { DeviceInfo } = PDFViewCtrl;

console.log(DeviceInfo);

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
    ? libPath + "uix-addons/allInOne.mobile.js"
    : libPath + "uix-addons/allInOne.js",
});

window.pdfui = pdfui;
window.addEventListener(
  DeviceInfo.isDesktop ? "resize" : "orientationchange",
  function (e) {
    pdfui.redraw();
  }
);
window.isDesktopDevise = DeviceInfo.isDesktop;

pdfui.addViewerEventListener(PDFViewCtrl.ViewerEvents.openFileSuccess, () => {
  window.pdfui = pdfui;
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/FoxitPDFSDKforWeb_DemoGuide.pdf",
    },
  },
  { fileName: "FoxitPDFSDKforWeb_DemoGuide.pdf" }
);

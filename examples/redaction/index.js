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

pdfui.addViewerEventListener(PDFViewCtrl.ViewerEvents.openFileSuccess, () => {
  window.pdfui = pdfui;
});

//This method forces the viewer into mobile layout view. Use it instead of the responsive mobile design
//DeviceInfo.isMobile = true;

//Toolbar element show/hide control

pdfui.getRootComponent().then((root) => {
  hideAll(
    pdfui,
    "@viewer,protect-tab,home-tab,fv--protect-tab-paddle,fv--protect-tab-paddle *,fv--home-tab-paddle,fv--home-tab-paddle *"
  );
  //Get 'protect' tab
  const protectTab = root.getComponentByName("protect-tab");
  protectTab.active();
  const protectTabGroup = root.getComponentByName("protect-tab-group-text");
  protectTabGroup.setRetainCount(100);
});

window.isDesktopDevise = DeviceInfo.isDesktop;

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  console.info("open file success");
  pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("protect-tab");
    commentTab.active();
  });
});
window.addEventListener(
  DeviceInfo.isDesktop ? "resize" : "orientationchange",
  () => {
    pdfui.redraw();
  }
);

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  console.info("open file success");
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/Feature-example_redaction.pdf",
    },
  },
  { fileName: "Feature-example_redaction.pdf" }
);

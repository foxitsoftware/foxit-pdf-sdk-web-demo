import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import '../../common/pdfui.less';
import { initSignatureHandlers } from '../../common/signature';

const { PDFUI, PDFViewCtrl } = UIExtension;
const { DeviceInfo } = PDFViewCtrl;

if(window.innerWidth < 900){
  DeviceInfo.isMobile = true
}else{
  DeviceInfo.isMobile = false
}


const libPath = "/lib/";
const wrapperElement = document.createElement("div");
wrapperElement.classList.add("fv__catalog-pdfui-wrapper");
document.body.appendChild(wrapperElement);

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
  renderTo: wrapperElement,
  appearance: UIExtension.appearances.adaptive,
  addons: DeviceInfo.isMobile
    ? libPath + "uix-addons/allInOne.mobile.js"
    : libPath + "uix-addons/allInOne.js",
});
window.pdfui = pdfui;
pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/1-feature-example_default-setup.pdf",
    },
  },
  { fileName: "1-feature-example_default-setup.pdf" }
);  


pdfui.getComponentByName("home-tab-group-io").then((group) => {
  group.setRetainCount(100);
});
window.addEventListener(
  DeviceInfo.isDesktop ? "resize" : "orientationchange",
  function (e) {
    pdfui.redraw();
  }
);

initSignatureHandlers(pdfui);

import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import '../../common/pdfui.less';
import { initSignatureHandlers } from '../../common/signature';
import Addons from "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/uix-addons/allInOne"
import mobileAddons from "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/uix-addons/allInOne.mobile"

const { PDFUI, appearances:{MobileAppearance, RibbonAppearance}  } = UIExtension;
let appearance = RibbonAppearance,isMobile = false;
if(window.innerWidth <= 900){
  appearance = MobileAppearance
  isMobile = true
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
      licenseSN: licenseSN,
      licenseKey: licenseKey,
    },
  },
  renderTo: wrapperElement,
  appearance,
  addons: isMobile
    ? mobileAddons
    : Addons,
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

if(!isMobile){
  pdfui.getComponentByName("home-tab-group-io").then((group) => {
    group.setRetainCount(100);
  });
}

window.addEventListener(
  !isMobile ? "resize" : "orientationchange",
  function (e) {
    pdfui.redraw();
  }
);

initSignatureHandlers(pdfui);

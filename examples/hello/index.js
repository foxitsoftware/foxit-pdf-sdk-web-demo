import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import '../../common/pdfui.less';
import { initSignatureHandlers } from '../../common/signature';

let currentLanguage = navigator.language || 'en-US';
const getMessage = (event) => {
    let Data;
    try {
      Data = JSON.parse(event.data);
    } catch (error) {
      return;
    }
    if (Data.hasOwnProperty("language")){
      let language = Data.language;
      if(currentLanguage !== language ){
        currentLanguage = language;
        window.pdfui && window.pdfui.changeLanguage(currentLanguage);
      }
    }
};
window.addEventListener("message", getMessage, false);
window.top?.postMessage('ready', {
  targetOrigin: '*'
});

const { PDFUI, appearances:{AdaptiveAppearance}  } = UIExtension;
const appearance = AdaptiveAppearance;
const isMobile = UIExtension.PDFViewCtrl.DeviceInfo.isMobile;

const libPath = "/lib/";
const wrapperElement = document.createElement("div");
wrapperElement.classList.add("fv__catalog-pdfui-wrapper");
wrapperElement.setAttribute('id', 'pdf-ui');
document.body.appendChild(wrapperElement);

const pdfui = new PDFUI({
  i18n: {
    lng: currentLanguage,
  },
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
  addons: libPath + (isMobile
    ? 'uix-addons/allInOne.mobile.js'
    : 'uix-addons/allInOne.js'),
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
    group&&group.setRetainCount(100);
  });
}

window.addEventListener(
  "resize",
  function (e) {
    pdfui.redraw();
  }
);

initSignatureHandlers(pdfui);

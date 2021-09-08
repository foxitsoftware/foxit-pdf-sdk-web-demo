import * as U from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import "./pdfui.less";
import { initSignatureHandlers } from './signature';

export const UIExtension = U;

const libPath = "/lib/";
const { PDFViewCtrl } = UIExtension;
const { DeviceInfo, Events } = PDFViewCtrl;

export function createPDFUI(options) {
  if(window.innerWidth < 900){
    DeviceInfo.isMobile = true
  }else{
    DeviceInfo.isMobile = false
  }
  const elm = document.createElement("div");
  elm.classList.add("fv__catalog-pdfui-wrapper");
  document.body.appendChild(elm);
  const defaultOptions = {
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
    renderTo: elm,
    appearance: UIExtension.appearances.adaptive,
    addons: DeviceInfo.isMobile
      ? "/lib/uix-addons/allInOne.mobile.js"
      : "/lib/uix-addons/allInOne.js",
  };
  const pdfui = new UIExtension.PDFUI(
    Object.assign(defaultOptions, options || {})
  );
  window.pdfui = pdfui;

  pdfui.addUIEventListener("fullscreenchange", function (isFullscreen) {
    if (isFullscreen) {
      document.body.classList.add("fv__pdfui-fullscreen-mode");
    } else {
      document.body.classList.remove("fv__pdfui-fullscreen-mode");
    }
  });

  function openLoadingLayer() {
    return pdfui.loading();
  }
  var loadingComponentPromise = openLoadingLayer();
  var openFileError = null;
  var passwordErrorCode = PDFViewCtrl.PDF.constant.Error_Code.password;
  function startLoading() {
    if (openFileError && openFileError.error === passwordErrorCode) return;
    if (loadingComponentPromise) {
      loadingComponentPromise = loadingComponentPromise
        .then(function (component) {
          component.close();
        })
        .then(openLoadingLayer);
    } else {
      loadingComponentPromise = openLoadingLayer();
    }
  }
  pdfui.addViewerEventListener(Events.beforeOpenFile, startLoading);
  pdfui.addViewerEventListener(Events.openFileSuccess, function () {
    openFileError = null;
    loadingComponentPromise.then(function (component) {
      component.close();
    });
  });
  pdfui.addViewerEventListener(Events.openFileFailed, function (data) {
    openFileError = data;
    if (openFileError && openFileError.error === passwordErrorCode) return;
    loadingComponentPromise.then(function (component) {
      component.close();
    });
  });

  pdfui.addViewerEventListener(Events.startConvert, startLoading);
  pdfui.addViewerEventListener(Events.finishConvert, function () {
    loadingComponentPromise.then(function (component) {
      component.close();
    });
  });

  window.addEventListener(
    DeviceInfo.isDesktop ? "resize" : "orientationchange",
    () => {
      pdfui.redraw();
    }
  );
  initSignatureHandlers(pdfui);
  return pdfui;
}

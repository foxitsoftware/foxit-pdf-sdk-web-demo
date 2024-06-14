import * as U from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import "./pdfui.less";
import { initSignatureHandlers } from './signature';
import {deepCloneAssign} from './util';

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

export const UIExtension = U;

const libPath = "/lib/";
const { PDFViewCtrl, appearances:{AdaptiveAppearance} } = UIExtension;
const { Events } = PDFViewCtrl;
const appearance = AdaptiveAppearance;

export const isMobile = PDFViewCtrl.DeviceInfo.isMobile;
export const isDesktop = PDFViewCtrl.DeviceInfo.isDesktop;

export function createPDFUI(options) {
  const elm = document.createElement("div");
  elm.classList.add("fv__catalog-pdfui-wrapper");
  elm.setAttribute('id', 'pdf-ui');
  document.body.appendChild(elm);
  const defaultOptions = {
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
      messageSyncServiceWorker: {
          options:{
              scope: libPath
          }
      }
    },
    renderTo: elm,
    appearance,
    addons: libPath + (isMobile
      ? 'uix-addons/allInOne.mobile.js'
      : 'uix-addons/allInOne.js'),
  };
  const uiOptions = deepCloneAssign({},defaultOptions, options || {});
  const pdfui = new UIExtension.PDFUI(
    uiOptions
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

  window.addEventListener(
    "resize",
    () => {
      pdfui.redraw();
    }
  );
  initSignatureHandlers(pdfui);
  return pdfui;
}

// Init tab according to the example
export function initTab(pdfui,options){
  const { menuTabName, group=[], mobileTabName} = options
  if(!isMobile){
    if(menuTabName){
      activeComponent()
    }
    let handle = () => {
      if(menuTabName){
        activeComponent();
      }
      pdfui.removeViewerEventListener(Events.renderFileSuccess,handle)
    }
    pdfui.addViewerEventListener(Events.renderFileSuccess, handle);
    function activeComponent(){
      pdfui.getRootComponent().then((root) => {
        const tabComponent = root.getComponentByName(menuTabName);
        if(!tabComponent) {
          return;
        }
        tabComponent.active();
        if(group.length > 0){
          setTimeout(()=>{
            group.forEach(groupItem=>{
              const {groupTabName, groupTabIndex=0, retainCount=100} = groupItem;
              if(groupTabName){
                const tabComponentGroup = root.getAllComponentsByName(groupTabName);
                tabComponentGroup[groupTabIndex] && tabComponentGroup[groupTabIndex].setRetainCount(retainCount);
              }
            })
          })
        }
      });
    }
  }else{
    if(!mobileTabName){return}
    pdfui.addViewerEventListener(Events.openFileSuccess, () => {
      initMobileTab(pdfui,mobileTabName);
    })
  }
}

//Component show/hide control
export function hideComponent(pdfui,componentName){
  pdfui.getRootComponent().then((root) => {
    const component = root.getComponentByName(componentName);
    component.hide();
  });
}

export function initMobileTab(pdfui,tabName){
  return pdfui.getComponentByName("tabs")
    .then(tabs=>{
      return Promise.all([tabs,pdfui.getComponentByName(tabName)])
    })
    .then(([tabs,tab])=>{
      tabs.controller.switchTab(tab);
      tabs.controller.currentTab.active();
    })
}


import * as U from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import Addons from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/uix-addons/allInOne"
import mobileAddons from "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/uix-addons/allInOne.mobile"
import "./pdfui.less";
import { initSignatureHandlers } from './signature';
import {deepCloneAssign} from './util';

export const UIExtension = U;

const libPath = "/lib/";
const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;
export const DeviceInfo = {}
export function createPDFUI(options) {
  if(window.innerWidth <= 900){
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
      ? mobileAddons
      : Addons,
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

// Init tab according to the example
export function initTab(pdfui,options){
  const { menuTabName, group=[], mobileTabName} = options
  if(!DeviceInfo.isMobile){
    if(menuTabName){
      activeComponent()
    }
    pdfui.addViewerEventListener(Events.openFileSuccess, () => {
      if(menuTabName){
        activeComponent();
      }
    });
    function activeComponent(){
      pdfui.getRootComponent().then((root) => {
        const tabComponent = root.getComponentByName(menuTabName);
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
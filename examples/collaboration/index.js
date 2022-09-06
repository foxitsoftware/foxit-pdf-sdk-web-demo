import * as UIExtension from 'UIExtension';
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import "../../common/pdfui.less";
import SockJSCommunicator from "./SockJSCommunicator"
import {
  initSignatureHandlers
} from '../../common/signature';
import {isMobile} from '../../common/pdfui'
const {
  PDFViewCtrl: {
    Events
  },
  modular,
  appearances
} = UIExtension;

// Init pdfui
const libPath = "/lib/";
const elm = document.createElement("div");
elm.classList.add("fv__catalog-pdfui-wrapper");
document.body.appendChild(elm);

const pdfui = new UIExtension.PDFUI({
  viewerOptions: {
    libPath: libPath,
    jr: {
      workerPath: libPath,
      enginePath: libPath + "jr-engine/gsdk/",
      fontPath: "https://webpdf.foxitsoftware.com/webfonts/",
      licenseSN: licenseSN,
      licenseKey: licenseKey,
    },
    collaboration: {
      enable: true,
      communicator: new SockJSCommunicator(location.origin)
    }
  },
  renderTo: elm,
  appearance: appearances.adaptive,
  addons: "/lib/uix-addons/allInOne.js",
});
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
  !isMobile ? "resize" : "orientationchange",
  () => {
    pdfui.redraw();
  }
);
initSignatureHandlers(pdfui);


// collaboration popup
const collaborationPopupTemplate = `
<layer @draggable visible focus="false" append-to="body" class="fv__collaboration-popup right bottom">
  <layer-header title="Collaboration"></layer-header>
  <layer-view @stop-drag>
      <div class="fv__collaboration-link-hint">
          Share this link to collaborate
          with others:
      </div>
      <div class="fv__collaboration-link">
          <input name="collaboration-link-input" @controller="collab:LinkController">
          <xbutton name="collaboration-link-btn" @controller="collab:CopyLinkController">Copy</xbutton>
      </div>
  </layer-view>
</layer>
`
modular.module('collab', [])
  .controller('LinkController', {
    mounted: function () {
      var component = this.component;
      var pdfui = this.getPDFUI();
      var btn = this.getComponentByName('collaboration-link-btn');
      this.addDestroyHook(
        pdfui.addViewerEventListener(Events.openFileSuccess, function () {
          btn.disable();
          pdfui.getCollaboration().then(function (collaboration) {
            collaboration.getShareId().then(function (shareId) {
              var link = location.origin + location.pathname;
              var search = location.search.replace('?', '');
              var queryParameters = [];
              var reg = /([^&=]+)=([^&=]+)/g;
              while (true) {
                var res = reg.exec(search);
                if (!res) {
                  break;
                }
                if (res[1] === 'shareId') {
                  continue;
                }
                queryParameters.push({
                  key: res[1],
                  value: res[2]
                });
              }
              queryParameters.push({
                key: 'shareId',
                value: shareId
              });
              var queries = '?' + queryParameters.map(function (it) {
                return it.key + '=' + it.value
              }).join('&')

              if (typeof history.pushState === 'function') {
                history.pushState('', '', queries);
              }

              component.setValue(link + queries);
              btn.enable();
            });
          })
        })
      )
    }
  })
  .controller('CopyLinkController', {
    handle: function () {
      var linkInput = this.getComponentByName('collaboration-link-input').element;
      linkInput.select();
      document.execCommand('copy');
    }
  });

pdfui.getRootComponent().then(function (root) {
  root.append(collaborationPopupTemplate);
});

var shareId = getQueryParameter(location.search, 'shareId')
if (!shareId) {
  openFile();
} else {
  pdfui.openFileByShareId(shareId).catch(function (ex) {
    pdfui.alert('Unable to open file from this shareId: ' + shareId + '. It is possible that all clients using this shareId have disconnected. Click the OK button below to create new collaborative session under the default PDF file!')
      .then(function () {
        history.replaceState('', '', '?')
        loadingComponentPromise.then(function (component) {
          component.close();
          openFile();
        })
      });
  })
}

function getQueryParameter(query, name) {
  var reg = /([^=&?#]+)\=([^&=?#]+)/g
  while (true) {
    var result = reg.exec(query);
    if (!result) {
      break;
    }
    if (result[1] === name) {
      return result[2];
    }
  }
}

function openFile() {
  pdfui.openPDFByHttpRangeRequest({
    range: {
      url: "/assets/FoxitPDFSDKforWeb_DemoGuide.pdf",
    },
  }, {
    fileName: "FoxitPDFSDKforWeb_DemoGuide.pdf"
  });
}
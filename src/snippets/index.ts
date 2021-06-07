let rotate = 0;
const setStyle = (el:any, display: string) => {
  el.style.display = display
}

export function openSidebar(pdfui: any, sidebarTabName: any) {
  return pdfui.getRootComponent().then((root: any) => {
    const sidebarPanel = root.getComponentByName(sidebarTabName);
    if (sidebarPanel) {
      sidebarPanel.active();
    }
  });
}

export function closeSidebar(pdfui: any) {
  return pdfui.getRootComponent().then((root: any) => {
    const sidebar = root.getComponentByName("sidebar");
    sidebar.collapse();
  });
}

export function rotatePage(pdfui: any) {
  return pdfui
    .getCurrentPDFDoc()
    .then((doc: any) => {
      return doc.getPageByIndex(0);
    })
    .then((page: any) => {
      rotate ? rotate-- : rotate++;
      return page.setRotation(rotate);
    });
}

export function movePage(pdfui: any, fromIndex: number, toIndex: number) {
  return pdfui.getCurrentPDFDoc().then((doc: any) => {
    return doc.movePageTo(fromIndex, toIndex);
  });
}

export function openTab(pdfui: any, tab: string) {
  return pdfui.getRootComponent().then((root: any) => {
    const commentTab = root.getComponentByName(tab);
    commentTab.active();
  });
}

export function createCalloutAnnotation(pdfui: any) {
  return pdfui.getRootComponent().then((root: any) => {
    const commentTab = root.getComponentByName("comment-tab");
    commentTab.active();
    const restore = disableAll(pdfui, "freetext-callout,@alert @xbutton");
    restore();
    return pdfui
      .getCurrentPDFDoc()
      .then((doc: any) => {
        return doc.getPageByIndex(0);
      })
      .then((page: any) => {
        return page.addAnnot({
          type: "freetext",
          intent: "FreeTextCallout",
          subject: "FreeTextCallout",
          "interior-color": 16777215,
          rotate: 0,
          flags: 4,
          calloutLinePoints: [
            { x: 77.35922330097088, y: 453.32038834951464 },
            { x: 238.41456310679615, y: 497.0262135922331 },
            { x: 253.41456310679615, y: 497.0262135922331 },
          ],
          rect: {
            left: 76.35922330097088,
            top: 508.1262135922331,
            right: 354.5145631067962,
            bottom: 452.32038834951464,
          },
          innerRect: {
            left: 253.51456310679615,
            top: 507.1262135922331,
            right: 353.5145631067962,
            bottom: 487.1262135922331,
          },
        });
      });
  });
}

export function createCustomStamp(pdfui: any, url: string) {
  const sepIndex = url.lastIndexOf("/");
  const q = url.lastIndexOf("?");
  if (q > -1) {
    url = url.substring(0, q);
  }
  const filename = url.substring(sepIndex);
  const dotIndex = filename.lastIndexOf(".");
  let ext: any;
  let name = filename;
  if (dotIndex > -1) {
    ext = filename.substring(dotIndex + 1);
    name = filename.substring(0, dotIndex);
  }
  return pdfui
    .getRootComponent()
    .then((root: any) => {
      const commentTab = root.getComponentByName("comment-tab");
      commentTab.active();
      return root;
    })
    .then((root: any) => {
      const stampDropdown = root.getComponentByName("stamp-drop-down-ui");
      stampDropdown.active();
      return loadImage(url).then((size: any) => {
        return pdfui.addAnnotationIcon({
          url,
          name: name,
          category: "customStampDemo",
          fileType: ext,
          width: size.width,
          height: size.height,
        });
      });
    });
}

export function markAndRedactArea(pdfui: any, options = {
  bottom: 586.2299349240782,
  left: 67.04121475054231,
  right: 170.590021691974,
  top: 597.5140997830804
}) {
  return pdfui
      .getCurrentPDFDoc()
      .then((doc: any) => {
          return doc.getPageByIndex(0);
      })
      .then((page: any) => {
          return page.markRedactAnnot([options]);
      }).then((annots: any) => {
          return annots[0];
      }).then((redact: any) => {
          return redact.apply();
      });
}

export function disableAll(pdfui: any, excludeQuerySelector: any) {
  const promise = pdfui.getRootComponent().then((root: any) => {
    const all = root.querySelectorAll(
      "sidebar,@gtab,@xbutton,@dropdown,@dropdown-button,@file-selector,@input,@viewer"
    );
    const excludes = root.querySelectorAll(excludeQuerySelector);
    const allToDisable = all.filter((it: any) => excludes.indexOf(it) === -1);
    return allToDisable.map((it: any) => {
      it.element.classList.add("demo-disabled-ui");
      return it.element;
    });
  });
  return () => {
    return promise.then((allToDisableElement: any) => {
      allToDisableElement.forEach((it: any) => {
        it.classList.remove("demo-disabled-ui");
      });
    });
  };
}

export function hideAll(pdfui: any, excludeQuerySelector: string) {
  const promise = pdfui.getRootComponent().then((root: any) => {
    const all = root.querySelectorAll(
      "sidebar,@gtab,@xbutton,@dropdown,@dropdown-button,@file-selector,@input,@viewer,@group"
    );
    const excludes = root.querySelectorAll(excludeQuerySelector);
    const allToHidden = all.filter((it: any) => excludes.indexOf(it) === -1);
    const hiddenElements = allToHidden.map((it: any) => {
      it.element.classList.add("demo-hidden-ui");
      return it.element;
    });
    excludes.forEach((it: any) => {
      let elm = it.element;
      while (elm && elm.classList) {
        if (elm.classList.contains("demo-hidden-ui")) {
          elm.classList.remove("demo-hidden-ui");
        }
        elm = elm.parentElement;
      }
    });
    return hiddenElements;
  });
  return () => {
    return promise.then((allHiddenElement: any) => {
      allHiddenElement.forEach((it: any) => {
        it.classList.remove("demo-hidden-ui");
      });
    });
  };
}
export function createTextNoteAnnotation(pdfui:any, top:number, left:number) {
  return pdfui.getRootComponent().then((root:any) => {
  const commentTab = root.getComponentByName('comment-tab');
  commentTab.active();
  return Promise.resolve()
  .then(() => {
      return pdfui
          .getCurrentPDFDoc()
          .then((pdfDoc:any) => {
              return pdfDoc.getPageByIndex(0);
          }).then((page:any) => {
              return page.addAnnot({
                  flags: 4,
                  type: 'text',
                  contents: 'Welcome to FoxitPDFSDK for Web',
                  rect: {
                      left,
                      right: left + 40,
                      top,
                      bottom: top - 40 
                  },
                  date: new Date()
              });
          });
      });
  });
}

export function openSignDialog(pdfui:any) {
  const el = document.querySelector('.wrapBlock-flex')
  pdfui.getComponentByName('create-signature').then((inkDialog:any)=>
  { 
    setStyle(el, 'none')
    inkDialog.show();
  });
  pdfui.addViewerEventListener('inkSign-added', function () {
    setStyle(el, 'flex')
  });
  return pdfui;
}

export async function exportData(pdfui:any) {
  const doc = await pdfui.getCurrentPDFDoc();
  const xfdf = await doc.exportFormToFile(2);
  const url = URL.createObjectURL(xfdf);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'form.xfdf';
  a.rel = 'noopener';
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
}
function loadImage(url: string) {
  const image = new Image();
  return new Promise((resolve, reject) => {
    image.onerror = () => {
      // pdfui.alert(`Cannot load image url: ${url}`);
      reject();
    };
    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height,
      });
    };
    image.src = url;
  });
}

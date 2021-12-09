import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';
import { customToolTip } from './custom_tooltip/customToolTip';
import { customFragments, initializationCompleted } from './custom_popup/customPopup';

const { PDFViewCtrl } = UIExtension;
const { DeviceInfo, Events } = PDFViewCtrl;
const File_Type = PDFViewCtrl.PDF.constant.File_Type;
const Annot_Flags = PDFViewCtrl.PDF.annots.constant.Annot_Flags;

const pdfui = createPDFUI({
  viewerOptions:{
    showAnnotTooltip:true,
    showFormFieldTooltip: true,
    customs:{
      activeTooltip: customToolTip
    }
  },
  fragments:customFragments
});
pdfui.initDefaultStamps();
initializationCompleted(pdfui);

//Toolbar element show/hide control
export function openStampDropdown(){
  return pdfui.getComponentByName("stamp-drop-down-ui").then(stampDropdown=>{
    stampDropdown.active();
    setTimeout(()=>{
      if(!stampDropdown.isActive){
        stampDropdown.active();
      }
    })
  });
}

export function openSidebarRightTab(){
  return pdfui.getComponentByName('sidebar-right')
  .then(rightPanel => {
    this.rightPanel = rightPanel;
    rightPanel.show();
    return pdfui.getComponentByName('sidebar-right-tabs');
  }).then(tabs => {
      tabs.openTab('edit-properties-panel');
      tabs.setActivetab('edit-properties-panel');
      return pdfui.getComponentByName('edit-properties');
  }).then(component => {
      return component.setHost({}, 9);
  })
}

export function closeSidebarRightTab(){
  return pdfui.getComponentByName('sidebar-right')
  .then(rightPanel => {
    this.rightPanel = rightPanel;
    rightPanel.hide();
  })
}

// The following section demonstrates creating different types of annotation on the first page.
// This is a common method for creating annotation.
export function createAnnotation(pdfDoc, annotJson, pageIndex) {
  return pdfDoc.getPageByIndex(pageIndex).then((pdfPage) => {
    return pdfPage.addAnnot(annotJson);
  });
}
// Crete a note
export function createTextNoteAnnotationAt(top, left) {
  return pdfui.getRootComponent().then((root) => {
  const commentTab = root.getComponentByName('comment-tab');
  commentTab.active();
  return Promise.resolve()
  .then(() => {
      return pdfui
          .getCurrentPDFDoc()
          .then((pdfDoc) => {
              return pdfDoc.getPageByIndex(0);
          }).then((page) => {
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

// Add a new stamp icon in the stamp list at UI.
export function createCustomStamp(url) {
  const sepIndex = url.lastIndexOf("/");
  const q = url.lastIndexOf("?");
  if (q > -1) {
    url = url.substring(0, q);
  }
  const filename = url.substring(sepIndex);
  const dotIndex = filename.lastIndexOf(".");
  let ext;
  let name = filename;
  if (dotIndex > -1) {
    ext = filename.substring(dotIndex + 1);
    name = filename.substring(0, dotIndex);
  }
  return loadImage(url).then((size) => {
    return pdfui.addAnnotationIcon({
      url,
      name: name,
      category: "customStampDemo",
      fileType: ext,
      width: size.width,
      height: size.height,
    });
  });
}

// Create Square
export function createSquare(pdfDoc, pageIndex) {
  return pdfDoc.getPageByIndex(pageIndex).then((page) => {
    const [left, top] = page.reverseDevicePoint([0, 0], 1, 0);
    return page.addAnnot({
      type: "square",
      opacity: 1,
      flags: Annot_Flags.print,
      date: new Date(),
      rect: {
        left,
        top,
        right: left + 100,
        bottom: top - 100,
      },
    });
  });
}

// Create callout  
export function createCalloutAnnotation() {
  return pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("comment-tab");
    commentTab.active();
    const restore = disableAll("freetext-callout,@alert @xbutton");
    restore();
    return pdfui
      .getCurrentPDFDoc()
      .then((doc) => {
        return doc.getPageByIndex(0);
      })
      .then((page) => {
        return page.addAnnot({
          type: "freetext",
          intent: "FreeTextCallout",
          subject: "FreeTextCallout",
          "interior-color": 16777215,
          rotate: 0,
          flags: 4,
          calloutLinePoints: [
            {
              "x": 12.170681953430176,
              "y": 14.441819190979004
            }, {
              "x": 39.98834991455078,
              "y": 79.03860473632812
            }, {
              "x": 54.98834991455078,
              "y": 79.03860473632812
            }
          ],
          rect: {
            "top": 90.13860321044922,
            "right": 156.08834838867188,
            "bottom": 13.441819190979004,
            "left": 10.47049331665039
          },
          innerRect: {
            "top": 89.13860321044922,
            "right": 155.08834838867188,
            "bottom": 69.13860321044922,
            "left": 55.088348388671875
          },
        });
      });
  });
}

// Create pencil 
export function createPencil(pdfDoc, pageIndex) {
  const points = [
    { x: 767, y: 689, type: 1 },
    { x: 927, y: 689, type: 2 },
    { x: 747, y: 649, type: 1 },
    { x: 947, y: 649, type: 2 },
  ];
  const rect = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  points.forEach((it) => {
    rect.left = Math.min(it.x, rect.left);
    rect.right = Math.max(it.x, rect.left);
    rect.top = Math.min(it.y, rect.top);
    rect.bottom = Math.max(it.y, rect.top);
  });
  return createAnnotation(
    pdfDoc,
    {
      type: "ink",
      flags: Annot_Flags.print,
      rect: rect,
      inkList: points,
    },
    pageIndex
  );
}

// Create highlight
export function createAreaHighlight(pdfDoc, pageIndex) {
  const rect = {
    top: 67.17839813232422,
    right: 765.9221801757812,
    bottom: 51.63336181640625,
    left: 497.05999755859375,
  };
  return createAnnotation(
    pdfDoc,
    {
      flags: Annot_Flags.print,
      type: "highlight",
      rect,
      quadPoints: [
        [
          { x: rect.left, y: rect.left },
          { x: rect.right, y: rect.left },
          { x: rect.left, y: rect.bottom },
          { x: rect.right, y: rect.bottom },
        ],
      ],
      opacity: 1,
      date: new Date(),
    },
    pageIndex
  );
}

// Create typewriter
export function createTypeWriter(pdfDoc, pageIndex) {
  return createAnnotation(
    pdfDoc,
    {
      flags: Annot_Flags.print,
      type: "freetext",
      intent: "FreeTextTypewriter",
      subject: "FreeTextTypewriter",
      contents: "This is an example of creating Typerwriter",
      rect: {
        left: 700,
        right: 936,
        top: 25,
        bottom: 10,
      },
      date: new Date(),
    },
    pageIndex
  );
}

//Create a triangle Note on the page. 
//Double click on this Note will bring up a pop-up window. 
export function createTextNote(pdfDoc, pageIndex) {
  const left = 500;
  const top = 500;
  return createAnnotation(
    pdfDoc,
    {
      flags: Annot_Flags.noZoom | Annot_Flags.readOnly,
      type: "text",
      contents: "Welocome to FoxitPDFSDK for Web",
      rect: {
        left,
        right: left + 40,
        top,
        bottom: top - 40,
      },
      date: new Date(),
    },
    pageIndex
  );
}

// Set the preset callback function for the annotation
export function setDefaultAnnotConfig(type, intent){
  pdfui.setDefaultAnnotConfig((type, intent) => {
    let config={};
    switch (type) {
        case "highlight":
            config.color=0x123456;
            break;
        case "ink":
            config.color=0x234567;
            break;
        case "freetext":
            if(intent=="FreeTextCallout"){
                config.calloutLineEndingStyle=2;
            }
            break;
        default:
            break;
    }
    return config;
  });
}

//Get component element
pdfui.getRootComponent().then((root) => {
  if(!DeviceInfo.isMobile){
    const commentTabGroup = root.getComponentByName("comment-tab-group-text");
    commentTabGroup.setRetainCount(4);
  }
});
pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("comment-tab");
    commentTab.active();
  });
  setDefaultAnnotConfig();
});

//Listening in
pdfui.addViewerEventListener(Events.annotationAdded, (annots) => {
  pdfui
    .getCurrentPDFDoc()
    .then((doc) => {
      return doc.exportAnnotsToFDF(File_Type.fdf, annots.slice(0, 1));
    })
});

//Open file
pdfui
  .openPDFByHttpRangeRequest(
    {
      range: {
        //Default PDF file path
        url: "/assets/3-feature-example_annotations.pdf",
      },
    },
    { fileName: "3-feature-example_annotations.pdf" }
  )
  .then((doc) => {
    Promise.all([
      createTextNote(doc, 0),
      createTypeWriter(doc, 0), 
      createAreaHighlight(doc, 0), 
      createSquare(doc, 0), 
      createPencil(doc, 0), 
      createCustomStamp(location.origin + "/assets/stamp.png"),
    ]);
  });

if(!DeviceInfo.isMobile){
  pdfui.getComponentByName("comment-tab-group-media").then((group) => {
    group.setRetainCount(100);
  });
}

if(!DeviceInfo.isMobile){
  pdfui.getComponentByName("comment-tab-group-media").then((group) => {
    group.setRetainCount(100);
  });
  pdfui.getComponentByName("comment-tab-group-mark").then((group) => {
    group.setRetainCount(1);
  });
}

function disableAll(excludeQuerySelector) {
  const promise = pdfui.getRootComponent().then((root) => {
    const all = root.querySelectorAll(
      "sidebar,@gtab,@xbutton,@dropdown,@dropdown-button,@file-selector,@input,@viewer"
    );
    const excludes = root.querySelectorAll(excludeQuerySelector);
    const allToDisable = all.filter((it) => excludes.indexOf(it) === -1);
    return allToDisable.map((it) => {
      it.element.classList.add("demo-disabled-ui");
      return it.element;
    });
  });
  return () => {
    return promise.then((allToDisableElement) => {
      allToDisableElement.forEach((it) => {
        it.classList.remove("demo-disabled-ui");
      });
    });
  };
}

// Load image
function loadImage(url) {
  const image = new Image();
  return new Promise((resolve, reject) => {
    image.onerror = () => {
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
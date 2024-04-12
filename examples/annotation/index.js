import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import { createPDFUI, initTab, isMobile } from '../../common/pdfui';
import { loadImage } from '../../common/util';
import { customToolTip } from './custom_tooltip/customToolTip';
import { customFragments, initializationCompleted } from './custom_popup/customPopup';

const {
  PDFViewCtrl: {
    Events,
    PDF: {
      constant: {
        File_Type,
        Note_Icon
      },
      annots:{
        constant:{
          Annot_Flags
        }
      }
    }
  }
} = UIExtension;

const pdfui = createPDFUI({
  viewerOptions:{
    showAnnotTooltip:true,
    showFormFieldTooltip: true,
    customs:{
      AnnotTooltip: customToolTip
    }
  },
  fragments:customFragments
});
initTab(pdfui,{
  menuTabName: "comment-tab",
  group:[
    {
      groupTabName: "comment-tab-group-text",
      retainCount: 4
    },
    {
      groupTabName: "comment-tab-group-mark",
      retainCount: 1
    },
    {
      groupTabName: "comment-tab-group-stamp",
      retainCount:4
    }
  ]
});
pdfui.initDefaultStamps();
initializationCompleted(pdfui);

// The following section demonstrates creating different types of annotation on the first page.
// This is a common method for creating annotation.
export function createAnnotation(pdfDoc, annotJson, pageIndex) {
  return pdfDoc.getPageByIndex(pageIndex).then((pdfPage) => {
    return pdfPage.addAnnot(annotJson);
  });
}
// Crete a note
export function createTextNoteAnnotationAt(topValue, leftValue) {
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
            const [left, top] = page.reverseDevicePoint([leftValue, topValue], 1, 0);
            return page.addAnnot({
              flags: 4,
              type: 'text',
              contents: 'This is a note example',
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
  const filename = url.substring(sepIndex + 1);
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
    const [left, top] = page.reverseDevicePoint([50, 400], 1, 0);
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
          contents:"This is a callout example",
          calloutLinePoints: [
            {
                "x": 133.94699096679688,
                "y": 446.92498779296875
            },
            {
                "x": 200.8939971923828,
                "y": 529.5130004882812
            },
            {
                "x": 215.8939971923828,
                "y": 529.5130004882812
            }
          ],
          rect: {
            "top": 540.6129760742188,
            "right": 316.9939880371094,
            "bottom": 439.92498779296875,
            "left": 126.94700622558594
          },
          innerRect: {
            "top": 539.6129760742188,
            "right": 315.9939880371094,
            "bottom": 519.6129760742188,
            "left": 215.9940185546875
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
      color: 0xeeff00
    },
    pageIndex
  );
}

// Create highlight
export function createAreaHighlight(pdfDoc, pageIndex) {
  const rect = {
    "top": 387.9033203125,
    "right": 538.36865234375,
    "bottom": 370.5513000488281,
    "left": 414.12548828125
  };
  return createAnnotation(
    pdfDoc,
    {
      flags: Annot_Flags.print,
      type: "highlight",
      rect,
      coords:[rect],
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
      color: 0xeeff00
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
      contents: "This is a typewriter example",
      rect: {
        top: 422.6910705566406,
        right: 893.6205444335938,
        bottom: 410.06707763671875,
        left: 600.2205810546875
      },
      date: new Date(),
      defaultAppearance:{
        textSize: 20,
        textColor: 0xeeff00
      }
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
      flags: 4,
      type: "text",
      contents: "This is a note example for pop-up window",
      rect: {
        left,
        right: left + 40,
        top,
        bottom: top - 40,
      },
      date: new Date(),
      icon: Note_Icon.Insert
    },
    pageIndex
  );
}

// Set the preset callback function for the annotation
export function setDefaultAnnotConfig(){
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

//Listening in
pdfui.addViewerEventListener(Events.annotationAdded, (annots) => {
  pdfui
    .getCurrentPDFDoc()
    .then((doc) => {
      return doc.exportAnnotsToFDF(File_Type.fdf, [annots[annots[0].getType()==='popup'?1:0]]);
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
      setDefaultAnnotConfig(),
      createCustomStamp(location.origin + "/assets/stamp.png")
    ]);
    if(isMobile){
      Promise.all([
        createTextNoteAnnotationAt(500, 300),
        createCalloutAnnotation()
      ]);
    }
  });

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
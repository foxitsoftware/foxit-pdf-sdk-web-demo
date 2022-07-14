import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import {
  createPDFUI,
  hideComponent,
  isMobile
} from '../../common/pdfui';
import {
  CropPagesStateHandler,
  openRectControlOnPage
} from './cropPage/cropPage'

const {
  PDFViewCtrl
} = UIExtension;
const {
  Events
} = PDFViewCtrl;
const boxType = PDFViewCtrl.PDF.constant.Box_Type
const pdfui = createPDFUI({
  viewerOptions: {
    StateHandlers: [CropPagesStateHandler]
  }
});
hideComponent(pdfui, "download-file-button");

// Set page rotation
let rotate = 0;
export function rotatePage() {
  return pdfui
    .getCurrentPDFDoc()
    .then((doc) => {
      return doc.getPageByIndex(0);
    })
    .then((page) => {
      rotate ? rotate-- : rotate++;
      return page.setRotation(rotate);
    });
}

// Move a specified page to a new index position.
export function movePage(fromIndex, toIndex) {
  return pdfui.getCurrentPDFDoc().then((doc) => {
    return doc.movePageTo(fromIndex, toIndex);
  });
}

// Map font and add it to the UI drop-down font list 
export function setCustomFont() {
  var fontMaps = [{
    nameMatches: [/Rage/, /Rage Italic/, /RageItalic/],
    glyphs: [{
      bold: -1,
      flags: -1,
      url: '/assets/RAGE.TTF'
    }],
    charsets: [0]
  }]
  var fontMapsInfo = [{
    "name": "Rage", //The font face name
    "style": 0, //The font styles
    "charset": 0 //The charset of the font
  },]
  pdfui.getPDFViewer().then(function (viewer) {
    // Map custom font. This method is only valid before loading the document.
    viewer.setJRFontMap(fontMaps).then(function (_) {
      pdfui.openPDFByHttpRangeRequest({
        range: {
          url: '/assets/2-feature-example_edit-pdf.pdf',
        }
      }, {
        fileName: '2-feature-example_edit-pdf.pdf'
      })
      // Adds mapped Font to the drop-down font box in the Edit module
      viewer.addFontMaps(fontMapsInfo)
      // Now you can select the custom font for text editing
    })
  })
}

// Add text graphic object with the custom font on the first page
export function addCustomTextGraphic() {
  return pdfui.getCurrentPDFDoc().then(doc => {
    return doc.getPageByIndex(0).then(page => {
      let pageInfo = page.getInfo();
      let info = {
        type: PDFViewCtrl.PDF.constant.Graphics_ObjectType.Text,
        originPosition: {
          x: 0,
          y: 0
        },
        charspace: 0,
        wordspace: 20,
        textmatrix: [1, 0, 0, 1],
        font: {
          "name": "Rage",
          "styles": 0,
          "charset": 0
        },
        fontSize: 18,
        matrix: [1, 0, 0, 1, 0, pageInfo.height - 30],
        text: "This is a custom font text",
        fillColor: 4288230297,
      };
      return page.addGraphicsObject(info);
    })
  })
}

// How to define a region of the content on the page to be cropped
export function setCropBox(pageIndex = 0) {
  return pdfui.getCurrentPDFDoc().then(pdfDoc => {
    let options = {
      indexes: [pageIndex],
      width:650,
      height:840,
      offsetX: 40,
      offsetY: 40,
      boxes: {
        artBox: {
          left: 0,
          bottom: 0,
          right: 650,
          top: 840
        },
        cropBox: {
          left: 0,
          bottom: 0,
          right: 650,
          top: 840
        },
        trimBox: {
          left: 10,
          bottom: 110,
          right: 510,
          top: 700
        }
      }
    }
    return pdfDoc.setPagesBox(options)
  })
}

// How to get all boxes on the page
export function getAllBoxes(pageIndex = 0) {
  return pdfui.getCurrentPDFDoc().then(pdfDoc => {
    return pdfDoc.getAllBoxesByPageIndex(pageIndex)
  })
}


// How to get a crop dimension on the page
export function getCropDimension(pageIndex = 0, type = boxType.CropBox) {
  return pdfui.getCurrentPDFDoc().then(doc => {
    return doc.getPageByIndex(pageIndex).then(page => {
      return page.getPageBox(type)
    })
  })

}

// How to set a crop dimension on the page by removing the margin
export function setBoxWithoutMargin(pageIndex=2) {
  return pdfui.getCurrentPDFDoc().then(pdfDoc => {
    return pdfDoc.getPageByIndex(pageIndex).then(page => {
      let options = {
        indexes: [pageIndex],
        removeWhiteMargin: true,
      }
      return pdfDoc.setPagesBox(options)
    })
  })
}

// Add the custom css fonts
export function addCustomCssFont(){
  //1.Import font style file
  let linkTag = document.createElement("link");
  linkTag.id = 'dynamic-style';
  linkTag.href = 'https://fonts.googleapis.com/css2?family=Tangerine&display=swap';
  linkTag.setAttribute('rel','stylesheet');
  linkTag.setAttribute('media','all');
  linkTag.setAttribute('type','text/css');
  let head = document.getElementsByTagName("head")[0];
  head.appendChild(linkTag);
  //2. Add the custom font
  pdfui.addCssFonts(['Tangerine'])
}

export function cropPage() {
  goToPage(3);
  pdfui.getStateHandlerManager().then(shm => {
    shm.switchTo(CropPagesStateHandler.getStateName());
    openRectControlOnPage(pdfui);
  })
}

function goToPage(pageIndex) {
  return pdfui.getPDFDocRender().then(pdfDocR => {
    return pdfDocR.goToPage(pageIndex)
  })
}

export function switchToHandStateHandler() {
  pdfui.getStateHandlerManager().then(shm => {
    shm.switchTo(PDFViewCtrl.constants.STATE_HANDLER_NAMES.STATE_HANDLER_HAND);
  })
}

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  if (!isMobile) {
    pdfui.getRootComponent().then((root) => {
      const editTab = root.getComponentByName("edit-tab");
      editTab.active();
    });
  }
});
const callback = () => {
  addCustomTextGraphic();
  pdfui.removeViewerEventListener(Events.renderPageSuccess, callback)
}
pdfui.addViewerEventListener(Events.renderPageSuccess, callback)

setCustomFont();
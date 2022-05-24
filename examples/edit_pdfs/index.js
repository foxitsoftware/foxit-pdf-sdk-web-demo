import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI, hideComponent, isMobile } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;
const pdfui = createPDFUI({});
hideComponent(pdfui,"download-file-button");

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
export function setCustomFont(){
  var fontMaps = [{
        nameMatches: [/Rage/, /Rage Italic/, /RageItalic/],
        glyphs: [
            {
                bold: -1,
                flags: -1,
                url: '/assets/RAGE.TTF'
            }
        ],
        charsets: [0]
    }]
  var fontMapsInfo = [
      {
          "name": "Rage", //The font face name
          "style": 0, //The font styles
          "charset": 0 //The charset of the font
      },
  ]
  pdfui.getPDFViewer().then(function (viewer) {
    // Map custom font. This method is only valid before loading the document.
    viewer.setJRFontMap(fontMaps).then(function (_) {
        pdfui.openPDFByHttpRangeRequest({
            range: {
                url: '/assets/2-feature-example_edit-pdf.pdf',
            }
        }, { fileName: '2-feature-example_edit-pdf.pdf' })
        // Adds mapped Font to the drop-down font box in the Edit module
        viewer.addFontMaps(fontMapsInfo)
        // Now you can select the custom font for text editing
    })
  })
}

// Add text graphic object with the custom font on the first page
export function addCustomTextGraphic(){
  return pdfui.getCurrentPDFDoc().then(doc=>{
    return doc.getPageByIndex(0).then(page=>{
      let pageInfo = page.getInfo();
      let info = {
        type: PDFViewCtrl.PDF.constant.Graphics_ObjectType.Text,
        originPosition : {x:0, y:0},
        charspace: 0,
        wordspace: 20,
        textmatrix: [1,0,0,1],
        font: {
          "name": "Rage",
          "styles": 0,
          "charset": 0
        },
        fontSize:18,
        matrix: [1,0,0,1,0,pageInfo.height - 30],
        text: "This is a custom font text",
        fillColor: 4288230297,
      };
      return page.addGraphicsObject(info);
    })
  })
}

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  if(!isMobile){
    pdfui.getRootComponent().then((root) => {
      const editTab = root.getComponentByName("edit-tab");
      editTab.active();
    });
  }
});
const callback = ()=>{
  addCustomTextGraphic();
  pdfui.removeViewerEventListener(Events.renderPageSuccess,callback)
}
pdfui.addViewerEventListener(Events.renderPageSuccess,callback)

setCustomFont();
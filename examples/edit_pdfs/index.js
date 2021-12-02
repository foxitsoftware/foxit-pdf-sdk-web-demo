import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;

const pdfui = createPDFUI({});

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

// Set custom font
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
                url: '/assets/regeItalic.pdf',
            }
        }, { fileName: 'regeItalic.pdf' })
        // Adds mapped Font to the drop-down font box in the Edit module
        viewer.addFontMaps(fontMapsInfo)
        // Now you can select the custom font for text editing
    })
  })
}

//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
  const downloadLink = root.getComponentByName("download-file-button");
  downloadLink.hide();
});


pdfui.addViewerEventListener(Events.openFileSuccess, () => {
  pdfui.getRootComponent().then((root) => {
    const commentTab = root.getComponentByName("edit-tab");
    commentTab.active();
  });
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      //Default PDF file path
      url: "/assets/2-feature-example_edit-pdf.pdf",
    },
  },
  { fileName: "2-feature-example_edit-pdf.pdf" }
);

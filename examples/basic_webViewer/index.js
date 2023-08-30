import * as PDFViewCtrl from "PDFViewCtrl";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/PDFViewCtrl.css";

const libPath = "/lib/";
const viewerOptions = {
    libPath: libPath,
    jr: {
        workerPath: libPath,
        enginePath: libPath + "jr-engine/gsdk/",
        fontPath: "https://webpdf.foxitsoftware.com/webfonts/",
        licenseSN: licenseSN,
        licenseKey: licenseKey,
    },
    customs: {
        ScrollWrap: PDFViewCtrl.CustomScrollWrap,
    },
};
const pdfViewer = new PDFViewCtrl.PDFViewer(
    viewerOptions
);
pdfViewer.init(document.querySelector('#pdf-viewer'));
window.pdfViewer = pdfViewer;

window.addEventListener(
  "resize",
  function (e) {
    pdfViewer.redraw();
  }
);
const eFileName = document.getElementById('file')
eFileName.onchange = function (e) {
    if (!this.value) {
        return;
    }
    var pdf,fdf;
    for (var i = e.target.files.length; i--;) {
        var file = e.target.files[i];
        var filename = file.name;
        if (/\.pdf$/i.test(filename)) {
            pdf = file
        } else if (/\.(x)?fdf$/i.test(filename)) {
            fdf = file
        }
    }
    pdfViewer.openPDFByFile(pdf, {password: '', fdf: {file: fdf}}).catch(function(e) {
        reopenPDF(pdfViewer, e, {password: '', fdf: {file: fdf}}, eFileName);
    });
    this.value = '';
};
let scale;
let maxScale = 10;
let minScale = 0.01;
document.getElementById('plus').onclick = function () {
    const pdfDocRender = pdfViewer.getPDFDocRender();
    if (!pdfDocRender) {
        return;
    }
    if (!scale) {
        scale = 1;
    } else if (scale > 1) {
        scale += 0.25;
    } else if (scale > 0.1) {
        scale += 0.1;
    } else {
        scale += 0.01;
    }
    if (scale > maxScale) {
        scale = maxScale;
    }
    pdfViewer.zoomTo(scale).catch(function(){});
};
document.getElementById('sub').onclick = function () {
    if (!scale) {
        scale = 1;
    } else if (scale > 1) {
        scale -= 0.25;
    } else if (scale > 0.2) {
        scale -= 0.1;
    } else {
        scale -= 0.01;
    }
    if (scale < minScale) {
        scale = minScale;
    }
    pdfViewer.zoomTo(scale).catch(function(){});
};
function reopenPDF (viewer, ex, options, eFileName) {
    if (ex && ex.error === 3) {
        var result = prompt('Please input password');
        if (result) {
            var reopenOptions = Object.assign({}, options, {password: result})
            pdfViewer.reopenPDFDoc(ex.pdfDoc, reopenOptions);
        } else {
            eFileName.textContent = '';
        }
    }
}
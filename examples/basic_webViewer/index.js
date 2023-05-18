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

document.getElementById('file').onchange = function (e) {
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
    pdfViewer.openPDFByFile(pdf, {password: '', fdf: {file: fdf}});
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
    } else {
        scale += 0.25;
    }
    if (scale > maxScale) {
        scale = maxScale;
    }
    pdfViewer.zoomTo(scale).catch(function(){});
};
document.getElementById('sub').onclick = function () {
    if (!scale) {
        scale = 1;
    } else {
        scale -= 0.25;
    }
    if (scale < minScale) {
        scale = minScale;
    }
    pdfViewer.zoomTo(scale).catch(function(){});
};
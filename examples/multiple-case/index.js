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
function createPDFViewer(containerId) {
    const pdfViewer = new PDFViewCtrl.PDFViewer(
        viewerOptions
    );

    var eContainer = document.getElementById(containerId);
    var eSelectPDFFile = eContainer.querySelector('[name=select-pdf-file]');
    var eRenderTo = eContainer.querySelector('.pdf-viewer');

    pdfViewer.init(eRenderTo);

    eSelectPDFFile.onchange = function(e) {
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
    }

    function onresize() {
        pdfViewer.redraw();
    }
    window.addEventListener('resize', onresize);

    pdfViewer.addDestroyHook(function() {
        window.removeEventListener('resize', onresize);
    })
    return pdfViewer;
}

createPDFViewer('pdf-app-0')
createPDFViewer('pdf-app-1')
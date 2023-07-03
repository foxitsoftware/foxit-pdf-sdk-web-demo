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
function createPDFViewer(containerId, open, openOptions) {
    const pdfViewer = new PDFViewCtrl.PDFViewer(
        viewerOptions
    );

    var eContainer = document.getElementById(containerId);
    var eSelectPDFFile = eContainer.querySelector('[name=select-pdf-file]');
    var eFileName = eContainer.querySelector('.fv__viewer-file-name');
    var eRenderTo = eContainer.querySelector('.pdf-viewer');

    pdfViewer.init(eRenderTo);
    eFileName.textContent = openOptions.fileName;

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
                eFileName.textContent = filename;
            } else if (/\.(x)?fdf$/i.test(filename)) {
                fdf = file
            }
        }
        pdfViewer.openPDFByFile(pdf, {password: '', fdf: {file: fdf}}).catch(function(e) {
            if (e && e.error === 3) {
                var result = prompt('Please input password');
                if (result) {
                    pdfViewer.reopenPDFDoc(e.pdfDoc, {password: result, fdf: {file: fdf}});
                } else {
                    eFileName.textContent = '';
                }
            }
        });
        this.value = '';
    }

    function onresize() {
        pdfViewer.redraw();
    }
    window.addEventListener('resize', onresize);

    pdfViewer.addDestroyHook(function() {
        window.removeEventListener('resize', onresize);
    })
    pdfViewer.openPDFByHttpRangeRequest(open, openOptions);
    return pdfViewer;
}

var pdfViewer0 = createPDFViewer('pdf-app-0', {
        range: {
            url: "/assets/1-feature-example_default-setup.pdf",
        },
    },
    { fileName: "1-feature-example_default-setup.pdf" }
)
var pdfViewer1 = createPDFViewer('pdf-app-1', {
        range: {
            url: "/assets/1-feature-example_default-setup.pdf",
        },
    },
    { fileName: "1-feature-example_default-setup.pdf" }
)
import * as PDFViewCtrl from "PDFViewCtrl";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/PDFViewCtrl.css";
import enUS from "../../src/i18n/locales/en-US.json";
import zhCN from"../../src/i18n/locales/zh-CN.json";
import zhTW from "../../src/i18n/locales/zh-TW.json";

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
            reopenPDF(pdfViewer, e, {password: '', fdf: {file: fdf}}, eFileName);
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

var pdfViewer0 = createPDFViewer('pdf-app-0', {
        range: {
            url: "/assets/1-feature-example_default-setup.pdf",
        },
    },
    { fileName: "1-feature-example_default-setup.pdf" }
)
var pdfViewer1 = createPDFViewer('pdf-app-1', {
        range: {
            url: "/assets/PDFViewer_Multiple_Instances.pdf",
        },
    },
    { fileName: "PDFViewer_Multiple_Instances.pdf" }
)

const translations = {
    'en-US': enUS,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
};

let currentLanguage = 'en-US';

function replaceI18nStrings(language = currentLanguage) {  
    const elements = document.querySelectorAll('[data-i18n]');  
    elements.forEach((element) => {  
      const key = element.getAttribute('data-i18n');  
      element.textContent = translations[language]["MultipleCase"][key];  
    });  
}

const getMessage = (event) => {
    let Data;
    try {
      Data = JSON.parse(event.data);
    } catch (error) {
      return;
    }
    if (Data.hasOwnProperty("language")){
      let language = Data.language;
      if(currentLanguage !== language ){
        currentLanguage = language;
        replaceI18nStrings(language);
      }
    }
};

window.addEventListener('DOMContentLoaded', e => replaceI18nStrings());
window.addEventListener("message", getMessage, false);
window.top?.postMessage('ready', {
    targetOrigin: '*'
});
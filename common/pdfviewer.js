import * as P from "PDFViewCtrl";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/PDFViewCtrl.css";
import {deepCloneAssign} from './util';

export const PDFViewCtrl = P;

const libPath = "/lib/";

export function createPDFViewer (options) {
    const elm = document.createElement("div");
    document.body.appendChild(elm);
    const defaultOptions = {
        libPath: libPath,
        jr: {
            workerPath: libPath,
            enginePath: libPath + "jr-engine/gsdk/",
            fontPath: "https://webpdf.foxitsoftware.com/webfonts/",
            licenseSN: licenseSN,
            licenseKey: licenseKey,
        },
    };
    const viewerOptions = deepCloneAssign({},defaultOptions, options || {});
    const pdfViewer = new PDFViewCtrl.PDFViewer(
        viewerOptions
    );
    pdfViewer.init(elm);
    window.pdfViewer = pdfViewer;
    return pdfViewer;
}
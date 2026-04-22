import * as P from "PDFViewCtrl";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/PDFViewCtrl.css";
import {deepCloneAssign} from './util';
import { createPdfViewerShadowMount } from './pdfViewShadowMount';

export const PDFViewCtrl = P;

const libPath = "/lib/";

export function createPDFViewer (options) {
    const elm = document.createElement("div");
    document.body.appendChild(elm);
    const { mountEl, containerRoot } = createPdfViewerShadowMount(elm, libPath);
    const defaultOptions = {
        libPath: libPath,
        jr: {
            workerPath: libPath,
            enginePath: libPath + "jr-engine/gsdk/",
            fontPath: "https://webpdf.foxitsoftware.com/webfonts/",
            licenseSN: licenseSN,
            licenseKey: licenseKey,
        }
    };
    const viewerOptions = deepCloneAssign({}, defaultOptions, options || {});
    viewerOptions.customs = Object.assign({}, viewerOptions.customs || {}, {
        containerRoot: containerRoot,
    });
    const pdfViewer = new PDFViewCtrl.PDFViewer(
        viewerOptions
    );
    pdfViewer.init(mountEl);
    window.pdfViewer = pdfViewer;
    return pdfViewer;
}
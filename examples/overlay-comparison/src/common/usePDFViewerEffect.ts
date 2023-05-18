import { useEffect } from "react";
import { PDFViewer } from "../foxit-sdk";

export function usePDFViewerEffect(
    callback: (pdfViewer: PDFViewer) => void,
    pdfViewerRef:
        | undefined
        | React.MutableRefObject<PDFViewer | undefined>
        | React.RefObject<PDFViewer | undefined>
) {
    useEffect(() => {
        const pdfViewer = pdfViewerRef?.current;
        if (!pdfViewer) {
            return;
        }
        return callback(pdfViewer);
    }, [pdfViewerRef]);
}

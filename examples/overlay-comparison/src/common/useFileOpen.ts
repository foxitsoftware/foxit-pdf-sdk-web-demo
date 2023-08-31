import React, { useEffect } from 'react';
import { PDFDoc, PDFViewer, ViewerEvents } from '../foxit-sdk';
import { usePDFViewerEvent } from './usePDFViewerEvent';

export function useFileOpen(
    listener: (pdfViewer: PDFViewer, doc: PDFDoc) => void,
    pdfViewerRef:
        | undefined
        | React.MutableRefObject<PDFViewer | undefined>
        | React.RefObject<PDFViewer | undefined>
) {
    usePDFViewerEvent(
        ViewerEvents.openFileSuccess,
        listener,
        pdfViewerRef
    );
}

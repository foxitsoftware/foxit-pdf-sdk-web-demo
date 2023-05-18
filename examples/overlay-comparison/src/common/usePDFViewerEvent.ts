import { ViewerEvents, PDFViewer } from '../foxit-sdk';
import { usePDFViewerEffect } from './usePDFViewerEffect';

export function usePDFViewerEvent<T extends any[]>(
    eventName: ViewerEvents,
    listener: (pdfViewer: PDFViewer, ...args: T) => void,
    pdfViewerRef:
        | undefined
        | React.MutableRefObject<PDFViewer | undefined>
        | React.RefObject<PDFViewer | undefined>
) {
    usePDFViewerEffect(pdfViewer => {
        const eventEmitter = pdfViewer.getEventEmitter();

        const eventListener = (...args: any[]) => {
            listener(pdfViewer, ...args as T);
        };

        eventEmitter.on(
            eventName as unknown as string,
            eventListener
        );

        return () => {
            eventEmitter.off(
                eventName as unknown as string,
                eventListener
            );
        };
    },pdfViewerRef);
}

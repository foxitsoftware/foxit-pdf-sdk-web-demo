import React, { useContext, useEffect, useRef } from "react";
import { ResultPDFViewerInstanceContext, SourcePDFViewerInstanceContext, TargetPDFViewerInstanceContext } from "../contexts/PDFViewerContexts";
import { ViewerOperationDataContext } from "../contexts/ViewerOperationDataContext";
import { PDFViewer, ViewerEvents } from "../foxit-sdk";
import { onUserScroll } from "./onUserScroll";
import { scrollToBottom, scrollToTop } from "./page-operations";
import { useContextRef } from "./useContextRef";
import { useFileOpen } from "./useFileOpen";
import { usePDFViewerEvent } from "./usePDFViewerEvent";

export function useSyncPage(pdfViewerRef: React.RefObject<PDFViewer | undefined>) {
    const viewerOperationDataRef = useContextRef(ViewerOperationDataContext);
    const lockedGotoPageEventRef = useRef(false);
    
    const sourcePDFViewerInstanceRef = useContext(SourcePDFViewerInstanceContext);
    const targetPDFViewerInstanceRef = useContext(TargetPDFViewerInstanceContext);
    const resultPDFViewerInstanceRef = useContext(ResultPDFViewerInstanceContext);
    
    const syncScroll = (viewerRef: React.RefObject<PDFViewer> | undefined, scrollX: number, scrollY: number) => {
        const viewer = viewerRef?.current;
        if(!viewer || viewer === pdfViewerRef.current) {
            return;
        }
        const { data } = viewerOperationDataRef.current;
        
        const pageRender = viewer.getPDFPageRender(data.currentPageIndex);
        if(!pageRender) {
            return;
        }
        if(isFinite(scrollX) && isFinite(scrollY)) {
            viewer.getScrollWrap().scrollBy(scrollX, scrollY);
        }
    };
    
    useFileOpen(() => {
        const { dispatch: dispatchViewerOperationData } = viewerOperationDataRef.current;
        dispatchViewerOperationData && dispatchViewerOperationData({
            currentPageIndex: 0
        })
    }, pdfViewerRef);
    
    usePDFViewerEvent(
        ViewerEvents.pageNumberChange,
        (pdfViewer, pageNumber: number) => {
            if(lockedGotoPageEventRef.current || !viewerOperationDataRef.current) {
                return;
            }
            const { dispatch: dispatchViewerOperationData } = viewerOperationDataRef.current;
            const currentPageIndex = pageNumber - 1;
            
            const sourcePDFViewer = sourcePDFViewerInstanceRef?.current;
            const resultPDFViewer = resultPDFViewerInstanceRef?.current;
            const targetPDFViewer = targetPDFViewerInstanceRef?.current;
            
            if(!!sourcePDFViewer && sourcePDFViewer !== pdfViewer) {
                jumpPage(sourcePDFViewer, currentPageIndex);
            }
            
            if(!!resultPDFViewer && resultPDFViewer !== pdfViewer) {
                jumpPage(resultPDFViewer, currentPageIndex);
            }
            
            if(!!targetPDFViewer && targetPDFViewer !== pdfViewer) {
                jumpPage(targetPDFViewer, currentPageIndex);
            }
            
            dispatchViewerOperationData && dispatchViewerOperationData({
                currentPageIndex: currentPageIndex
            });
        },
        pdfViewerRef
    )
    
    useEffect(() => {
        const pdfViewer = pdfViewerRef.current;
        if(!pdfViewer) {
            return;
        }
        
        const { data: viewerOperationData } = viewerOperationDataRef.current;
        const scrollHost = pdfViewer.getScrollWrap().getScrollHost() as HTMLElement;

        return onUserScroll(scrollHost, (x, y) => {
            const doc = pdfViewer.getCurrentPDFDoc();
            if(!doc) {
                return;
            }
            
            const pageIndex = Math.min(doc.getPageCount() - 1, viewerOperationData.currentPageIndex);
            const pageRender = pdfViewer.getPDFPageRender(pageIndex)
            if(!pageRender) {
                return;
            }
            syncScroll(sourcePDFViewerInstanceRef, x, y);
            syncScroll(resultPDFViewerInstanceRef, x, y);
            syncScroll(targetPDFViewerInstanceRef, x, y);
        })
    }, [pdfViewerRef.current]);
}

async function jumpPage(pdfViewer: PDFViewer, newPageIndex: number) {
    const docRender = pdfViewer.getPDFDocRender();
    if(!docRender) {
        return;
    }
    if(newPageIndex < 0 || newPageIndex + 1 > docRender.getPDFDoc()?.getPageCount()) {
        return;
    }
    const currentPageIndex = docRender.getCurrentPageIndex();
    if(currentPageIndex === newPageIndex) {
        return;
    }
    await docRender.goToPage(newPageIndex);
    
    if(newPageIndex > currentPageIndex) {
        scrollToTop(pdfViewer);
    } else {
        scrollToBottom(pdfViewer);
    }
}
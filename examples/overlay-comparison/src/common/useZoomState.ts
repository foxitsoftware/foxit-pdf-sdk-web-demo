import React, { useEffect } from "react";
import { ViewerOperationDataContext } from "../contexts/ViewerOperationDataContext";
import { PDFPageRender, PDFViewer, ViewerEvents } from "../foxit-sdk";
import { useContextRef } from "./useContextRef";
import { useFileClose } from "./useFileClose";
import { usePDFViewerEvent } from "./usePDFViewerEvent";

export function useZoomState(pdfViewerRef: React.RefObject<PDFViewer | undefined>) {
    const viewerOperationDataRef = useContextRef(ViewerOperationDataContext);
    
    usePDFViewerEvent(ViewerEvents.renderPageSuccess, (pdfViewer, ...args: any[]) => {
        const pageRender = args[0] as PDFPageRender;
        
        if(!(pageRender instanceof PDFPageRender)) {
            return;
        }
        
        if(!viewerOperationDataRef.current) {
            return;
        }
        const { data: viewerOperationData, dispatch: dispatchViewerOperationData } = viewerOperationDataRef.current;
        if(isNaN(viewerOperationData.initScale)) {
            dispatchViewerOperationData && dispatchViewerOperationData({
                initScale: pageRender.getScale()
            });
        } else if(isNaN(viewerOperationData.scale)) {
            const initScale = Math.min(viewerOperationData.initScale, pageRender.getScale());
            dispatchViewerOperationData && dispatchViewerOperationData({
                initScale: initScale,
                scale: initScale
            });
        }
    }, pdfViewerRef);
    
    useFileClose(() => {
        if(!viewerOperationDataRef.current) {
            return;
        }
        const { data: viewerOperationData, dispatch: dispatchViewerOperationData } = viewerOperationDataRef.current;
        
        if(!isNaN(viewerOperationData.scale)) {
            dispatchViewerOperationData && dispatchViewerOperationData({
                scale: NaN,
                initScale: NaN
            })
        }
    }, pdfViewerRef);
    
    useEffect(() => {
        if(!viewerOperationDataRef.current) {
            return;
        }
        const { data: viewerOperationData } = viewerOperationDataRef.current;
        
        const pdfViewer = pdfViewerRef.current;
        if(!pdfViewer) {
            return;
        }

        const newScale = viewerOperationData.scale;
        if(isNaN(newScale)) {
            return;
        }
        const pageRender = pdfViewer.getPDFPageRender(viewerOperationData.currentPageIndex);
        if(!pageRender || newScale !== pageRender.getScale()) {
            const doc = pdfViewer.getCurrentPDFDoc();
            if(!doc) {
                return;
            }
            const pageRender = pdfViewer.getPDFPageRender(0);
            if(!pageRender)  {
                return;
            }
            pdfViewer.zoomTo(newScale).then(() => {
                (pdfViewer.getPDFDocRender() as any)?.move();
            });
        }
    }, [pdfViewerRef, viewerOperationDataRef.current]);
}
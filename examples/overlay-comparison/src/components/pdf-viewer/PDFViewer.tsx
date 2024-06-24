import React, { ForwardedRef, forwardRef, memo, useImperativeHandle, useRef } from 'react';
import { PDFViewer, User_Permissions, TinyViewerUI, IContextMenu, CustomScrollWrap } from '../../foxit-sdk';
// import { licenseKey, licenseSN } from '../../../../../license-key';
import { fontPath, libPath } from '../../common/paths';
import { useZoomState } from '../../common/useZoomState';
import { useSyncPage } from '../../common/useSyncPage';
import { usePDFViewerEffect } from '../../common/usePDFViewerEffect';
import { OverlayComparisonViewMode } from '../../extensions/OverlayComparisonViewMode';
import { useOCViewMode } from '../../common/useOCViewMode';

let viewerCount = 0;

function PDFViewerRender(props: Record<string, any>, ref: ForwardedRef<PDFViewer>) {
    const divRef = useRef<HTMLDivElement>(null);
    const pdfViewerRef = useRef<PDFViewer>();

    useZoomState(pdfViewerRef);
    useSyncPage(pdfViewerRef);
    useOCViewMode(pdfViewerRef);
    
    useImperativeHandle(ref, () => {
        if(pdfViewerRef.current) {
            return pdfViewerRef.current;
        }
        const element = divRef.current as HTMLDivElement;
        const pdfViewer = new PDFViewer({
            libPath: libPath,
            jr: {
                licenseSN: licenseSN,
                licenseKey: licenseKey,
                workerPath: libPath,
                enginePath: libPath + '/jr-engine/gsdk',
                fontPath: fontPath,
            },
            Viewmodes: [
                OverlayComparisonViewMode
            ],
            viewerUI:new class extends TinyViewerUI {
                createContextMenu(): IContextMenu | undefined {
                    // prevents all built-in right click menus
                    return undefined;
                }
            },
            customs: {
                ScrollWrap: CustomScrollWrap,
                getDocPermissions: () => {
                    return User_Permissions.print;
                }
            },
            tileSize: 300,
            defaultViewMode: OverlayComparisonViewMode.getName()
        });
        pdfViewer.init(element);
        pdfViewerRef.current = pdfViewer;

        if(process.env.NODE_ENV === 'development') {
            viewerCount ++;
            (window as any)['pdfViewer'+viewerCount] = pdfViewer;
        }
        
        return pdfViewer;
    });
    
    usePDFViewerEffect(pdfViewer => {
        const onWindowResize = () => {
            pdfViewer.redraw();
        };
        window.addEventListener('resize', onWindowResize);
        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, pdfViewerRef);
    return (<div ref={divRef}></div>)
}

export const PDFViewerComponent = memo(forwardRef(PDFViewerRender));
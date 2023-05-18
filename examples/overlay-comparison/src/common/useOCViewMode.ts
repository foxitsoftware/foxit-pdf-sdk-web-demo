import React, { useEffect } from 'react';
import { PDFViewer } from '../foxit-sdk';
import { addEventListener, compose } from './events';
import {
    hasNextPage,
    hasPrevPage,
    gotoPrevPage,
    gotoNextPage,
    isScrolledToBottom,
    isScrolledToTop,
    scrollPage,
    gotoLastPage,
    gotoFirstPage,
    scrollViewport,
} from './page-operations';

enum KeyCodes {
    PageUp = 33,
    PageDown = 34,
    End = 35,
    Home = 36,
    LeftArrow = 37,
    UpArrow = 38,
    RightArrow = 39,
    DownArrow = 40,
}

export function useOCViewMode(
    pdfViewerRef:
        | React.RefObject<PDFViewer>
        | React.MutableRefObject<PDFViewer | undefined>
) {
    useEffect(() => {
        const pdfViewer = pdfViewerRef.current;
        if (!pdfViewer) {
            return;
        }
        const scrollHost = pdfViewer
            .getScrollWrap()
            .getScrollHost() as HTMLElement;
        let isMouseOverCurrentViewer = false;
        
        let isContinuouslyWheel = false;
        let mouseWheelTimmerId: number | undefined;
        
        return compose(
            addEventListener(scrollHost, 'mouseenter', () => {
                isMouseOverCurrentViewer = true;
            }),
            addEventListener(scrollHost, 'mouseleave', () => {
                isMouseOverCurrentViewer = false;
            }),
            addEventListener(
                document.body,
                'keydown',
                (event: KeyboardEvent) => {
                    if (event.shiftKey || event.ctrlKey || event.metaKey) {
                        return;
                    }
                    if (!isMouseOverCurrentViewer) {
                        return;
                    }
                    switch (event.keyCode) {
                        case KeyCodes.LeftArrow:
                            if (hasPrevPage(pdfViewer)) {
                                return gotoPrevPage(pdfViewer);
                            }
                            break;
                        case KeyCodes.RightArrow:
                            if (hasNextPage(pdfViewer)) {
                                return gotoNextPage(pdfViewer);
                            }
                            break;
                        case KeyCodes.UpArrow:
                            if (!isScrolledToTop(pdfViewer)) {
                                scrollPage(pdfViewer, 0, -10);
                            } else if (hasPrevPage(pdfViewer)) {
                                gotoPrevPage(pdfViewer);
                            }
                            break;
                        case KeyCodes.DownArrow:
                            if (!isScrolledToBottom(pdfViewer)) {
                                scrollPage(pdfViewer, 0, 10);
                            } else if (hasNextPage(pdfViewer)) {
                                gotoNextPage(pdfViewer);
                            }
                            break;
                        case KeyCodes.End:
                            if (hasNextPage(pdfViewer)) {
                                gotoLastPage(pdfViewer);
                            }
                            break;
                        case KeyCodes.Home:
                            if (hasPrevPage(pdfViewer)) {
                                gotoFirstPage(pdfViewer);
                            }
                            break;
                        case KeyCodes.PageUp:
                            if (isScrolledToTop(pdfViewer)) {
                                if (hasPrevPage(pdfViewer)) {
                                    gotoPrevPage(pdfViewer);
                                }
                            } else {
                                scrollViewport(pdfViewer, -1); // Scroll up one viewport height
                            }
                            break;
                        case KeyCodes.PageDown:
                            if (isScrolledToBottom(pdfViewer)) {
                                if (hasNextPage(pdfViewer)) {
                                    gotoNextPage(pdfViewer);
                                }
                            } else {
                                scrollViewport(pdfViewer, 1); // Scroll down one viewport height
                            }
                            break;
                    }
                }
            ),
            addEventListener(scrollHost, 'wheel', (e) => {
                if(e.ctrlKey || e.shiftKey || e.metaKey) {
                    return;
                }
                if(isContinuouslyWheel) {
                    return
                }
                isContinuouslyWheel = true;
                
                clearTimeout(mouseWheelTimmerId);
                mouseWheelTimmerId = setTimeout(() => {
                    isContinuouslyWheel = false;
                }, 300) as unknown as number;
                
                if (e.deltaY < 0) {
                    if (isScrolledToTop(pdfViewer) && hasPrevPage(pdfViewer)) {
                        gotoPrevPage(pdfViewer);
                    }
                } else if (e.deltaY > 0) {
                    if (isScrolledToBottom(pdfViewer) && hasNextPage(pdfViewer)) {
                        gotoNextPage(pdfViewer);
                    }
                }
            })
        );
    }, [pdfViewerRef]);
}

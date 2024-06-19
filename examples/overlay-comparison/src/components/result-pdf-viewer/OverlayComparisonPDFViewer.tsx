import React, { ForwardedRef, forwardRef, memo, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { PDFDoc, PDFViewer, TinyViewerUI, IContextMenu, CustomScrollWrap, PDFPageRender, ImageData, PDFViewCtrl } from '../../foxit-sdk';
// import { licenseKey, licenseSN } from '../../../../../license-key';
import { fontPath, libPath } from '../../common/paths';
import { SelectedPDFDocContext } from '../../contexts/SelectedPDFDocContext';
import { SourcePDFViewerInstanceContext, TargetPDFViewerInstanceContext } from '../../contexts/PDFViewerContexts';
import { useDebounce } from '../../common/useDebounce';
import { useZoomState } from '../../common/useZoomState';
import { useSyncPage } from '../../common/useSyncPage';
import { usePDFViewerEffect } from '../../common/usePDFViewerEffect';
import { ResultDocContext } from '../../contexts/ResultDocContext';
import { OverlayComparisonViewMode } from '../../extensions/OverlayComparisonViewMode';
import { useOCViewMode } from '../../common/useOCViewMode';
import { ViewerOperationDataContext } from '../../contexts/ViewerOperationDataContext';
import { useContextRef } from '../../common/useContextRef';
import { useComparisonOptions } from '../../common/useComparisonOptions';

interface DiffResultImageData {
    buffer: ArrayBuffer;
    width: number;
    height: number;
}

function PDFViewerRender(props: Record<string, any>, ref: ForwardedRef<PDFViewer>) {
    const divRef = useRef<HTMLDivElement>(null);
    const pdfViewerRef = useRef<PDFViewer>();
    
    const { doc: resultDoc, dispatch: dispatchResultDoc } = useContext(ResultDocContext);
    
    const diffResultCacheRef = useRef<Record<string, HTMLCanvasElement | undefined>>({});
    
    const renderingImagesRef = useRef<Record<number, HTMLCanvasElement>>({});
    
    const { data: selectedPDFDocs } = useContext(SelectedPDFDocContext);
    const srcPDFViewerRef = useContext(SourcePDFViewerInstanceContext);
    const targetPDFViewerRef = useContext(TargetPDFViewerInstanceContext);
    
    const { dataRef: operateOptionsRef, reset: resetComparisonOptions } = useComparisonOptions();

    const [ opacityChangeState, setOpacityChange ] = useState<number>();
    
    const viewerOperationDataRef = useContextRef(ViewerOperationDataContext);
    
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
            messageSyncServiceWorker: {
                options:{
                    scope: libPath
                }
            },
            Viewmodes: [OverlayComparisonViewMode],
            viewerUI:new class extends TinyViewerUI {
                createContextMenu(): IContextMenu | undefined {
                    // prevents all built-in right click menus
                    return undefined;
                }
            },
            customs: {
                ScrollWrap: CustomScrollWrap,
                PageCustomRender: class {
                    constructor (private eCustom: HTMLElement, private pdfPageRender: PDFPageRender) {}
                    render() {
                        while(this.eCustom.firstChild) {
                            this.eCustom.removeChild(this.eCustom.firstChild);
                        }
                        const canvasRecord = renderingImagesRef.current;
                        const pageIndex = (this.pdfPageRender as any).index;
                        const canvas = canvasRecord[pageIndex];
                        if(!canvas) {
                            return;
                        }
                        canvas.style.cssText += `
                            width: 100%;
                            height: 100%;
                        `;
                        this.eCustom.appendChild(canvas);
                    }
                    destroy() {}
                }
            } as any,
            tileSize: 300,
            defaultViewMode: OverlayComparisonViewMode.getName()
        });
        pdfViewer.init(element);
        pdfViewerRef.current = pdfViewer;

        if(process.env.NODE_ENV === 'development') {
            (window as any)['resultPDFViewer'] = pdfViewer;
        }
        
        return pdfViewer;
    });
    
    usePDFViewerEffect((pdfViewer) => {
        const onWindowResize = () => {
            pdfViewer.redraw();
        };
        window.addEventListener('resize', onWindowResize);
        
        const optionService = pdfViewer.getOverlayComparisonOptionsService();
        const offSourceOpacityChange = optionService.onChange('sourceOpacity', () => {
            setOpacityChange(Date.now());
        });
        const offTargetOpacityChange = optionService.onChange('targetOpacity', () => {
            setOpacityChange(Date.now());
        });
        
        return () => {
            offSourceOpacityChange();
            offTargetOpacityChange();
            window.removeEventListener('resize', onWindowResize);
        };
    }, pdfViewerRef);
    
    useDebounce(() => {
        const pdfViewer = pdfViewerRef.current;
        const srcPDFViewer = srcPDFViewerRef?.current;
        const targetPDFViewer = targetPDFViewerRef?.current;
        
        if(!resultDoc || !pdfViewer || !targetPDFViewer || !srcPDFViewer || !viewerOperationDataRef.current) {
            return;
        }
        
        const { data: viewerOperationData } = viewerOperationDataRef.current;
        const currentPageIndex = viewerOperationData.currentPageIndex;
        const scale = viewerOperationData.scale;
        
        if(currentPageIndex < 0 || isNaN(scale)) {
            return;
        }

        const handleOverlayComparison = async () => {
            const service = pdfViewer.getOverlayComparisonService();
            const srcDoc = await selectedPDFDocs[0];
            const targetDoc = await selectedPDFDocs[1];
            if(!srcDoc || !targetDoc || !diffResultCacheRef.current) {
                return;
            }
            const resultPageRender = pdfViewer.getPDFPageRender(currentPageIndex);
            if(!resultPageRender) {
                return;
            }
            
            const srcPageCount = srcDoc.getPageCount();
            const targetPageCount = targetDoc.getPageCount();
            
            const srcIndex = Math.min(currentPageIndex, srcPageCount - 1);
            const targetIndex = Math.min(currentPageIndex, targetPageCount - 1);
            
            const operateOptions = operateOptionsRef.current;
            
            const isTheSamePage = srcIndex == currentPageIndex && targetIndex == currentPageIndex;
            
            const transformation = isTheSamePage ? {
                translateX: operateOptions.translateX * scale,
                translateY: operateOptions.translateY * scale,
                rotate: operateOptions.rotate
            } : {
                translateX: 0,
                translateY: 0,
                rotate: 0
            };
            
            const optionsService = pdfViewer.getOverlayComparisonOptionsService();
            
            const diffResultKey = JSON.stringify({
                index: Math.max(srcIndex, targetIndex),
                scale,
                transformation,
                options: optionsService.extractAllOptions()
            });
            
            let diffResultCanvas: HTMLCanvasElement | undefined = diffResultCacheRef.current[diffResultKey];
            
            if(!diffResultCanvas) {
                const srcBitmap = await getPageBitmap(srcDoc, currentPageIndex, scale);
                const targetBitmap = await getPageBitmap(targetDoc, currentPageIndex, scale);
                
                if(srcBitmap || targetBitmap) {
                    const bitmap = (srcBitmap || targetBitmap)!;
                    
                    const actSrcBitmap = srcBitmap || createBlankBitmap(bitmap.width, bitmap.height);
                    const actTargetBitmap = targetBitmap || createBlankBitmap(bitmap.width, bitmap.height);
                    
                    const canvas = service.compareImageData({
                        sourceBitmap: actSrcBitmap as unknown as ImageData,
                        targetBitmap: actTargetBitmap as unknown as ImageData,
                        combinePixelsOptions: {
                            showDiffColor: true
                        },
                        transformation
                    });
                    diffResultCanvas = canvas;
                }
            }
            
            if(diffResultCanvas) {
                const resultPage = await resultPageRender.getPDFPage();
                
                diffResultCacheRef.current[diffResultKey] = diffResultCanvas;
                
                renderingImagesRef.current[resultPage.getIndex()] = diffResultCanvas;
                
                if(srcIndex === targetIndex) {
                    const [ newWidth, newHeightOffset ] = resultPage.reverseDeviceOffset([diffResultCanvas.width, diffResultCanvas.height], scale);
                    const newHeight = -newHeightOffset;
                    
                    const oldWidth = resultPage.getWidth();
                    const oldHeight = resultPage.getHeight();
                    
                    if(oldWidth !== newWidth || oldHeight !== newHeight) {
                        await resultPage.setPageSize(newWidth, newHeight);
                    }
                }
                
                await pdfViewer.zoomTo(scale);
                (resultPageRender as any).render();
            }
        };
        handleOverlayComparison().catch(reason => {
            console.error(reason);
        });
    }, [pdfViewerRef, resultDoc, operateOptionsRef.current, opacityChangeState, viewerOperationDataRef.current.data]);
    
    useEffect(() => {
        if(!selectedPDFDocs || !pdfViewerRef || !pdfViewerRef.current) {
            return;
        }
        const pdfViewer = pdfViewerRef.current;
        if(!selectedPDFDocs[0] || !selectedPDFDocs[1]) {
            return;
        }
        
        (async () => {
            const srcDoc = await selectedPDFDocs[0];
            const targetDoc = await selectedPDFDocs[1];
        
            if(!srcDoc || !targetDoc) {
                return;
            }
            diffResultCacheRef.current = {};
            renderingImagesRef.current = {};
            const pageSize = await getPageSize(srcDoc, targetDoc, 0);
            const newDoc = await pdfViewer.createNewDoc('Compare Result', '', pageSize, {
                isRenderOnDocLoaded: true
            });
            const insertPageDataArray = await resolveInsertPageData(srcDoc, targetDoc);
            for(const insertPageDataItem of insertPageDataArray) {
                await newDoc.insertBlankPages(insertPageDataItem.pages.map(it => [it]), insertPageDataItem.pageSize.width, insertPageDataItem.pageSize.height);
            }
            dispatchResultDoc && dispatchResultDoc({
                doc: newDoc
            });
            resetComparisonOptions();
        })();
        
        return () => {
            dispatchResultDoc && dispatchResultDoc({
                doc: undefined
            });
            pdfViewer.close();
        };
    }, [pdfViewerRef, selectedPDFDocs[0], selectedPDFDocs[1]]);
    
    return (<div ref={divRef}></div>)
}

async function insertResultIntoPage(page: PDFViewCtrl.PDF.PDFPage, resultImageData: { buffer: ArrayBuffer, width: number; height: number }) {
    return await page.addImage(resultImageData.buffer, {
        left: 0,
        right: page.getWidth(),
        bottom:0,
        top: page.getHeight()
    }, 0);
}

function canvasToImageData(canvas: HTMLCanvasElement) {
    return new Promise<undefined | DiffResultImageData>(resolve => {
        canvas.toBlob(blob => {
            if(!blob) {
                return resolve(undefined);
            }
            const fr = new FileReader();
            fr.onloadend = () => {
                resolve({
                    buffer: fr.result as ArrayBuffer,
                    width: canvas.width,
                    height: canvas.height
                });
            };
            fr.readAsArrayBuffer(blob);
        });
    })
}

async function getPageBitmap(doc: PDFDoc, pageIndex: number, scale?: number) {
    if(pageIndex >= doc.getPageCount()) {
        return;
    }
    if(typeof scale !== 'number') {
        return;
    }
    const page = await doc.getPageByIndex(pageIndex);
    return await page.render(scale, 0, undefined, ['page', 'annot', 'form']);
}

async function resolveInsertPageData(srcDoc: PDFDoc, targetDoc: PDFDoc) {
    const resultDocPageCount = Math.max(srcDoc.getPageCount(), targetDoc.getPageCount());
    
    const pageSizes = await Promise.all(Array(resultDocPageCount - 1).fill(0).map((_, it) => {
        return getPageSize(srcDoc, targetDoc, it + 1);
    }));
    
    return pageSizes.reduce((arr, psize, index) => {
        const pageIndex = index + 1;
        const prev = arr[arr.length - 1];
        if(!prev || !isSamePageSize(prev.pageSize, psize)) {
            arr.push({
                pages: [pageIndex],
                pageSize: psize
            });
        } else {
            prev.pages.push(pageIndex);
        }
        return arr;
    }, [] as Array<{ pages: number[], pageSize: PageSize}>);
}

function isSamePageSize(a: PageSize, b: PageSize) {
    return a.width === b.width && a.height === b.height;
}

async function getPageSize(srcDoc: PDFDoc, targetDoc: PDFDoc, pageIndex: number) {
    const srcPage = await getPage(srcDoc);
    const targetPage = await getPage(targetDoc);

    const width = srcPage && targetPage ? Math.max(srcPage.getWidth(), targetPage.getWidth()) : (srcPage || targetPage)?.getWidth() as number;
    const height = srcPage && targetPage ? Math.max(srcPage.getHeight(), targetPage.getHeight()) : (srcPage || targetPage)?.getHeight() as number;

    return {width, height};

    function getPage(doc: PDFDoc) {
        if (pageIndex >= doc.getPageCount()) {
            return null;
        }
        return doc.getPageByIndex(pageIndex);
    }
}

type PageSize = {
    width: number;
    height: number;
}

export const OverlayComparisonPDFViewer = memo(forwardRef(PDFViewerRender));

function createBlankBitmap(width: number, height: number) {
    const canvas = document.createElement('canvas');
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    return ctx.getImageData(0, 0, width, height);
}

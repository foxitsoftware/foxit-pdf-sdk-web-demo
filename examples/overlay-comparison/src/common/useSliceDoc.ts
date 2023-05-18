import React, { useContext, useMemo, useRef } from 'react';
import { SourcePDFViewerInstanceContext, TargetPDFViewerInstanceContext } from '../contexts/PDFViewerContexts';
import { PDFViewer, PDFDoc } from '../foxit-sdk';
import { CompareDialogResult } from '../components/select-file-dialog/CompareDialogResult';
import { PDFDocDataItem } from '../components/select-file-dialog/PDFDocDataItem';

export function useSliceDoc({ srcDocData, targetDocData, srcRange, targetRange }: Partial<CompareDialogResult>) {
    const srcPDFViewerRef = useContext(SourcePDFViewerInstanceContext);
    const targetPDFViewerRef = useContext(TargetPDFViewerInstanceContext);
    
    const slicedSrcDocPromise = useSliceDocRange(srcDocData, srcPDFViewerRef, srcRange);
    const slicedTargetDocPromise = useSliceDocRange(targetDocData, targetPDFViewerRef, targetRange);

    return [slicedSrcDocPromise, slicedTargetDocPromise];
}

function useSliceDocRange(docData: PDFDocDataItem | undefined, pdfViewerRef: React.RefObject<PDFViewer> | undefined, range: [number, number] | undefined) {
    const currentPromise = useRef<Promise<PDFDoc | undefined>>();
    const lastParams = useRef<{
        docData: PDFDocDataItem | undefined,
        range: [number, number] | undefined
    }>();
    const promise = useMemo(() => {
        const pdfViewer = pdfViewerRef?.current;
        if(!docData || !range || !pdfViewer) {
            return Promise.resolve(undefined);
        }
        if(lastParams.current?.docData === docData && lastParams.current?.range === range) {
            return currentPromise.current;
        }
        return (async () => {
            const srcDoc = await docData.getLoadedPDFDoc();
            if(!srcDoc) {
                return;
            }
            const slicedSrcDocBuffer = await sliceDoc(srcDoc, docData.file, range);
            
            await pdfViewer.openPDFByFile(slicedSrcDocBuffer, {
                fileName: docData.getFileName(),
                password: docData.password
            });
            return pdfViewer.getCurrentPDFDoc() as PDFDoc;
        })();
    }, [docData, range, pdfViewerRef?.current]);
    lastParams.current = {
        docData, range
    };
    currentPromise.current = promise;
    return promise;
}

async function sliceDoc(doc: PDFDoc, originFile: File, range: [number, number]) {
    const [from, end] = range.map(it => it - 1);
    const count = doc.getPageCount();
    
    if(from === 0 && end === count - 1) {
        return originFile;
    }
    const buffers = await doc.extractPages([[from, end]]);
    try {
        return new File(buffers, originFile.name, {
            type: originFile.type
        })
    } catch (error) {
        return new Blob(buffers, { type: originFile.type })
    }
}
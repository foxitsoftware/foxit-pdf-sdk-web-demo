import * as React from 'react';
import { useContext, useEffect, useState } from "react";
import { useDocState } from "../../common/useDocState";
import { usePDFViewerEvent } from "../../common/usePDFViewerEvent";
import { ResultPDFViewerInstanceContext } from "../../contexts/PDFViewerContexts";
import { ResultDocContext } from "../../contexts/ResultDocContext";
import { ViewerEvents } from "../../foxit-sdk";
import { NextPageIcon, PrevPageIcon } from "../icons";
import { PageNumberDropdown } from "../page-number-dropdown/PageNumberDropdown";
import { FloatingToolbarButton } from "./FloatToolbarButton";
import "./page-number-control.scss";

export function PageNumberControl() {
    const disabled = useDocState();
    
    const resultPDFViewerRef = useContext(ResultPDFViewerInstanceContext);
    
    const a = useContext(ResultDocContext);
    const resultDoc = a.doc;
    
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    
    useEffect(() => {
        if(resultDoc) {
            setCurrentPageIndex(0);
            setPageCount(resultDoc.getPageCount());
        } else {
            setCurrentPageIndex(0);
            setPageCount(0);
        }
    }, [resultDoc]);
    
    usePDFViewerEvent(ViewerEvents.pageNumberChange, (pdfViewer) => {
        const docRender = pdfViewer.getPDFDocRender();
        if(docRender) {
            setCurrentPageIndex(docRender.getCurrentPageIndex());
        } else {
            setCurrentPageIndex(0);
        }
    }, resultPDFViewerRef);

    const jumpOffsetPage = (offset: 1 | -1) => {
        const pdfViewer = resultPDFViewerRef?.current;
        if(!pdfViewer) {
            return;
        }
        const docRender = pdfViewer.getPDFDocRender();
        if(!docRender) {
            return;
        }
        const nextPageIndex = (() => {
            if(offset === -1) {
                return Math.max(0, currentPageIndex - 1);
            }
            return Math.min(pageCount - 1, currentPageIndex + 1);
        })();
        setCurrentPageIndex(nextPageIndex);
        return docRender.goToPage(nextPageIndex);
    };
    const jumpToPage = (pageIndex: number) => {
        const pdfViewer = resultPDFViewerRef?.current;
        if(!pdfViewer) {
            return;
        }
        const docRender = pdfViewer.getPDFDocRender();
        if(!docRender) {
            return;
        }
        setCurrentPageIndex(pageIndex);
        return docRender.goToPage(pageIndex);
    }
    
    return (
        <div className={"fx_oc-page-number " + (disabled ? 'fx_ic-page-number-disabled' : '')}>
            <FloatingToolbarButton
                icon={<PrevPageIcon></PrevPageIcon>}
                onClick={() => jumpOffsetPage(-1)}
            ></FloatingToolbarButton>
            <div className="fx_oc-page-number-input-group">
                <PageNumberDropdown
                    value={currentPageIndex + 1}
                    pageCount={pageCount}
                    onChange={newPageNumber => {
                        jumpToPage(newPageNumber - 1);
                    }}
                ></PageNumberDropdown>
                <span className="fx_oc-page-number-text" >{`${currentPageIndex + 1}/${pageCount}`}</span>
            </div>
            <FloatingToolbarButton
                icon={<NextPageIcon></NextPageIcon>}
                onClick={() => jumpOffsetPage(1)}
            ></FloatingToolbarButton>
        </div>
    );
}

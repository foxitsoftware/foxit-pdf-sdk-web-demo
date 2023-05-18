import React, { useEffect, useReducer, useRef, useState } from "react";
import { PDFViewerComponent } from "./components/pdf-viewer/PDFViewer";
import { OverlayComparisonPDFViewer } from "./components/result-pdf-viewer/OverlayComparisonPDFViewer";
import "./App.scss";
import { PDFViewer, ViewerEvents, PDFDoc } from "./foxit-sdk";
import {
    SourcePDFViewerInstanceContext,
    ResultPDFViewerInstanceContext,
    TargetPDFViewerInstanceContext,
} from "./contexts/PDFViewerContexts";
import { ComparisonViewer } from "./components/comparison-viewer/ComparisonViewer";
import { Toolbar } from "./components/toolbar/Toolbar";
import { FloatingToolbar } from "./components/floating-toolbar/FloatingToolbar";
import {
    SelectedPDFDocContext,
    SelectPDFDocReducer,
} from "./contexts/SelectedPDFDocContext";
import {
    ComparisonOptionsContext,
    ComparisonOptionsReducer,
} from "./contexts/ComparisonOptionsContext";
import {
    ViewerOperationDataContext,
    ViewerOperationDataReducer,
} from "./contexts/ViewerOperationDataContext";
import { UnionContextProvider } from "./common/UnionContextProvider";
import { useFileOpen } from "./common/useFileOpen";
import { ResultDocContext, resultDocContextReducer } from "./contexts/ResultDocContext";

function App() {
    const sourceViewerRef = useRef() as React.RefObject<PDFViewer>;
    const targetViewerRef = useRef() as React.RefObject<PDFViewer>;
    const resultViewerRef = useRef() as React.RefObject<PDFViewer>;

    const [sourceTitle, setSourceTitle] = useState("");
    const [targetTitle, setTargetTitle] = useState("");
    
    useFileOpen((pdfViewer, doc) => {
        const fileName = (doc as any).getFileName();        
        setSourceTitle(
            fileName || "Source PDF"
        );
    }, sourceViewerRef);
    
    useFileOpen((pdfViewer, doc) => {
        const fileName = (doc as any).getFileName();        
        setTargetTitle(
            fileName || "Target PDF"
        );
    }, targetViewerRef)

    const [selectedPDFDocs, dispatchSelectedPDFDocs] = useReducer(
        SelectPDFDocReducer,
        []
    );

    const [comparisonOptions, dispatchComparisonOptions] = useReducer(
        ComparisonOptionsReducer,
        {}
    );

    const [viewerOperationData, dispatchViewerOperationData] = useReducer(
        ViewerOperationDataReducer,
        {
            initScale: NaN,
            scale: NaN,
            currentPageIndex: 0
        }
    );
    const [ resultPDFDoc, dispatchResultPDFDoc ] = useReducer(resultDocContextReducer, undefined);
    const contexts: Array<[React.Context<any>,any]> = [
        [
            SelectedPDFDocContext,
            {
                data: selectedPDFDocs,
                dispatch: dispatchSelectedPDFDocs,
            },
        ],
        [SourcePDFViewerInstanceContext, sourceViewerRef],
        [ResultPDFViewerInstanceContext, resultViewerRef],
        [TargetPDFViewerInstanceContext, targetViewerRef],
        [
            ComparisonOptionsContext,
            {
                data: comparisonOptions,
                dispatch: dispatchComparisonOptions,
            },
        ],
        [
            ViewerOperationDataContext,
            {
                data: viewerOperationData,
                dispatch: dispatchViewerOperationData,
            },
        ],
        [
            ResultDocContext,
            {
                doc: resultPDFDoc,
                dispatch: dispatchResultPDFDoc
            }
        ]
    ];
    return (
        <div className="fx_oc-layout">
            <header className="fx_oc-top-header">
                <h1>Overlay Comparison</h1>
            </header>
            <UnionContextProvider
                contexts={contexts}
            >
                <Toolbar></Toolbar>
                <div className="fx_oc-viewer-container">
                    <ComparisonViewer title={sourceTitle} pdfViewerRef={sourceViewerRef}>
                        <PDFViewerComponent ref={sourceViewerRef}></PDFViewerComponent>
                    </ComparisonViewer>
                    <ComparisonViewer
                        title="Compare Results"
                        floatingBar={
                            <FloatingToolbar></FloatingToolbar>
                        }
                        pdfViewerRef={resultViewerRef}
                    >
                        <OverlayComparisonPDFViewer
                            ref={resultViewerRef}
                        ></OverlayComparisonPDFViewer>
                    </ComparisonViewer>
                    <ComparisonViewer title={targetTitle} pdfViewerRef={targetViewerRef}>
                        <PDFViewerComponent ref={targetViewerRef}></PDFViewerComponent>
                    </ComparisonViewer>
                </div>
            </UnionContextProvider>
        </div>
    );
}

export default App;

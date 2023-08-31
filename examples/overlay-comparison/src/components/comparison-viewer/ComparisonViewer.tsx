import React, { useState } from "react";
import { useFileClose } from "../../common/useFileClose";
import { useFileOpen } from "../../common/useFileOpen";
import { PDFViewer } from "../../foxit-sdk";
import { BlankIcon } from "../icons";
import "./comparison-viewer.scss";

const ComparisonViewerBody = React.memo((props: React.PropsWithChildren) => (
    <section className="fx_oc-comparison-viewer-body">{props.children}</section>
));

export function ComparisonViewer(
    props: React.PropsWithChildren & {
        title: string;
        floatingBar?: React.ReactNode;
        pdfViewerRef: React.RefObject<PDFViewer>;
    }
) {
   const [ isOpened, setIsOpened ] = useState(false);
   
    useFileOpen(() => {
        setIsOpened(true);
    }, props.pdfViewerRef);
    
    useFileClose(() => {
        setIsOpened(false);
    }, props.pdfViewerRef);
    
    return (
        <div className={"fx_oc-comparison-viewer " + (isOpened ? 'file-opened' : '')}>
            <header className="fx_oc-comparison-viewer-header">
                <span className="fx_oc-comparison-viewer-header-title">
                    {props.title}
                </span>
            </header>
            <ComparisonViewerBody>
                <BlankIcon></BlankIcon>
                {props.children}
            </ComparisonViewerBody>
            {props.floatingBar}
        </div>
    );
}

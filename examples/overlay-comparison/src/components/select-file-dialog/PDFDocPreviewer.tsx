import { Slider } from "antd";
import React, { useEffect, useRef, useState } from "react"
import { PageNumberDropdown } from "../page-number-dropdown/PageNumberDropdown";
import { PDFDocDataItem } from "./PDFDocDataItem";
import { PDFPagePreviewer } from "./PDFPagePreviewer";
import './previewer.scss';

function PDFDocPreviewerRender(props: {
    docData?: PDFDocDataItem
}) {
    const { docData } = props;
    const divRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

    useEffect(() => {
        if(!divRef.current) {
            return;
        }
        docData?.getLoadedPDFDoc().then(doc => {
            setCurrentPageIndex(0);
            if(!doc) {
                return;
            }
            const pageCount = doc.getPageCount();
            setPageCount(pageCount);
        });
    }, [divRef, props.docData]);

    return <div className="fx_oc-previewer" ref={divRef}>
        <PDFPagePreviewer docData={docData} pageIndex={currentPageIndex}></PDFPagePreviewer>
        <div className="fx_oc-previewer-controls">
            <Slider className="fx_oc-slider" disabled={currentPageIndex < 0 || pageCount < 2} min={1} max={Math.max(pageCount, 1)} value={currentPageIndex + 1} onChange={value => {
                setCurrentPageIndex(value - 1);
            }}></Slider>
            <PageNumberDropdown
                pageCount={pageCount}
                value={currentPageIndex + 1}
                onChange={value => {
                    if(value - 1 !== currentPageIndex) {
                        setCurrentPageIndex(value - 1)
                    }
                }}
            ></PageNumberDropdown>
        </div>
    </div>
}

export const PDFDocPreviewer = React.memo(PDFDocPreviewerRender);

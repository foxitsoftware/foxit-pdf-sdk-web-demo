import React, { useEffect, useRef } from "react";
import { PDFDocDataItem } from "./PDFDocDataItem";
import { ReactComponent as BlankIcon } from '../../assets/select-file-dialog/blank.svg';

export const PDFPagePreviewer = React.memo(function(props: {
    docData?: PDFDocDataItem;
    pageIndex?: number;
}) {
    const divRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const { docData, pageIndex } = props;
        if(!docData || (typeof pageIndex !== 'number') || !divRef.current) {
            return;
        }
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        const style = getComputedStyle(div);
        const paddingLeft = parseInt(style.paddingLeft) || 0;
        const paddingRight = parseInt(style.paddingRight) || 0;
        const paddingTop = parseInt(style.paddingTop) || 0;
        const paddingBottom = parseInt(style.paddingBottom) || 0;
        
        const imagePromise = docData.getThumbnail(pageIndex, rect.width - paddingLeft - paddingRight, rect.height - paddingTop - paddingBottom)
            .then(image => {
                image && div.appendChild(image);
                return image;
            });
        return () => {
            imagePromise.then(image => {
                image && (image.parentElement === div) && div.removeChild(image);
            });
        }
    }, [props.docData, props.pageIndex, divRef]);
    
    return <div ref={divRef} className="fx_oc-page-previewer">
        <BlankIcon></BlankIcon>
    </div>
})
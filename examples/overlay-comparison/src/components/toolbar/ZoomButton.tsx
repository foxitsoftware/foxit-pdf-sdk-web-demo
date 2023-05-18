import { useContext } from "react";
import * as React from 'react';
import { useContextRef } from "../../common/useContextRef";
import { ViewerOperationDataContext } from "../../contexts/ViewerOperationDataContext";
import { MinusCircleIcon, PlusCircleIcon } from "../icons/index";
import { ToolbarButton } from "./ToolbarButton";

export enum ZoomOperationType {
    ZOOMIN,
    ZOOMOUT
}

export function ZoomButton(props: {
    type: ZoomOperationType,
    disabled: boolean
}) {
    const viewerOperationDataRef = useContextRef(ViewerOperationDataContext);
    
    
    const { step, icon, text } = (() => {
        if(props.type === ZoomOperationType.ZOOMIN) {
            return {
                step: 0.1,
                icon: <PlusCircleIcon></PlusCircleIcon>,
                text: 'Zoom In'
            };
        } else {
            return {
                step: -0.1,
                icon: <MinusCircleIcon></MinusCircleIcon>,
                text: 'Zoom Out'
            };
        }
    })();
    
    return <ToolbarButton onClick={() => {
        const { data: viewerOperationData, dispatch: dispatchViewerOperationData } = viewerOperationDataRef.current;
        if(isNaN(viewerOperationData.scale)) {
            return;
        }
        let newScale = viewerOperationData.scale + step;
        if(newScale < 0.1) {
            newScale = 0.1;
        }
        if(newScale > 10) {
            newScale = 10;
        }
        dispatchViewerOperationData && dispatchViewerOperationData({
            scale: newScale
        })
    }} disabled={props.disabled || isNaN(viewerOperationDataRef.current.data.scale)} text={text} separate={true} icon={icon}></ToolbarButton>
}
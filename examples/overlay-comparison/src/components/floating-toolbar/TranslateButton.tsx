import React from "react";
import { useUpdateComparisonOptions } from "../../common/useComparisonOptions";
import { TranslateUpIcon, TranslateDownIcon, TranslateLeftIcon, TranslateRightIcon } from "../icons";
import { FloatingToolbarButton } from "./FloatToolbarButton";

export enum TranslateDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export function TranslateButton(props: {
    direction: TranslateDirection
}) {
    const updateComparisonOptions = useUpdateComparisonOptions();
    return <FloatingToolbarButton onClick={()=>{
        const step = 2;
        switch(props.direction) {
            case TranslateDirection.UP:
                updateComparisonOptions({
                    translateY: -step
                });
                break;
            case TranslateDirection.DOWN:
                updateComparisonOptions({
                    translateY: step
                });
                break;
            case TranslateDirection.LEFT:
                updateComparisonOptions({
                    translateX: -step
                });
                break;
            case TranslateDirection.RIGHT:
                updateComparisonOptions({
                    translateX: step
                });
                break;
        }
    }} icon={
        (() => {
            switch(props.direction) {
                case TranslateDirection.UP:
                    return (<TranslateUpIcon></TranslateUpIcon>)
                case TranslateDirection.DOWN:
                    return (<TranslateDownIcon></TranslateDownIcon>)
                case TranslateDirection.LEFT:
                    return (<TranslateLeftIcon></TranslateLeftIcon>)
                case TranslateDirection.RIGHT:
                    return (<TranslateRightIcon></TranslateRightIcon>)
            }
        })()
    }></FloatingToolbarButton>
}
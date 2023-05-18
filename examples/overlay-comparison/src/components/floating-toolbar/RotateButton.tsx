import React from "react";
import { useUpdateComparisonOptions } from "../../common/useComparisonOptions";
import { RotateLeftIcon, RotateRightIcon } from "../icons";
import { FloatingToolbarButton } from "./FloatToolbarButton";

export enum RotateDirection {
    CLOCKWISE,
    COUNTERCLOCKWISE
}

const ROTATE_STEP = 2 / 180 * Math.PI;

export function RotateButton(props: {
    direction: RotateDirection
}) {
    const updateComparisonOptions = useUpdateComparisonOptions();
    
    return <FloatingToolbarButton onClick={()=>{
        updateComparisonOptions({
            rotate: props.direction === RotateDirection.CLOCKWISE ? ROTATE_STEP : -ROTATE_STEP
        })
    }} icon={
        props.direction === RotateDirection.CLOCKWISE ? (<RotateRightIcon></RotateRightIcon>) : (<RotateLeftIcon></RotateLeftIcon>)
    }></FloatingToolbarButton>
}
import React from "react";

type ViewerOperationData = {
    initScale: number;
    scale: number;
    currentPageIndex: number;
};

type ViewerOperationDataType = {
    data: ViewerOperationData;
    dispatch?: React.Dispatch<Partial<ViewerOperationData>>;
};

export const ViewerOperationDataContext = React.createContext<ViewerOperationDataType>({
    data: {
        initScale: NaN,
        scale: NaN,
        currentPageIndex: 0
    }
});

export function ViewerOperationDataReducer(state: ViewerOperationData, action: Partial<ViewerOperationData>) {
    return {
        ...state,
        ...action
    }
}
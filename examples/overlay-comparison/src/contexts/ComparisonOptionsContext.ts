import React from "react";

export interface ComparisonOptions {
    translateX: number;
    translateY: number;
    rotate: number;
    reset:boolean;
    pageIndex: number;
}

export type ComparisonOptionsDataType = {
    data: Record<number, ComparisonOptions>;
    dispatch?: React.Dispatch<Partial<ComparisonOptions>>
}


export const ComparisonOptionsContext = React.createContext<ComparisonOptionsDataType>({
    data: {}
});

export function ComparisonOptionsReducer(state: Record<number, ComparisonOptions>, action: Partial<ComparisonOptions>) {
    if(action.reset) {
        return {};
    }
    const newState = {
        ...state
    };
    const pageIndex = action.pageIndex;
    if(pageIndex === undefined) {
        return newState;
    }
    const data = state[pageIndex] ? {
        ...state[pageIndex]
    } : {
        translateX: 0,
        translateY: 0,
        rotate: 0,
        pageIndex: pageIndex,
        reset: false
    };
    for(const key in action) {
        if(key === 'pageIndex') {
            continue;
        }
        if(key === 'reset') {
            continue;
        }
        data[key as Exclude<keyof ComparisonOptions, 'reset'>] += action[key as keyof ComparisonOptions] as number;
    }
    newState[pageIndex] = data;
    return newState;
}

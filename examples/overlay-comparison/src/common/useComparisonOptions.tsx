import { useContext, useEffect, useRef, useState } from "react";
import { ComparisonOptionsContext, ComparisonOptions } from "../contexts/ComparisonOptionsContext";
import { ViewerOperationDataContext } from "../contexts/ViewerOperationDataContext";
import { useContextRef } from "./useContextRef";

export function useComparisonOptions() {
    const viewerOperationDataRef = useContextRef(ViewerOperationDataContext);
    const { data, dispatch } = useContext(ComparisonOptionsContext);
    
    const currentPageOptionRef = useRef<Pick<ComparisonOptions, 'rotate' | 'translateX' | 'translateY'>>({
        translateX: 0,
        translateY: 0,
        rotate: 0
    });
    
    useEffect(() => {
        currentPageOptionRef.current = data[viewerOperationDataRef.current.data.currentPageIndex] || {
            translateX: 0,
            translateY: 0,
            rotate: 0
        };
    }, [viewerOperationDataRef.current.data, data]);
    
    return {
        dataRef:currentPageOptionRef,
        reset: () => {
            dispatch && dispatch({
                reset: true
            });
        },
        update: (options: Partial<ComparisonOptions>) => {
            const pageIndex = viewerOperationDataRef.current.data.currentPageIndex;
            
            dispatch && dispatch({
                pageIndex,
                ...options
            });
        }
    };
}

export function useUpdateComparisonOptions() {
    const viewerOperationDataRef = useContextRef(ViewerOperationDataContext);
    const { dispatch } = useContext(ComparisonOptionsContext);
    
    return (options: Partial<ComparisonOptions>) => {
            const pageIndex = viewerOperationDataRef.current.data.currentPageIndex;
            
            dispatch && dispatch({
                pageIndex,
                ...options
            });
        }
}
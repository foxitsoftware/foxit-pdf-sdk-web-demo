import React, { Context, useContext, useEffect, useRef } from "react";

export function useContextRef<T, R>(context: Context<{
    data: T,
    dispatch?: React.Dispatch<R>
}>) {
    const ctxData = useContext(context);
    const dataRef = useRef(ctxData);
    
    useEffect(() => {
        dataRef.current = ctxData;
    }, [ctxData.data])
    return dataRef;
}
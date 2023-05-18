import React, { useEffect, useRef } from "react";

export function useDebounce<T extends React.DependencyList>(func: (args: T) => void, deps: T, options: Partial<{
    delay: number
}> = {
    delay: 100
}) {
    const funcRef = useRef(func);

    funcRef.current = func;

    useEffect(() => {
        const timmerId = setTimeout(() => {
            funcRef.current.call(null, deps);
        }, options.delay);
        return () => {
            clearTimeout(timmerId);
        };
    }, deps);

}

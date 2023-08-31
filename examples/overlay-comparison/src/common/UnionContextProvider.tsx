import React from "react";

export function UnionContextProvider(props: {
    contexts: Array<[
        React.Context<any>,
        any
    ]>
} & React.PropsWithChildren) {
    return props.contexts.reduce((child: React.ReactNode, [context, value]) => {
        return <context.Provider value={value}>
            {child}
        </context.Provider>
    }, props.children) as JSX.Element;
}
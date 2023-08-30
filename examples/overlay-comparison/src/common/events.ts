
export function compose(...callbacks: Array<()=>void>) {
    return () => {
        callbacks.forEach(it => it());
    };
}

export function addEventListener<K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void {
    target.addEventListener(type, listener, options);
    return () => {
        target.removeEventListener(type, listener, options);
    };
}

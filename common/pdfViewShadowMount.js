/**
 * PDFViewCtrl 要求挂载节点位于 open ShadowRoot 内；且 customs.containerRoot 须指向
 * shadow 内包裹层（与官方 UIExtension custom_container 示例一致），否则内部会对 null 绑定事件。
 * @param {HTMLElement} hostEl
 * @param {string} stylesBaseUrl 与 libPath 一致，须以 / 结尾，如 "/lib/"
 * @returns {{ mountEl: HTMLElement, containerRoot: HTMLElement }}
 */
export function createPdfViewerShadowMount(hostEl, stylesBaseUrl) {
    const base = stylesBaseUrl.endsWith('/') ? stylesBaseUrl : stylesBaseUrl + '/';
    const shadow = hostEl.attachShadow({ mode: 'open' });
    const containerRoot = document.createElement('div');
    containerRoot.style.cssText =
        'width:100%;height:100%;position:relative;box-sizing:border-box;';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + 'PDFViewCtrl.css';
    containerRoot.appendChild(link);
    const mountEl = document.createElement('div');
    mountEl.style.cssText =
        'width:100%;height:100%;min-height:100%;box-sizing:border-box;';
    containerRoot.appendChild(mountEl);
    shadow.appendChild(containerRoot);
    return { mountEl, containerRoot };
}

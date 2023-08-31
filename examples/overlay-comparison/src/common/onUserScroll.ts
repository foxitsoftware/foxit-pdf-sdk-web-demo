import { compose, addEventListener } from './events';

export function onUserScroll(target: HTMLElement, callback: (offsetX: number, offsetY: number) => void) {
    let touched = false;
    let mouseWheelled = false;
    let prevScrollTop = target.scrollTop;
    let prevScrollLeft = target.scrollLeft;
    const updateScrollPos = () => {
        prevScrollLeft = target.scrollLeft;
        prevScrollTop = target.scrollTop;
    };
    function emitEvent() {
        const offsetX = target.scrollLeft - prevScrollLeft;
        const offsetY = target.scrollTop - prevScrollTop;
        if(offsetX !== 0 || offsetY !== 0) {
            callback(offsetX, offsetY);
        }
        updateScrollPos();
    }
    return compose(
        addEventListener(target, 'touchstart', e => {
            touched = true;
            updateScrollPos();
        }, true),
        addEventListener(target, 'touchend', e => {
            touched = false;
        }, true),
        addEventListener(target, 'scroll', e => {
            if(touched) {
                emitEvent();
            } else if(mouseWheelled) {
                updateScrollPos();
                mouseWheelled = false;
            }
        }),
        addEventListener(target, 'mouseover', e => {
            updateScrollPos();
        }, true),
        addEventListener(target, 'mousedown', e => {
            touched = true;
        }, true),
        addEventListener(target, 'mouseup', e => {
            touched = false;
        }, true),
        addEventListener(target, 'wheel', e => {
            mouseWheelled = true;
            const scrollX = e.shiftKey ? e.deltaY : 0;
            const scrollY = e.shiftKey ? 0 : e.deltaY;
            callback(scrollX, scrollY);
        })
    )
}

function isMouseOnVerticalScrollbar (target: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration, mouseX: number) {
    const borderLeftRightWidth = (parseInt(style.borderLeftWidth) || 0) + (parseInt(style.borderRightWidth) || 0);
    const wrapOffsetWidth = target.offsetWidth;
    const scrollBarWidth = wrapOffsetWidth - target.clientWidth - borderLeftRightWidth;
    return mouseX >= wrapOffsetWidth - scrollBarWidth + rect.left;
}

function isMouseOnHorizontalScrollbar (target: HTMLElement, rect: DOMRect, style: CSSStyleDeclaration, mouseY: number) {
    const borderTopBottomHeight = (parseInt(style.borderTopWidth) || 0) + (parseInt(style.borderBottomWidth) || 0);
    const wrapperOffsetHeight = target.offsetHeight;
    const scrollBarHeight = wrapperOffsetHeight - target.clientHeight - borderTopBottomHeight;
    return mouseY >= wrapperOffsetHeight - scrollBarHeight + rect.top
}
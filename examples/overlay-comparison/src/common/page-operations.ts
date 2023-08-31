import { PDFViewer } from "../foxit-sdk";

export function scrollViewport(pdfViewer: PDFViewer, dir: -1 | 1) {
    const scrollWrap = pdfViewer.getScrollWrap();
    return scrollWrap.scrollBy(0, scrollWrap.getHeight() * dir);
}
export function scrollToBottom(pdfViewer: PDFViewer) {
    const scrollWrap = pdfViewer.getScrollWrap();
    const scrollHost = scrollWrap.getScrollHost() as HTMLElement;
    return scrollWrap.scrollBy(0, scrollHost.scrollHeight - scrollHost.clientHeight);
}
export function scrollToTop(pdfViewer: PDFViewer) {
    const scrollWrap = pdfViewer.getScrollWrap();
    return scrollWrap.scrollTo(0, 0);
}

export function gotoPrevPage(pdfViewer: PDFViewer) {
    const docRender = pdfViewer.getPDFDocRender();
    if(!docRender) {
        return Promise.resolve();
    }
    const currentPageIndex = docRender.getCurrentPageIndex();
    if(currentPageIndex === 0) {
        return Promise.resolve();
    }
    return gotoPage(pdfViewer, currentPageIndex - 1).then(() => {
        scrollToBottom(pdfViewer);
    });
}

export function gotoNextPage(pdfViewer: PDFViewer) {
    const docRender = pdfViewer.getPDFDocRender();
    if(!docRender) {
        return Promise.resolve();
    }
    const currentPageIndex = docRender.getCurrentPageIndex();
    return gotoPage(pdfViewer, currentPageIndex + 1).then(() => {
        scrollToTop(pdfViewer);
    });
}

export function gotoFirstPage(pdfViewer: PDFViewer) {
    return gotoPage(pdfViewer, 0);
}

export function gotoLastPage(pdfViewer: PDFViewer) {
    const doc = pdfViewer.getCurrentPDFDoc();
    if(!doc) {
        return Promise.resolve();
    }
    return gotoPage(pdfViewer, doc.getPageCount() - 1);
}


export function gotoPage(pdfViewer: PDFViewer, pageIndex: number) {
    const docRender = pdfViewer.getPDFDocRender();
    if(!docRender) {
        return Promise.resolve();
    }
    const focusOn = document.activeElement;
    return docRender.goToPage(pageIndex).then(() => {
        if(focusOn && focusOn instanceof HTMLElement) {
            focusOn.focus();
        }
    });
}

export function hasNextPage(pdfViewer: PDFViewer) {
    const docRender = pdfViewer.getPDFDocRender();
    if(!docRender) {
        return false;
    }
    const currentPageIndex = docRender.getCurrentPageIndex();
    const pageCount = docRender.getPDFDoc().getPageCount();
    if(currentPageIndex >= pageCount - 1) {
        return false;
    }
    const pageRender = pdfViewer.getPDFPageRender(currentPageIndex);
    if(!pageRender) {
        return false;
    }
    return true;
}

export function hasPrevPage(pdfViewer: PDFViewer) {
    const docRender = pdfViewer.getPDFDocRender();
    if(!docRender) {
        return false;
    }
    const currentPageIndex = docRender.getCurrentPageIndex();
    if(currentPageIndex < 1) {
        return false;
    }
    const pageRender = pdfViewer.getPDFPageRender(currentPageIndex);
    if(!pageRender) {
        return false;
    }
    return true;
}
export function isScrolledToBottom(pdfViewer: PDFViewer) {
    const scrollWrap = pdfViewer.getScrollWrap();
    const scrollHost = scrollWrap.getScrollHost() as HTMLElement;
    
    return scrollHost.scrollHeight + getScrollbarHeight(scrollHost) === scrollHost.scrollTop + scrollHost.offsetHeight;
}

export function isScrolledToTop(pdfViewer: PDFViewer) {
    const scrollWrap = pdfViewer.getScrollWrap();
    return scrollWrap.getScrollTop() === 0;
}


export function getScrollbarHeight(element: HTMLElement) {
    return element.offsetHeight - element.clientHeight;
}

export function getScrollbarWidth(element: HTMLElement) {
    return element.offsetWidth - element.clientWidth;
}

export function scrollPage(pdfViewer: PDFViewer, x: number, y: number) {
    const scrollWrap = pdfViewer.getScrollWrap();
    scrollWrap.scrollBy(x, y);
}
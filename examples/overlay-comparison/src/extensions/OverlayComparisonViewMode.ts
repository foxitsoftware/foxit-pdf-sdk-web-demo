import { PDFPageRender, PDFViewCtrl, PDFViewer } from "../foxit-sdk";
import './page-view-mode.scss';

export class OverlayComparisonViewMode extends PDFViewCtrl.viewMode.IViewMode {
    
    static getName() {
        return 'single-page-view-mode';
    }

    protected docRender!: PDFViewCtrl.renderers.PDFDocRender; // initialized in IViewMode
    private currentPageIndex = 0;
    private pageDOMs: Array<HTMLElement> = [];
    private pageContainer?: HTMLElement;
    constructor(pdfDocRender: PDFViewCtrl.renderers.PDFDocRender) {
        super(pdfDocRender)
        this.docRender = pdfDocRender;
    }
    private getPDFViewer() {
        return (this.docRender as any).pdfViewer as PDFViewer;
    }
    getCurrentPageIndex(): number {
        return this.currentPageIndex;
    }
    getFitHeight(index: number): number | Promise<number> {
        return this.getPDFViewer().getScrollWrap().getHeight();
    }
    getFitWidth(index: number): number | Promise<number> {
        return this.getPDFViewer().getScrollWrap().getWidth();
    }
    getNextPageIndex(): number {
        const pageCount = this.docRender.getPDFDoc().getPageCount();
        return Math.min(pageCount - 1, this.currentPageIndex + 1);
    }
    getPrevPageIndex(): number {
        return Math.max(0, this.currentPageIndex - 1);
    }
    getVisibleIndexes(): number[] {
        return [this.currentPageIndex];
    }
    into(pageContainer: HTMLElement, pageDOMs: Array<HTMLElement>): void {
        this.pageContainer = pageContainer;
        this.pageDOMs = pageDOMs;
        this.pageContainer.classList.add('fx_oc-single-page-view-mode')
        
    }
    jumpToPage(
      index: number,
      offset?: {
        x: number;
        y: number;
      }
    ): void {
        if(!this.pageContainer || !this.pageDOMs) {
            return;
        }
        const pageDOM = this.pageDOMs[index];
        if(!pageDOM) {
            return;
        }
        this.clear();
        this.pageContainer.appendChild(pageDOM);
        if(offset) {
            this.pageContainer?.scrollTo({
                left: offset.x || 0,
                top: offset.y || 0
            });
        }
        this.currentPageIndex = index;
        this.updatePagePosition();
    }
    out(): void {
        this.pageContainer?.classList.remove('fx_oc-single-page-view-mode')
        this.clear();
    }
    private clear() {
        if(this.pageContainer) {
            while(!!this.pageContainer.firstChild) {
                this.pageContainer.removeChild(this.pageContainer.firstChild);
            }
        }
    }
    renderViewMode(
      pageRender: PDFPageRender,
      scale: number,
      rotate: number,
      width: number,
      height: number
    ): void {
        const index = (pageRender as PDFPageRender & {index: number}).index;
        if(index === this.currentPageIndex) {
            const pageDOM = this.pageDOMs[index];
            if(!pageDOM.parentElement) {
                this.jumpToPage(index);
            }
            this.updatePagePosition(height);
        }
    }
    updatePagePosition(showHeight?: number) {
        const pageDOM = this.pageDOMs[this.currentPageIndex];
        const containerHeight = this.getPDFViewer().getScrollWrap().getHeight();
        const pageHeight = showHeight || pageDOM.offsetHeight;
        if(pageHeight < containerHeight) {
            pageDOM.style.cssText += `
                top: ${Math.max(0, containerHeight - pageHeight) / 2}px;
            `;
        } else {
            pageDOM.style.cssText += 'top: 0';
        }
    }
    
}
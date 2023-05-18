import { PDFViewer, PDFDoc } from '../../foxit-sdk';

export class PDFDocDataItem {
    public selected: boolean = false;
    private loadPDFDocPromise?: Promise<PDFDoc | undefined>;
    public password?: string;
    private thumbnailCache = new Map<
        string,
        Promise<HTMLImageElement | undefined>
    >();
    constructor(public file: File, private viewer: PDFViewer) {}
    getLoadedPDFDoc(
        errorHandler?: (
            doc: PDFDoc,
            options: object,
            error: any | undefined,
            retry: (options: object) => Promise<PDFDoc | undefined>
        ) => Promise<PDFDoc | undefined>
    ) {
        if (!this.loadPDFDocPromise) {
            this.loadPDFDocPromise = this.viewer.loadPDFDocByFile(this.file, {
                errorHandler: errorHandler
            });
        }
        return this.loadPDFDocPromise as Promise<PDFDoc | undefined>;
    }
    getThumbnail(index: number, width: number, height: number) {
        const key = `thumbnail-${index}-${width}-${height}`;
        if (!this.thumbnailCache.has(key)) {
            this.thumbnailCache.set(
                key,
                this.getLoadedPDFDoc()
                    .then((doc) => {
                        if (!doc) {
                            return;
                        }
                        return doc.loadThumbnail({
                            pageIndex: index,
                            width,
                            height,
                            type: 'canvas',
                        });
                    })
                    .then((canvas) => {
                        if (canvas instanceof HTMLCanvasElement) {
                            const image = document.createElement('img');
                            image.src = canvas.toDataURL();
                            return image;
                        }
                        this.thumbnailCache.delete(key);
                        return undefined;
                    })
            );
        }
        return this.thumbnailCache.get(key)?.then((image) => {
            return image && image.cloneNode();
        }) as Promise<HTMLImageElement | undefined>;
    }
    getFileName() {
        return this.file.name;
    }
}

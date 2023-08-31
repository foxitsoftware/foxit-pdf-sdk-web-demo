import { PDFDocDataItem } from "./PDFDocDataItem";

export interface CompareDialogResult {
    srcDocData: PDFDocDataItem,
    targetDocData: PDFDocDataItem,
    srcRange: [number, number],
    targetRange: [number, number],
}

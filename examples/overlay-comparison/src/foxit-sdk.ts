// @ts-ignore0
import * as PDFViewCtrl from '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/PDFViewCtrl.full';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/PDFViewCtrl.css';


export { PDFViewCtrl };

export type PDFDoc = PDFViewCtrl.PDF.PDFDoc;
export type PDFViewer = PDFViewCtrl.PDFViewer;
export type PDFPageRender = PDFViewCtrl.renderers.PDFPageRender;
export type IContextMenu = PDFViewCtrl.viewerui.IContextMenu;

export const PDFViewer = PDFViewCtrl.PDFViewer;
export const PDFPageRender = PDFViewCtrl.renderers.PDFPageRender;
export const ViewerEvents = PDFViewCtrl.constants.ViewerEvents;
export type ViewerEvents = PDFViewCtrl.constants.ViewerEvents;
export const User_Permissions = PDFViewCtrl.PDF.constant.User_Permissions
export const TinyViewerUI = PDFViewCtrl.viewerui.TinyViewerUI;
export const CustomScrollWrap = PDFViewCtrl.CustomScrollWrap;
export type ImageData = PDFViewCtrl.overlayComparison.ImageData;

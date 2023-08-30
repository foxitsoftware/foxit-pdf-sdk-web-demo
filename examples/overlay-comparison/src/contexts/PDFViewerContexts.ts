import { createContext } from 'react';
import { PDFViewer } from '../foxit-sdk';

export const SourcePDFViewerInstanceContext = createContext<React.RefObject<PDFViewer> | undefined>(undefined);
export const TargetPDFViewerInstanceContext = createContext<React.RefObject<PDFViewer> | undefined>(undefined);
export const ResultPDFViewerInstanceContext = createContext<React.RefObject<PDFViewer> | undefined>(undefined);

import React from 'react';
import { PDFDoc } from '../foxit-sdk';

export type SelectedPDFDocContextDataType = {
    data: Array<Promise<PDFDoc | undefined> | undefined>,
    dispatch?: React.Dispatch<{
        type: 'select',
        data: Array<Promise<PDFDoc | undefined> | undefined>
    }>
}

export const SelectedPDFDocContext = React.createContext<SelectedPDFDocContextDataType>({
    data: []
});

export function SelectPDFDocReducer(state: Array<Promise<PDFDoc | undefined> | undefined>, action: {
    type: 'select',
    data: Array<Promise<PDFDoc | undefined> | undefined>
}) {
    return action.data;
}

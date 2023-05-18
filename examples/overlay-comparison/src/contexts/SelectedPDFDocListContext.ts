import React from "react";
import { PDFDocDataItem } from "../components/select-file-dialog/PDFDocDataItem";

export type PDFDocListContextDataType = {
    data: PDFDocDataItem[];
    dispatch?: React.Dispatch<{
        type: 'add' | 'remove';
        data: PDFDocDataItem;
    }>
} ;

export const SelectedPDFDocListContext = React.createContext<PDFDocListContextDataType>({
    data: []
});

export function PDFDocListReducer(state: PDFDocDataItem[], action: {
    type: 'add' | 'remove',
    data: PDFDocDataItem
}) {
    const { type, data } = action;
    switch(type) {
        case 'add':
            if(state.find(it => it.getFileName() === data.getFileName())) {
                return state;
            }
            return state.concat(data);
        case 'remove':
            return state.filter(it => it !== data);
        default:
    }
    return state;
}
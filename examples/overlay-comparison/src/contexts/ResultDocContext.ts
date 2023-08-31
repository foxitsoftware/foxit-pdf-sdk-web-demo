import React from "react";
import { PDFDoc } from '../foxit-sdk';

export type ResultDocContextDataType = {
    doc?: PDFDoc,
    dispatch?: React.Dispatch<{
        doc: PDFDoc | undefined
    }>
}

export const ResultDocContext = React.createContext<ResultDocContextDataType>({
    doc: undefined
});

export function resultDocContextReducer(state: PDFDoc | undefined, action: {
    doc: PDFDoc | undefined
}) {
    return action.doc;
}
import { useContext, useState } from "react";
import { ResultPDFViewerInstanceContext } from "../contexts/PDFViewerContexts";
import { useFileClose } from "./useFileClose";
import { useFileOpen } from "./useFileOpen";

export function useDocState() {
    
    const [ disable, setDisable ] = useState(true);
    const resultPDFViewerRef = useContext(ResultPDFViewerInstanceContext);
    
    useFileClose(() => {
        setDisable(true);
    }, resultPDFViewerRef);
    
    useFileOpen(() => {
        setDisable(false);
    }, resultPDFViewerRef);
    
    return disable;
}
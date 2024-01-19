import * as React from 'react';
import { MinusOutlineIcon, PlusOutlineIcon } from "../icons";
import { FloatingToolbarButton } from "./FloatToolbarButton";
import { OpacitySlider } from "./OpacitySlider";
import "./opacity-controller.scss";
import { useContext, useEffect, useState } from "react";
import { useDocState } from "../../common/useDocState";
import { ResultPDFViewerInstanceContext } from "../../contexts/PDFViewerContexts";
import { useFileOpen } from "../../common/useFileOpen";
import { useTranslation } from "react-i18next";

export function OpacityController() {
    const { t } = useTranslation('translation', {keyPrefix: 'OverlayComparison'});
    const [opacity, setOpacity] = useState(0);
    const disabled = useDocState();
    
    const resultPDFViewerRef = useContext(ResultPDFViewerInstanceContext);

    useEffect(() => {
        const resultPDFViewer = resultPDFViewerRef?.current;
        if(!resultPDFViewer) {
            return;
        }
        const optionService = resultPDFViewer.getOverlayComparisonOptionsService();
                    
        if(opacity < 0) {
            optionService.setTargetOpacity(0xFF);
            optionService.setSourceOpacity(Math.floor((1 + opacity / 100) * 0xFF));
        } else if(opacity > 0) {
            optionService.setTargetOpacity(Math.floor((1 - opacity / 100) * 0xFF));
            optionService.setSourceOpacity(0xFF);
        }
    }, [ opacity, resultPDFViewerRef]);
    
    
    useFileOpen(() => {
        setOpacity(0);
    }, resultPDFViewerRef);

    return (
        <div className={"fx_oc-opacity-controller " + (disabled? 'disabled' : '')}>
            <span className="fx_oc-opacity-controller-label" >{t("Opacity")}</span>
            <FloatingToolbarButton
                onClick={() => {
                    setOpacity(Math.max(-100, opacity - 10));
                }}
                icon={<MinusOutlineIcon></MinusOutlineIcon>}
            ></FloatingToolbarButton>
            <OpacitySlider
                disabled={disabled}
                value={opacity}
                onChange={(value) => {
                    setOpacity(value);
                }}
            ></OpacitySlider>
            <FloatingToolbarButton
                onClick={() => {
                    setOpacity(Math.min(100, opacity + 10));
                }}
                icon={<PlusOutlineIcon></PlusOutlineIcon>}
            ></FloatingToolbarButton>
        </div>
    );
}

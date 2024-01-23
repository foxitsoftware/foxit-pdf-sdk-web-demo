import * as React from 'react';
import { useEffect, useState } from "react";
import { PageNumberDropdown } from "../page-number-dropdown/PageNumberDropdown";
import './compare-page-range.scss';
import { PDFDocDataItem } from "./PDFDocDataItem";
import { useTranslation } from "react-i18next";

export function ComparePageRange(props: { label: string; pageCount: number, docData?: PDFDocDataItem, onChange: (fromNumber: number, toNumber: number) => void }) {
    const { pageCount } = props;
    const { t } = useTranslation('translation', {keyPrefix: 'OverlayComparison'});
    const [fromNumber, setFromNumber] = useState(1);
    const [toNumber, setToNumber] = useState(0);
    
    useEffect(() => {
        props.onChange(fromNumber, toNumber || 1);
    }, [fromNumber, toNumber]);

    useEffect(() => {
        setFromNumber(1);
        setToNumber(pageCount);
    }, [props.docData]);
    
    return (
        <div className="fx_oc-compare-page-range">
            <span className="fx_oc-compare-page-range-from-label">{props.label}: </span>
            <PageNumberDropdown
                pageCount={pageCount}
                value={fromNumber}
                onChange={value => {
                    setFromNumber(value);
                }}
            ></PageNumberDropdown>
            <span className="fx_oc-compare-page-range-to-label">{t("To")}: </span>
            <PageNumberDropdown
                pageCount={pageCount}
                value={toNumber || pageCount || 1}
                onChange={value => {
                    setToNumber(value);
                }}
            ></PageNumberDropdown>
        </div>
    );
}

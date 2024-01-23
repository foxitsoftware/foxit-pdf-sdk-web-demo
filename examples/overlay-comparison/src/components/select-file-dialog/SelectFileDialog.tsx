import * as React from 'react';
import { Modal } from "antd";
import { useReducer, useState } from "react";
import { PDFDocListReducer, SelectedPDFDocListContext } from "../../contexts/SelectedPDFDocListContext";
import { ComparePageRange } from "./ComparePageRange";
import "./index.scss";
import { PDFDocSelector } from "./PDFDocSelector";
import { CompareDialogResult } from './CompareDialogResult';
import { PDFDocDataItem } from "./PDFDocDataItem";
import { TransferButton } from "./TransferButton";
import { useTranslation } from "react-i18next";

export function SelectFileDialog(props: {
    open: boolean;
    onOk: (result: Partial<CompareDialogResult>) => void;
    onCancel: () => void
}) {
    const { t } = useTranslation('translation', {keyPrefix: 'OverlayComparison'});
    const [srcDocData, setSrcDocData] = useState<PDFDocDataItem>();
    const [targetDocData, setTargetDocData] = useState<PDFDocDataItem>();
    
    const [oldFileRange, setOldFileRange] = useState<[number, number]>();
    const [newFileRange, setNewFileRange] = useState<[number, number]>();
    
    const [oldFilePageCount, setOldFilePageCount] = useState(0);
    const [newFilePageCount, setNewFilePageCount] = useState(0);

    const [pdfDocList, dispatch] = useReducer(PDFDocListReducer, []);

    return (
        <Modal
            title={t("Compare PDF Files")}
            className="fx_oc-modal fx_oc-compare-select-file-dialog"
            width={640}
            open={props.open}
            onOk={() => {
                props.onOk({
                    srcDocData: srcDocData,
                    targetDocData: targetDocData,
                    srcRange: oldFileRange,
                    targetRange: newFileRange
                });
            }}
            onCancel={props.onCancel}
        >
            <SelectedPDFDocListContext.Provider
                value={{
                    data: pdfDocList,
                    dispatch: dispatch,
                }}
            >
                <article>
                    <fieldset className="fx_oc-compare-fieldset">
                        <legend>{t("Compare Files")}</legend>
                        <div className="fx_oc-compare-fieldset-content fx_oc-doc-selector-container">
                            <fieldset className="fx_oc-compare-fieldset">
                                <legend>{t("Old File")}</legend>
                                <PDFDocSelector
                                    value={srcDocData}
                                    onChange={(data, doc) => {
                                        setSrcDocData(data);
                                        if (doc) {
                                            setOldFilePageCount(
                                                doc.getPageCount()
                                            );
                                        } else {
                                            setOldFilePageCount(0);
                                        }
                                    }}
                                ></PDFDocSelector>
                            </fieldset>
                            <TransferButton onClick={() => {
                                const _src = srcDocData;
                                const _target = targetDocData;
                                const _srcPageCount = newFilePageCount;
                                const _targetPageCount = oldFilePageCount;
                                
                                setSrcDocData(_target);
                                setTargetDocData(_src);
                                setNewFilePageCount(_targetPageCount);
                                setOldFilePageCount(_srcPageCount);
                            }}></TransferButton>
                            <fieldset className="fx_oc-compare-fieldset">
                                <legend>{t("New File")}</legend>
                                <PDFDocSelector
                                    value={targetDocData}
                                    onChange={(data, doc) => {
                                        setTargetDocData(data);
                                        if (doc) {
                                            setNewFilePageCount(
                                                doc.getPageCount()
                                            );
                                        } else {
                                            setNewFilePageCount(0);
                                        }
                                    }}
                                ></PDFDocSelector>
                            </fieldset>
                        </div>
                    </fieldset>
                    <fieldset className="fx_oc-compare-fieldset fx_oc-compare-page-range-fieldset">
                        <legend>{t("Compare Page Range")}</legend>
                        <div className="fx_oc-compare-fieldset-content">
                            <ComparePageRange
                                label={t("Old File")}
                                pageCount={oldFilePageCount}
                                docData={srcDocData}
                                onChange={(from, to) => {
                                    setOldFileRange([from, to]);
                                }}
                            ></ComparePageRange>
                            <ComparePageRange
                                label={t("New File")}
                                pageCount={newFilePageCount}
                                docData={targetDocData}
                                onChange={(from, to) => {
                                    setNewFileRange([from, to]);
                                }}
                            ></ComparePageRange>
                        </div>
                    </fieldset>
                </article>
            </SelectedPDFDocListContext.Provider>
        </Modal>
    );
}

import * as React from 'react';
import { Button, Select } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { SourcePDFViewerInstanceContext } from "../../contexts/PDFViewerContexts";
import { PDFDocListContextDataType, SelectedPDFDocListContext } from "../../contexts/SelectedPDFDocListContext";
import { PDFDoc } from "../../foxit-sdk";
import { PDFDocDataItem } from "./PDFDocDataItem";
import "./select-file-dropdown.scss";
import { useTranslation } from "react-i18next";

export function SelectFileDropdown(props: {
    value: PDFDocDataItem | undefined;
    onChange?: (value: PDFDocDataItem | undefined) => Promise<PDFDoc | void>;
}) {
    const { t } = useTranslation('translation');
    const inputRef = useRef<HTMLInputElement | null>(null); 
    
    const { data: pdfDocList, dispatch } = useContext(SelectedPDFDocListContext) as PDFDocListContextDataType;
    
    const pdfViewerRef = useContext(SourcePDFViewerInstanceContext);
    const [selectedItem, setSelectedItem] = useState<PDFDocDataItem | undefined>();
    
    const selectPDFDocData = (data: PDFDocDataItem| undefined) => {
        props.onChange && props.onChange(data).then(doc => {
            if(data && doc) {
                dispatch && dispatch({
                    type: 'add',
                    data
                });
                setSelectedItem(data);
            } else {
                setSelectedItem(undefined);
            }
        });
    };
    
    useEffect(() => {
        selectPDFDocData(props.value);
    }, [props.value]);
    
    return (
        <div className="fx_oc-select-file">
            <Select
                disabled={pdfDocList.length < 1}
                value={selectedItem?.getFileName()}
                className="fx_oc-select-file-dropdown"
                options={pdfDocList.map((it) => {
                    return {
                        label: it.getFileName(),
                        disabled: it.selected,
                        value: it.getFileName()
                    };
                })}
                onChange={value => {
                    const selectedItem = pdfDocList.find(it => it.getFileName() === value);
                    selectPDFDocData(selectedItem);
                }}
            ></Select>
            <Button
                    type="text"
                    className="fx_oc-select-file-choose-button"
                    onClick={() => {
                        inputRef.current && inputRef.current.click();
                    }}
                >
                    <input
                        type="file"
                        ref={inputRef}
                        accept="application/pdf"
                        onChange={(e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) {
                                return;
                            }
                            const file = files[0];
                            e.target.value = "";
                            const pdfViewer = pdfViewerRef?.current;
                            if (!pdfViewer) {
                                return;
                            }
                            const data = new PDFDocDataItem(file, pdfViewer);
                            selectPDFDocData(data);
                        }}
                    ></input>
                    {t("Choose")}
                </Button>
        </div>
    );
}

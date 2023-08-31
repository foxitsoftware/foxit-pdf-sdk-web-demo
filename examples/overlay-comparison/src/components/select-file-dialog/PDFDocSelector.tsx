import * as React from 'react';
import { Modal } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { Defer } from "../../common/Defer";
import {
    PDFDocListContextDataType,
    SelectedPDFDocListContext,
} from "../../contexts/SelectedPDFDocListContext";
import { PDFDoc, PDFViewCtrl } from "../../foxit-sdk";
import { PasswordDialog } from "../dialogs/PasswordDialog";
import { PDFDocDataItem } from "./PDFDocDataItem";
import { PDFDocPreviewer } from "./PDFDocPreviewer";
import { SelectFileDropdown } from "./SelectFileDropdown";

const Error_Code = PDFViewCtrl.PDF.constant.Error_Code;

export function PDFDocSelector(props: {
    value: PDFDocDataItem | undefined;
    onChange: (
        docData: PDFDocDataItem | undefined,
        doc: PDFDoc | undefined
    ) => void;
}) {
    const { dispatch } = useContext(
        SelectedPDFDocListContext
    ) as PDFDocListContextDataType;
    
    const [selectedDocData, selectDocData] = useState<{
        data?: PDFDocDataItem,
        doc?: PDFDoc
    }>({});
    const passwordDeferRef = useRef(new Defer<string>());
    const [showPassword, setShowPassword] = useState(false);
    
    useEffect(() => {
        if(!props.value) {
            props.onChange(undefined, undefined);
            selectDocData({});
        } else {
            onSelectFile(props.value);
        }
    }, [props.value]);

    const onSelectFile = async (data: PDFDocDataItem | undefined) => {
        if (!data) {
            props.onChange(selectedDocData.data, selectedDocData.doc);
            return;
        }
        const doc = await data.getLoadedPDFDoc(
            async (doc, options, error, retry) => {
                if (
                    error &&
                    error.code === Error_Code.password
                ) {
                    passwordDeferRef.current = new Defer<string>();
                    setShowPassword(true);
                    try {
                        const newPassword = await passwordDeferRef.current
                            .promise;
                        Object.assign(options, {
                            password: newPassword,
                        });
                        data.password = newPassword;
                        return retry(options);
                    } catch (error) {
                        // cancelled
                        dispatch &&
                            dispatch({
                                type: "remove",
                                data: data,
                            });
                        return undefined;
                    }
                } else if(error && error.code === Error_Code.format) {
                    Modal.warning({
                        title: 'Foxit PDF SDK for Web',
                        content: 'The file format may be incorrect or corrupted!',
                    });
                    return;
                }
                return doc;
            }
        );
        if (!doc) {
            data.password = undefined;
            props.onChange(selectedDocData.data, selectedDocData.doc);
            return;
        }

        selectDocData({
            data: data, 
            doc
        });
        props.onChange(data, doc);
        return doc;
    };

    return (
        <div>
            <SelectFileDropdown
                value={props.value}
                onChange={onSelectFile}
            ></SelectFileDropdown>
            <PDFDocPreviewer docData={selectedDocData.data}></PDFDocPreviewer>
            <PasswordDialog
                visible={showPassword}
                onSubmit={(psw) => {
                    passwordDeferRef.current.resolve(psw);
                    setShowPassword(false);
                }}
                onCancel={() => {
                    passwordDeferRef.current.reject("");
                    setShowPassword(false);
                }}
            ></PasswordDialog>
        </div>
    );
}

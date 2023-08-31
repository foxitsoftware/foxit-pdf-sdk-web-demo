import React, { useContext, useEffect, useState } from "react";
import { CompareIcon } from "../icons/index";
import { SelectFileDialog } from "../select-file-dialog/SelectFileDialog";
import { ToolbarButton } from "./ToolbarButton";
import { useSliceDoc } from '../../common/useSliceDoc';
import { CompareDialogResult } from "../select-file-dialog/CompareDialogResult";
import { SelectedPDFDocContext } from "../../contexts/SelectedPDFDocContext";

export function OpenComparisonDialogButton() {
    const [showDialog, setShowDialog] = useState(false);
    const [data, setData] = useState<Partial<CompareDialogResult>>({});
    const [srcDocPromise, targetDocPromise] = useSliceDoc(data);
    
    const { dispatch } = useContext(SelectedPDFDocContext);
    
    useEffect(() => {
        dispatch && dispatch({
            type: 'select',
            data: [undefined, undefined]
        });
        dispatch && dispatch({
            type: 'select',
            data: [srcDocPromise, targetDocPromise]
        });
    }, [ srcDocPromise, targetDocPromise ]);
    
    return (
        <>
            <ToolbarButton
                icon={<CompareIcon></CompareIcon>}
                text="Compare"
                separate={false}
                onClick={() => {
                    setShowDialog(true);
                }}
            ></ToolbarButton>
            <SelectFileDialog
                open={showDialog}
                onOk={(data) => {
                    setData(data);
                    setShowDialog(false);
                }}
                onCancel={() => {
                    setShowDialog(false);
                }}
            ></SelectFileDialog>
        </>
    );
}

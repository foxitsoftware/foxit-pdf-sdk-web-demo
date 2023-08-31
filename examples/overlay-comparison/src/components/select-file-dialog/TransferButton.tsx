import * as React from 'react';
import { Button, ButtonProps } from "antd";
import { TransferIcon } from "../icons";
import './transfer-button.scss';

export function TransferButton(props: ButtonProps) {
    return <Button {...props} className="fv_oc-transfer-button" icon={
        <TransferIcon></TransferIcon>
    }></Button>
}
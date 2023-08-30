import { Button } from "antd";
import React from "react";
import './floating-toolbar-button.scss'
import { useDocState } from '../../common/useDocState';

export function FloatingToolbarButton(props: {
    icon: React.ReactNode;
    onClick: () => void;
    autoDisable?: boolean;
}) {
    const disable = useDocState();
    return <Button disabled = {props.autoDisable === false ? false : disable} className="fx_oc-floating-toolbar-button" onClick={props.onClick} icon={props.icon}></Button>
}
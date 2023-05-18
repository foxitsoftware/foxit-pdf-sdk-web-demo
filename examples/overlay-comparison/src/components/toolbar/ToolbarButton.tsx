import { Button, ButtonProps } from 'antd';
import React, { useRef } from 'react';
import './toolbar-button.scss';
let buttonId = 0;

export function ToolbarButton({ separate, icon, text , ...props}: ButtonProps & {
    icon: React.ReactNode,
    text: string;
    separate: boolean;
}) {
    const id = useRef(buttonId ++);
    const texts = separate ? text.split(' ') : [text];
    return <Button {...props} type="text" icon={icon} className="fx_oc-toolbar-button">
        {texts.map((text, i) => {
            return <span className="fx_oc-button-text" key={`${id.current}-${i}-${text}`}>{text}</span>
        })}
    </Button>
}

import * as React from 'react';
import './icon.scss';

export enum IconSize {
    HUGE = 'hg',
    LARGE = 'lg',
    MEDIUN = 'md',
    SMALL = 'sm',
    XS = 'xs',
    REM = 'rem',
    EM = 'em'
}

export function Icon(props: React.PropsWithChildren & {
    size: IconSize;
    component: React.ReactNode
}) {
    return <span className={'anticon fx_oc-icon-' + props.size}>
        {props.component}
    </span>
}

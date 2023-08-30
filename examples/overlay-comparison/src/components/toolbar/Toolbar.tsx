import React from 'react';
import './toolbar.scss';
import { OpenComparisonDialogButton } from './OpenComparisonDialogButton';
import { ZoomButton, ZoomOperationType } from './ZoomButton';
import { useDocState } from '../../common/useDocState';

export function Toolbar() {
    const disabled = useDocState();
    
    return <div className='fx_oc-toolbar'>
        <OpenComparisonDialogButton></OpenComparisonDialogButton>
        <ZoomButton disabled={disabled} type={ZoomOperationType.ZOOMIN} ></ZoomButton>
        <ZoomButton disabled={disabled} type={ZoomOperationType.ZOOMOUT} ></ZoomButton>
    </div>
}

import './PopoverTip.less'
import {  Popover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import React, { ReactNode } from 'react';

interface IProps {
  children: ReactNode | (() => ReactNode)
  direction: TooltipPlacement | undefined
  content: string
  title: ReactNode | string
}

export default ( { children, direction, content, title }:IProps) => {

  return (
    <Popover placement={direction} content={<div className="tooltip-content-des">{content}</div>} title={title ? title : null}>
      {children}
    </Popover>
  );
};

import { Popover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import './PopoverTip.less'
interface IProps {
  children: ReactNode | (() => ReactNode)
  direction: TooltipPlacement | undefined
  content: string
  title: ReactNode | string
}

class PopoverTip extends PureComponent<IProps, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    const { children, direction, content, title } = this.props;
    return (
      <Fragment>
        <Popover placement={direction} content={<div className="tooltip-content-des">{content}</div>} title={title ? title : null}>
          {children}
        </Popover>
      </Fragment>
    );
  }
}
export default PopoverTip;

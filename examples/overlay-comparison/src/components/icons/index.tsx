import React from "react";
import DownOutlined from '@ant-design/icons/DownOutlined';
import { Icon, IconSize } from "./Icon";
import { ReactComponent as CompareSVG } from '../../assets/compare.svg';
import { ReactComponent as MinusCircleSVG } from '../../assets/minus-circle.svg';
import { ReactComponent as PlusCircleSVG } from '../../assets/plus-circle.svg';
import { ReactComponent as CollapseSVG } from '../../assets/floating-toolbar/collapse.svg';
import { ReactComponent as ExpandSVG } from '../../assets/floating-toolbar/expand.svg';
import { ReactComponent as MinusOutlineSVG } from '../../assets/floating-toolbar/minus-outline.svg';
import { ReactComponent as PlusOutlineSVG } from '../../assets/floating-toolbar/plus-outline.svg';
import { ReactComponent as RotateLeftSVG } from '../../assets/floating-toolbar/rotate-left.svg';
import { ReactComponent as RotateRightSVG } from '../../assets/floating-toolbar/rotate-right.svg';
import { ReactComponent as TranslateDownSVG } from '../../assets/floating-toolbar/translate-down.svg';
import { ReactComponent as TranslateLeftSVG } from '../../assets/floating-toolbar/translate-left.svg';
import { ReactComponent as TranslateRightSVG } from '../../assets/floating-toolbar/translate-right.svg';
import { ReactComponent as TranslateUpSVG } from '../../assets/floating-toolbar/translate-up.svg';
import { ReactComponent as TransferSVG } from '../../assets/select-file-dialog/transfer.svg';
import { ReactComponent as BlankSVG } from '../../assets/blank.svg';
import { ReactComponent as PrevPageSVG } from '../../assets/floating-toolbar/prev-page.svg';
import { ReactComponent as NextPageSVG } from '../../assets/floating-toolbar/next-page.svg';

function createIcon(size: IconSize, SVG: React.FunctionComponent) {
    return <Icon size={size} component={<SVG></SVG>}></Icon>
}

export const CompareIcon = () => createIcon(IconSize.MEDIUN, CompareSVG);
export const MinusCircleIcon = () => createIcon(IconSize.MEDIUN, MinusCircleSVG);
export const PlusCircleIcon = () => createIcon(IconSize.MEDIUN, PlusCircleSVG);

export const CollapseIcon = () => createIcon(IconSize.SMALL, CollapseSVG);
export const ExpandIcon = () => createIcon(IconSize.SMALL, ExpandSVG);
export const MinusOutlineIcon = () => createIcon(IconSize.XS, MinusOutlineSVG);
export const PlusOutlineIcon = () => createIcon(IconSize.XS, PlusOutlineSVG);
export const RotateLeftIcon = () => createIcon(IconSize.SMALL, RotateLeftSVG);
export const RotateRightIcon = () => createIcon(IconSize.SMALL, RotateRightSVG);
export const TranslateDownIcon = () => createIcon(IconSize.SMALL, TranslateDownSVG);
export const TranslateLeftIcon = () => createIcon(IconSize.SMALL, TranslateLeftSVG);
export const TranslateRightIcon = () => createIcon(IconSize.SMALL, TranslateRightSVG);
export const TranslateUpIcon = () => createIcon(IconSize.SMALL, TranslateUpSVG);
export const PrevPageIcon = () => createIcon(IconSize.SMALL, PrevPageSVG);
export const NextPageIcon = () => createIcon(IconSize.SMALL, NextPageSVG);
export const TransferIcon = () => createIcon(IconSize.HUGE, TransferSVG);
export const BlankIcon = () => createIcon(IconSize.LARGE, BlankSVG);

export const ArrowIcon = () => createIcon(IconSize.EM, DownOutlined);
import { Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowIcon } from "../icons";
import './page-number-dropdown.scss';

function PageNumberDropdownRender(props: {
    value: number;
    pageCount: number,
    onChange: (newPageNumber: number) => void;
}) {
    const { pageCount, onChange } = props;
    const [value, setValue] = useState(props.value);
    const pageNumberList = useMemo(() => {
        return Array(pageCount)
        .fill(0)
        .map((_, i) => i + 1)
    }, [pageCount]);
    
    const options = useMemo(() => {
        return pageNumberList.map((it) => {
            return {
                label: it + "",
                value: it,
            };
        })
    }, [pageNumberList]);

    useEffect(() => {
        if(props.value === value) {
            return;
        }
        setValue(props.value);
    }, [props.value]);

    return <Select
        showSearch
        value={value}
        disabled={value < 1 || pageCount < 1}
        options={options}
        suffixIcon={<ArrowIcon></ArrowIcon>}
        onChange={value => {
            setValue(value);
            onChange(value);
        }}
        className="fx_oc-page-number-dropdown"
        popupClassName="fx_oc-page-number-dropdown-list"
        notFoundContent={<></>}
    >
    </Select>
}

export const PageNumberDropdown = React.memo(PageNumberDropdownRender);
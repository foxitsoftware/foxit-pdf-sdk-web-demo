import * as React from 'react';
import { Slider, SliderSingleProps } from "antd";

export function OpacitySlider(props: SliderSingleProps & {
    value: number;
    onAfterChange?: (value: number) => void;
    onChange?: (value: number) => void;
}) {
    return (
        <Slider
            {...props}
            marks={{
                0: {
                    style: {
                        display: "none",
                    },
                    label: "0",
                },
            }}
            tooltip={{
                open: false,
                formatter: (value) => {
                    return <span></span>;
                },
            }}
            className="fx_oc-slider"
            defaultValue={0}
            min={-100}
            max={100}
            included={false}
        ></Slider>
    );
}

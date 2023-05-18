import "./index.scss";
import React, { useState } from "react";
import { CollapseIcon, ExpandIcon } from "../icons/index";
import { FloatingToolbarButton } from "./FloatToolbarButton";
import { RotateButton, RotateDirection } from "./RotateButton";
import { TranslateButton, TranslateDirection } from "./TranslateButton";
import { OpacityController } from "./OpacityController";
import { PageNumberControl } from "./PageNumberControl";

export function FloatingToolbar() {
    const [isExpand, setExpand] = useState(true);

    return (
        <div className={"fx_oc-floating-toolbar " + (isExpand ? "expand" : "")}>
            <div className="fx_oc-floating-toolbar-content">
                <RotateButton
                    direction={RotateDirection.COUNTERCLOCKWISE}
                ></RotateButton>
                <RotateButton
                    direction={RotateDirection.CLOCKWISE}
                ></RotateButton>
                <TranslateButton
                    direction={TranslateDirection.UP}
                ></TranslateButton>
                <TranslateButton
                    direction={TranslateDirection.DOWN}
                ></TranslateButton>
                <TranslateButton
                    direction={TranslateDirection.LEFT}
                ></TranslateButton>
                <TranslateButton
                    direction={TranslateDirection.RIGHT}
                ></TranslateButton>
                <PageNumberControl></PageNumberControl>
                <OpacityController></OpacityController>
            </div>
            <div className="fx_oc-floating-toolbar-toggler">
                <FloatingToolbarButton
                    autoDisable={false}
                    onClick={() => {
                        setExpand(!isExpand);
                    }}
                    icon={
                        isExpand ? (
                            <CollapseIcon></CollapseIcon>
                        ) : (
                            <ExpandIcon></ExpandIcon>
                        )
                    }
                ></FloatingToolbarButton>
            </div>
        </div>
    );
}

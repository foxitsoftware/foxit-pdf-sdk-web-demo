import React from "react";
import {Dot} from "./../dot/Dot"
import "./tooltip.css";

interface Props {
  positionY: string;
  positionX: string;
  sideTriangle?: string;
  header: string;
  description: string;
  isFirst: boolean;
  isLast: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  handleDone: () => void;
}

// sideTriangle, header, description, clickNext, clickPrev
export const Tooltip: React.FC<Props> = React.memo(
  ({
    positionX,
    positionY,
    sideTriangle,
    header,
    isFirst,
    isLast,
    description,
    handleDone,
    handleNext,
    handlePrev,
  }) => {
    return (
      <div
        className={sideTriangle === "rigth" ? "wrapBlock-flex" : "wrapBlock"}
        style={{ top: positionY, left: positionX }}
      >
        <div className = {sideTriangle === "rigth" ? "dot-rigth": "dot-top"}><Dot /></div>
        <div className={`triangle ${sideTriangle}`}></div>
        <div className="modalWindow">
          <h1 className="header">{header}</h1>
          <span className="description">{description}</span>
          <div className="navigation">
            <div>
              {isFirst && (
                <button onClick={() => handlePrev()} className="btn btnPrev">
                  Previous
                </button>
              )}
            </div>
            {isLast ? (
              <button onClick={() => handleDone()} className="btn btnNext">
                Done
              </button>
            ) : (
              <button onClick={() => handleNext()} className="btn btnNext">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

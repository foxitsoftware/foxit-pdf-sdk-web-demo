import React from "react";
import "./modal.css"

interface Props  {
  positionY: string,
  positionX: string,
  sideTriangle?: string,
  header:string,
  description: string,
  isFirst: boolean,
  isLast: boolean,
  clickNext:() => void,
  clickPrev:() => void,
  clickDone:() => void
}

// sideTriangle, header, description, clickNext, clickPrev
export function InfoModal(props: Props) {
  return (
    <>
      <div className = {props.sideTriangle === "rigth"?'wrapBlock-flex':'wrapBlock'} style = {{top: props.positionY, left: props.positionX}}>
        <div className = {`triangle ${props.sideTriangle}`}></div>
        <div className = "modalWindow">
            <h1 className = "header">{props.header}</h1>
            <span className = "description">{props.description}</span>
            <div className = "navigation">
              <div>{props.isFirst && <button onClick = {() => props.clickPrev()}className = "btn btnPrev">Previous</button>}</div>
              {props.isLast?<button onClick = {() => props.clickDone()} className = "btn btnNext">Done</button>:<button onClick = {() => props.clickNext()} className = "btn btnNext">Next</button>}
            </div>
        </div>
      </div>
    </>
  );
}

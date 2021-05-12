import React from "react";
import "./modal.css"

interface Props  {
  positionY: string,
  positionX: string,
  sideTriangle?: string,
  header:string,
  description: string,
  clickNext:() => void,
  clickPrev:() => void
}

// sideTriangle, header, description, clickNext, clickPrev
export function InfoModal(props: Props) {
  return (
    <>
      <div className = {props.sideTriangle === "rigth"?'wrapBlock-flex':'wrapBlock'} style = {{top: props.positionY, right: props.positionX}}>
        <div className = {`triangle ${props.sideTriangle}`}></div>
        <div className = "modalWindow">
            <h1 className = "header">{props.header}</h1>
            <span className = "description">{props.description}</span>
            <div className = "navigation">
                <button onClick = {() => props.clickPrev()}className = "btnPrev">Previous</button>
                <button onClick = {() => props.clickNext()} className = "btnNext">Next</button>
            </div>
        </div>
      </div>
    </>
  );
}

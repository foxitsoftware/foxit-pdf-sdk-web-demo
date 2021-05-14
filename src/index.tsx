import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom"

console.info(process.env.EXAMPLES);

const appElement = document.getElementById("app");

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, appElement);

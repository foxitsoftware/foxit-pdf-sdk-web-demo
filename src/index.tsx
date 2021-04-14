import App from "./App";
import React from "react";
import ReactDOM from "react-dom";

console.info(process.env.EXAMPLES);

const appElement = document.getElementById("app");

ReactDOM.render(<App />, appElement);

window.document.domain = "netlify.app";

import * as React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const elm = document.createElement("div");
elm.id = "root";
elm.classList.add("fv__catalog-pdfui-wrapper");
document.body.appendChild(elm);

ReactDOM.render(
  React.createElement(App, null),
  elm
);

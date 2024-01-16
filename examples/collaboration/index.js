import * as React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import '../../src/i18n/config'
import App from './App';

const elm = document.createElement("div");
elm.id = "root";
elm.classList.add("fv__catalog-pdfui-wrapper");
document.body.appendChild(elm);

ReactDOM.render(
  React.createElement(App, null),
  elm
);

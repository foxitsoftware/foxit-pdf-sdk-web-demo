import React from 'react'
import './App.less';
import Uploader from "./Upload";
import BasicLayout from "./layout";
export default() => {
  return (
    <div className="main">
    <BasicLayout>
      <Uploader />
    </BasicLayout>
  </div>
  );
};

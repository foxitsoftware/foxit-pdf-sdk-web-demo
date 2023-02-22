import React from 'react';
import './StartPage.less'
import { Button, Tooltip } from 'antd';
import bgL from 'assets/icon/background-l.svg';
import bgS from 'assets/icon/background-s.svg';
import logo from 'assets/icon/logo.svg';
import { storageRemoveItem } from '../../utils/utils';

export default() => {
  const login = () => {
    storageRemoveItem(localStorage, 'creatorName');
    storageRemoveItem(localStorage, 'localFile');
    let href = `${window.location.origin}?participant=false`
    window.location.href = href;
    // let screenSyncId = storageGetItem(localStorage, 'screenSyncId');
    // if (screenSyncId) {
    //   storageRemoveItem(localStorage, 'screenSyncId');
    // }
    // //The creator account is currently randomly generated for logging in
    // let creatorName = randomMockName('Creator')
    // if (creatorName) {
    //   storageSetItem(localStorage, 'creatorName', creatorName);
    //   let pathname = history.location.pathname;
    //   history.push(pathname + 'collabCreator');
    // } else {
    //   throw new Error('Login failed')
    // }
  }
  return (
    <>
      <div className="start-box">
        <img src={bgL} className="start-bg-l" />
        <img src={bgS} className="start-bg-s" />
        <div>
          <div className="start-title">Foxit Web Collaboration Demo</div>
          <Button type="primary" shape="round" className="go-to-btn" style={{ backgroundColor: "#923094", border: 0 }} onClick={login}>Go to  Demo</Button>
        </div>
        <div className="start-footer">
          ©️Copyright belongs to foxit
          <Tooltip placement="topRight" title={null}>
            <img src={logo} className="start-logo" />
          </Tooltip>
        </div>
      </div>
    </>
  );
};

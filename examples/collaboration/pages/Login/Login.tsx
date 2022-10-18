import React, { Component, Fragment } from 'react';
import './Login.css'
import { Button, Tooltip } from 'antd';
import { randomMockName, storageSetItem } from '../../utils';
import bgL from 'assets/icon/bgL.svg';
import bgS from 'assets/icon/bgS.svg';
import logo from 'assets/icon/logo.svg';
class Login extends Component<any, any> {
  constructor(props: any) {
    super(props);
  }
  login() {
    //The creator account is currently randomly generated for login
    let creatorName = randomMockName('Creator')
    if (creatorName) {
      storageSetItem(localStorage, 'creatorName', creatorName);
      let pathname = this.props.history.location.pathname;
      this.props.history.push(pathname + 'collabAuthor');
    } else {
      throw new Error('Login failed')
    }
  }
  render() {
    return (
      <Fragment>
        <div className="login-wrap">
          <img src={bgL} className="bgL" />
          <img src={bgS} className="bgS" />
          <div>
            <div className="title">Foxit PDFViewer Collaboration Demo</div>
            {/* <div className="des">An  demo showing off the</div>
            <div className="des">WebViewer Collaboration modules</div> */}
            {/* <Button type="primary" shape="round" className="btn" style={{ backgroundColor: "#923094", border: 0 }} onClick={() => this.login()}>Go to  Demo</Button> */}
          </div>
          <div className="login-footer">
            ©️Copyright belongs to foxit
            <Tooltip placement="topRight" title={'v1.0.0'}>
              <img src={logo} className="login-logo" />
            </Tooltip>
          </div>
        </div>
      </Fragment>
    );
  }
}
export default Login;

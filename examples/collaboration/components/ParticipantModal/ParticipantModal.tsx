import React, { useState } from 'react';
import './ParticipantModal.less';
import { Modal, Input, Button, message } from 'antd';
import { lang } from '../../locales';
import lockPermissionIcon from 'assets/icon/lock-permission-icon.svg';
import { storageSetItem } from '../../utils/utils';

export default (props) => {
  const [emailValue, setEmailValue] = useState<string>('')
  const [loginPopupVisible, setLoginPopupVisible] = useState(false);
    //Get the input mailbox value
  const handleChange = (e: any) => {
    setEmailValue(e.target.value);
  }
  const loginSubmit = async () => {
    if (emailValue === '') {
      message.error(lang.submitEmailTip);
      return;
    }
    if (emailValue.match(/^\w+@\w+\.\w+$/i)) {
      storageSetItem(localStorage, 'participantName', emailValue);
      window.location.reload();
    } else {
      message.error(lang.emailFormatError);
    }
  }
  const reEnterShare=() =>{
    window.location.reload();
  }
  return (
    <>
      <Modal
        zIndex={10000}
        title={'Login'}
        visible={loginPopupVisible}
        onCancel={()=>setLoginPopupVisible(false)}
        footer={null}
        width={458}
        centered
      >
        <div className="login-modal-wrap">
          <div className="label">Email</div>
          <Input
            placeholder="Enter your email address"
            className="email-login-input"
            key={emailValue}
            defaultValue={emailValue}
            onBlur={handleChange}
          />
          <div className="to-login" onClick={loginSubmit}>
            Login
          </div>
        </div>
      </Modal>
      <Modal
        width={400}
        title={lang.dialogTitle}
        visible={props.permissionChangeVisible}
        zIndex={1022}
        closable={false}
        footer={[
          <Button
            type="primary"
            key={'Sure'}
            onClick={reEnterShare}
          >
            Sure
          </Button>,
        ]}
        centered
      >
        <div className="collab-modal-wrap">
          {lang.ModalDes.permissionChangeTip}
        </div>
      </Modal>
      {props.isShowLogin && (
        <>
          <div className="login-tip">
            Welcome to Foxit PDF Web Collaboration!{' '}
            <span onClick={()=>setLoginPopupVisible(true)}>Log in</span> to collaborate
            on this file.
          </div>
        </>
      )}
      {props.isShowNoPermissionPopup && (
        <div className="no-permission-wrap">
          <img src={lockPermissionIcon} className="lockPermission-img" />
          <div className="lock-des">
            Permission is required to view this file,
            <br />
            Please log in to verify your permissions
          </div>
          <div className="lock-login-btn" onClick={()=>setLoginPopupVisible(true)}>
            Login
          </div>
        </div>
      )}
      {props.isShowLogin && (
        <div className="login-btn" onClick={()=>setLoginPopupVisible(true)}>
          Login
        </div>
      )}
    </>
  );
};

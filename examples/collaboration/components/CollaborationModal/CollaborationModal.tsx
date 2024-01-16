import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import './CollaborationModal.less'
import { Button, Input, message, Modal } from 'antd';
import showPasswordIcon from 'assets/icon/show-pwd.svg'
import hidePasswordIcon from 'assets/icon/hide-pwd.svg'
import {lang} from '../../locales';
import { toStartLocation } from '../../utils/collab-utils';
import { storageRemoveItem } from '../../utils/utils';
export default (props) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
  const [email, setEmail] = useState('')
  const [isHidePassword, setIsHidePassword] = useState(true)

  const handleChange=(e: any)=> {
    setEmail(e.target.value)
  }
  const  submitPassword=async() => {
    if (email === '') {
      message.error(t("Component.enterPwdTip"));
      return;
    }
    props.submitPassword(email).then(()=>{
      setEmail('')
    });
  }
  const setPasswordVisible = () => {
    setIsHidePassword(!isHidePassword)
  }
  return (
    <>
      <Modal
        zIndex={10000}
        title={t("Password")}
        visible={props.passwordVisible}
        footer={null}
        className={"passwordPopup"}
        width={360}
        onCancel={props.closePasswordPopup}
        centered>
        <div className="login-password-wrap">
          <div className="password-label">{t("ModalDes.pwdTitle")}</div>
          <div className="input-password-wrap">
            <Input
              type={isHidePassword?"password":"text"}
              key={email}
              defaultValue={email}
              onBlur={handleChange}
            />
            <img src={isHidePassword?showPasswordIcon:hidePasswordIcon} onClick={setPasswordVisible}/>
          </div>
          <div className='password-footor'>
            <div className="to-login" onClick={submitPassword}>{t("OK")}</div>
            <div className="cancel-btn" onClick={props.closePasswordPopup}>{t("Cancel")}</div>
          </div>

        </div>
      </Modal>
      <Modal
        width={400}
        title={t("dialogTitle")}
        visible={props.collaborationEndedPopup}
        zIndex={1022}
        closable={false}
        footer={[
          <Button
            type="primary"
            key={'signOutShare'}
            onClick={() => {
              storageRemoveItem(sessionStorage, 'collaborationId');
              toStartLocation()
            }}
          >
            {t("Sure")}
          </Button>,
        ]}
        centered
      >
        <div className="collab-modal-wrap">
          {t("ModalDes.collabHasEndedTip")}
        </div>
      </Modal>
    </>
  );
};

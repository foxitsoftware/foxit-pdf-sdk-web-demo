import React, { PureComponent } from 'react';
import './PasswordPopup.less'
import { Input, message, Modal } from 'antd';
import showPwd from 'assets/icon/show_pwd.svg'
import hidePwd from 'assets/icon/hide_pwd.svg'
import {lang} from '../../locales';
interface IProps {
  visible: boolean
  onSubmit:Function
  closePopup:any
}
interface IState {
  emailValue:string
  hidePwdFlag:boolean
}
class PasswordPopup extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      emailValue:"",
      hidePwdFlag:true
    }
  }
  handleChange(e: any) {
    this.setState({
      emailValue: e.target.value
    })
  }
  async loginSubmit() {
    const { emailValue } = this.state;
    if (emailValue === '') {
      message.error(lang.Component.enterPwdTip);
      return;
    }
    this.props.onSubmit(emailValue).then(()=>{
      this.setState({
        emailValue: ""
      })
    });
  }
  showAndHidePwd(){
    this.setState({
      hidePwdFlag:!this.state.hidePwdFlag
    })
  }
  render() {
    const { visible } = this.props;
    const {emailValue,hidePwdFlag}=this.state;
    return (
      <Modal
        zIndex={10000}
        title={"Password"}
        visible={visible}
        footer={null}
        className={"passwordPopup"}
        width={360}
        onCancel={this.props.closePopup}
        centered>
        <div className="login-password-wrap">
          <div className="label-Password">{lang.ModalDes.pwdTitle}</div>
          <div className="input-pwd-wrap">
            <Input
              type={hidePwdFlag?"password":"text"}
              className='email-login-input'
              key={emailValue}
              defaultValue={emailValue}
              onBlur={this.handleChange.bind(this)}
            />
            {
              hidePwdFlag?
              <img src={showPwd} className="showPwd" onClick={this.showAndHidePwd.bind(this)}/>:
              <img src={hidePwd} className="showPwd" onClick={this.showAndHidePwd.bind(this)}/>
            }

          </div>
          <div className='bottom-btn'>
            <div className="to-login" onClick={this.loginSubmit.bind(this)}>Ok</div>
            <div className="cancel-btn" onClick={this.props.closePopup}>Cancel</div>
          </div>

        </div>
      </Modal>
    );
  }
}
export default PasswordPopup;

import React, { PureComponent } from 'react';
import './PasswordPopup.less'
import { Input, message, Modal } from 'antd';
interface IProps {
  visible: boolean
  onSubmit:Function
  closePopup:any
}
interface IState {
  emailValue:string
}
class PasswordPopup extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      emailValue:""
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
      message.error('Please enter your password');
      return;
    }
    this.props.onSubmit(emailValue).then(()=>{
      this.setState({
        emailValue: ""
      })
    });
  }
  render() {
    const { visible } = this.props;
    const {emailValue}=this.state;
    return (
      <Modal
        zIndex={10000}
        title={"Password"}
        visible={visible}
        footer={null}
        width={458}
        onCancel={this.props.closePopup}
        centered>
        <div className="login-modal-wrap">
          <div className="label"></div>
          <Input
            type='password'
            placeholder="Enter your Password"
            className='email-login-input'
            key={emailValue}
            defaultValue={emailValue}
            onBlur={this.handleChange.bind(this)}
          />
          <div className="to-login" onClick={this.loginSubmit.bind(this)}>Ok</div>
        </div>
      </Modal>
    );
  }
}
export default PasswordPopup;

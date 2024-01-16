import React, { PureComponent } from 'react';
import { useTranslation } from "react-i18next";
import './InvitePopup.less'
import { Modal, Input, Button, message } from 'antd';
import DropByAnnotPermission from '../DropByAnnotPermission/DropByAnnotPermission';
import clearIcon from 'assets/icon/clear.svg';
import {lang} from '../../locales';
interface IState {
  email: string
  inviteList: any[]
}

class InvitePopup extends PureComponent<any, IState> {
  t: any;
  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
      inviteList: []
    }
    const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
    this.t = t;
  }
  handleChange(e: any) {
    this.setState({
      email: e.target.value
    })
  }
  addEmail() {
    const { email, inviteList } = this.state;
    if (email === '') {
      message.error(this.t("submitEmailTip"));
      return;
    }
    if (email.match(/^\w+@\w+\.\w+$/i)) {
      let emailLists = inviteList
      let emailArr = emailLists.map(item => {
        return item.email;
      })
      if (emailArr.indexOf(email) !== -1) {
        message.error(this.t("Component.emailAlreadyExist"));
        return;
      }
      emailLists.push({
        isAllowComment: true,
        email: email
      })
      this.setState({
        inviteList: emailLists,
        email: ""
      })
    } else {
      message.error(this.t("emailFormatError"));
    }
  }
  sendInvite() {
    this.props.sendInvite(this.state.inviteList).then(() => {
      this.setState({
        inviteList: [],
        email: ""
      })
    });

  }
  setAnnotPermission(key:string,item:any){
    const {inviteList}=this.state;
    let editPermissionList = inviteList.map(invitor=> {
      if(invitor.email===item.email){
        invitor.isAllowComment = key === 'Comment'
      }
      return {
        ...invitor
      }
    })
    this.setState({
      inviteList:editPermissionList
    })
  }
  deleteEamil(item:any){
    const {inviteList}=this.state;
    let lastInviteList=inviteList.filter((invitor)=>{
      return invitor.email!==item.email
    })
    this.setState({
      inviteList:lastInviteList
    })
  }
  render() {
    const { visible } = this.props;
    const { inviteList } = this.state;
    const t = this.t;
    return (
      <Modal
        title={<div onClick={() => this.props.backCollabSettingPopup()}>{t("Back")}</div>}
        visible={visible}
        footer={[
          <Button type="primary" className="send-invite" disabled={inviteList.length === 0} key={"sendInvite"} onClick={this.sendInvite.bind(this)}>{t("Send invitation")}</Button>
        ]}
        closable={true}
        width={500}
        centered
        onCancel={() => this.props.closeInviteMembers()}>
        <div className="invite-wrap">
          <div className="email-wrap">
            <Input placeholder={t("Email ,command Enter to add ")} className='email-input' key={this.state.email} defaultValue={this.state.email} onBlur={this.handleChange.bind(this)} />
            <Button type="primary" onClick={this.addEmail.bind(this)} className='email-btn'>{t("Add")}</Button>
          </div>
          {
            this.state.inviteList.length > 0 &&
            <div className="emailList">
              <div className="title">{t("Added people")}</div>
              {
                this.state.inviteList.map((item, index) => {
                  return (<div className="participant-list" key={index}>
                    <div className="invite-left-wrap">
                      <div className="portrait" style={{ background: "#707070D6" }}>{item.email.substr(0, 1)}</div>
                      <div className="nickName">{item.email}</div>
                    </div>
                    <div className="invite-drop-wrap">
                      <DropByAnnotPermission
                        isComment={item.isAllowComment?"Comment":"View"}
                        isParticipantsUse={true}
                        setPermission={(key:string)=>this.setAnnotPermission(key,item)}
                      />
                    </div>
                    <img className="clear-icon" src={clearIcon} onClick={this.deleteEamil.bind(this,item)}/>
                  </div>)
                })
              }
            </div>
          }
        </div>
      </Modal>
    );
  }
}
export default InvitePopup;

import React, { useState } from 'react';
import './InviteUser.less'
import { Modal, Input, Button, message } from 'antd';
import clearIcon from 'assets/icon/clear.svg';
import {lang} from '../../locales';
import { useCurrentCollaboration } from '../../context/collaboration';
import SetCommentPermission from '../SetCommentPermission/SetCommentPermission';

export default  (props) => {
  const [email,setEmail]=useState<string>('');
  const {collaboration}=useCurrentCollaboration()
  const [inviteList,setInviteList]=useState<any>([])
  const handleChange=(e: any) =>{
    setEmail(e.target.value)
  }
  const addEmail=() =>{
    if (email === '') {
      message.error(lang.submitEmailTip);
      return;
    }
    if (email.match(/^\w+@\w+\.\w+$/i)) {
      let emailLists = inviteList
      let emailArr = emailLists.map(item => {
        return item.email;
      })
      if (emailArr.indexOf(email) !== -1) {
        message.error(lang.Component.emailAlreadyExist);
        return;
      }
      emailLists.push({
        isAllowComment: true,
        email: email
      })
      setEmail("")
      setInviteList(emailLists)
    } else {
      message.error(lang.emailFormatError);
    }
  }
  const sendInvite=async()=> {
    // let emailLists = emails.map((item) => { return item.email })
    try{
      let isInvited = await collaboration?.addMembers(inviteList);
      if (isInvited) {
        message.info(lang.CollabAuthor.inviteSuccess);
      //  setEmail('');
      //  setInviteList([]);
        props.onExit(isInvited);
      }
    }catch(error:any){
      if (error.ret === 400) {
        message.error(error.message);
      } else {
        message.error(lang.CollabAuthor.inviteFailed);
      }
    }

  }
  const setAnnotPermission=(key:string,item:any)=>{
    let editPermissionList = inviteList.map(invitor=> {
      if(invitor.email===item.email){
        invitor.isAllowComment = key === 'Comment'
      }
      return {
        ...invitor
      }
    })
    setInviteList(editPermissionList)
  }
  const deleteEamil=(item:any)=>{
    let lastInviteList=inviteList.filter((invitor)=>{
      return invitor.email!==item.email
    })
    setInviteList(lastInviteList)
  }
  return (
    <Modal
      title={<span onClick={() => props.onExit()}>Back</span>}
      visible={true}
      footer={[
        <Button type="primary" className="send-invite" disabled={inviteList.length === 0} key={"sendInvite"} onClick={sendInvite}>Send invitation</Button>
      ]}
      closable={true}
      width={500}
      centered
      onCancel={() => props.onExit()}>
      <div className="invite-wrap">
        <div className="email-wrap">
          <Input placeholder="Email ,command Enter to add " className='email-input' key={"email"} value={email} onChange={handleChange} />
          <Button type="primary" onClick={addEmail} className='email-btn'>Add</Button>
        </div>
        {
          inviteList.length > 0 &&
          <div className="email-list">
            <div className="title">Added people</div>
            {
              inviteList.map((item, index) => {
                return (<div className="participant-list" key={index}>
                  <div className="invite-left-wrap">
                    <div className="portrait" style={{ background: "#707070D6" }}>{item.email.substr(0, 1)}</div>
                    <div className="nickName">{item.email}</div>
                  </div>
                  <div className="invite-drop-wrap">
                    <SetCommentPermission
                      isComment={item.isAllowComment?"Comment":"View"}
                      isParticipantsUse={true}
                      setCommentPermission={(key:string)=>setAnnotPermission(key,item)}
                    />
                  </div>
                  <img className="clear-icon" src={clearIcon} onClick={()=>deleteEamil(item)}/>
                </div>)
              })
            }
          </div>
        }
      </div>
    </Modal>
  )
}

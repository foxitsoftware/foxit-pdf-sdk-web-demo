import { Button, message, Modal} from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import {lang} from '../../locales';
import { useIsLoading } from '../../context/isLoading';
import InviteIcon from 'assets/icon/invite-icon.svg';
import './CreatorOperationModal.less';
import shareMembers from 'assets/icon/share-members.svg';
import copyLinkIcon from 'assets/icon/copy-link.svg';
import Participants from '../Participants/Participants';
import copy from 'copy-to-clipboard';
import { useCurrentCollaboration } from '../../context/collaboration';
import InviteUser from '../InviteUser/InviteUser';
import SetCommentPermission from '../SetCommentPermission/SetCommentPermission';
import SetPublicPermission from '../SetPublicPermission/SetPublicPermission';
import { toStartLocation } from '../../utils/collab-utils';
import { storageRemoveItem } from '../../utils/utils';

export default (props) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
  const {setIsLoading}=useIsLoading()
  const {collaboration}=useCurrentCollaboration()
  const [visible,setVisible]=useState(true)
  const [isInvitePopup,setInvitePopup]=useState(false)
  const [isShowStopCollabPopup,setShowStopCollabPopup]=useState(false)
  const [isPublic,setIsPublic]=useState('Anyone');
  const [isComment, setIsComment] = useState('Comment');

  useEffect(()=>{
    (async()=>{
      let isAnyOne=collaboration?.isDocPublic?"Anyone" : "NoAnyone";
      //Get whether the collaboration has comment permission
      let permission = await collaboration?.getPermission();
      let isAllowComment = await permission!.isAllowComment();
      let result=isAllowComment?"Comment" : "View";
      setIsComment(result)
      setIsPublic(isAnyOne)
    })()
  },[])
  const copyLink=()=>{
     //Construct the address of the collaboration link
    let collabLink =`${window.location.origin}${window.location.pathname}?participant=true&collaborationId=${collaboration!.id}`;
    //let collabLink = `${window.location.origin}${PUBLIC_PATH}collabParticipant?collaborationId=${collaboration!.id}`;
    copy(collabLink)
    message.info(t("copySuccess"));
  }
  const stopShare=()=>{
    const stopShareFn = async () => {
      setIsLoading(true)
      await collaboration?.end();
    }
    stopShareFn().then(() => {
      storageRemoveItem(sessionStorage, 'collaborationId');
      setVisible(false)
      setShowStopCollabPopup(false)
      toStartLocation();
    }).catch((error) => {
      message.error(error.message);
      setIsLoading(false);
    })
  }
  const setPublicPermissionFn=async(key: string) =>{
    let isDocPublic = key === 'Anyone'
    if (collaboration) {
      let isUpdatePermissionSuccess=await collaboration.updatePermission({ isDocPublic }).catch((result: string) => {
        return false;
      })
      if(isUpdatePermissionSuccess){
        setIsPublic(key)
      }else{
        message.error(t("CollabAuthor.permissionSetError"));
      }
    }
  }
  const setCommentPermission = async (key: string) => {
    let isDocComment = key === 'Comment'
    if (collaboration) {
      let isUpdatePermissionSuccess=await collaboration.updatePermission({ isAllowComment: isDocComment }).catch((result: string) => {
        return false;
      })
      if(isUpdatePermissionSuccess){
        setIsComment(key)
      }else{
        message.error(t("CollabAuthor.permissionSetError"));
      }
    }
  }
  const onExitInvite = (isInvited) => {
    if (isInvited) {
      props.onInvitedMembers()
    }
    setInvitePopup(false)
  }
  return (
   <>
    <div className="collab-share" onClick={() => { setVisible(true) }}>
        <img src={shareMembers} className="create-share" />
        {t("Share")}
    </div>
    <Modal title={t("Share files")} visible={visible} footer={null} closable={true} width={500} centered onCancel={() => setVisible(false)}>
      <div className="creator-operation-wrap">
        <div className="drop-wrap">
          <div className="permission-wrap">
            <SetPublicPermission isPublic={isPublic} setPublicPermissionFn={setPublicPermissionFn}/>
          </div>
          <div className="annot-permission-wrap">
            <SetCommentPermission isComment={isComment} dropDisabled={isPublic==='NoAnyone'}  setCommentPermission={setCommentPermission}/>
          </div>
        </div>
        <div className="participants-box">
          <Participants
              isShowPermissionDrop={true}
              collaborationMembers={props.collaborationMembers}
          />
          <div className="invite" onClick={() => setInvitePopup(true)}>
          <img src={InviteIcon} />{t("Invite")}</div>
        </div>
        <div className="creator-operation-footor">
          <div className="stop-collab" onClick={()=>setShowStopCollabPopup(true)}>{t("Stop share")}</div>
          <div className="copy-link" onClick={copyLink}>{t("Copy link")}<img src={copyLinkIcon} /></div>
        </div>
      </div>
    </Modal>
    <Modal
      title={t("dialogTitle")}
      visible={isShowStopCollabPopup}
      onCancel={()=>setShowStopCollabPopup(false)}
      footer={[
        <Button type="primary" className="stop-collab-continue" onClick={stopShare} key={"continue"}>{t("Continue")}</Button>
      ]}
      centered>
      <div className="collab-modal-wrap">
        {t("ModalDes.endCollabTip")}
      </div>
      </Modal>
      {isInvitePopup&&<InviteUser
        onExit={(isInvited)=>onExitInvite(isInvited)}
      />}
   </>
  );
};

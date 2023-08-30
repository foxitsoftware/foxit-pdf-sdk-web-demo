import { Button, Checkbox, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import {lang} from '../../locales';
import createShareIcon from 'assets/icon/create-share.svg'
import PopoverTip from '../PopoverTip/PopoverTip';
import {privacyPolicy } from '../../utils/collab-utils';
import './CreateCollaboration.less';

export default (props) => {
  const [isCheckPrivacy,setIsCheckPrivacy]=useState(false)
  const [isCreateCollab,setIsCreateCollab]=useState(false)
  const [pdfDocPermission,setPdfDocPermission]=useState<any>(null)
  const [openDocFailed,setOpenDocFailed]=useState(false)
  useEffect(()=>{
    setPdfDocPermission(props.pdfDocPermission)
  },[props.pdfDocPermission])
  useEffect(()=>{
    setOpenDocFailed(props.openDocFailed)
  },[props.openDocFailed])

  const createShare=()=>{
    if (!pdfDocPermission.isPortfolio) {
      if (openDocFailed) {
        message.error(lang.collabOpenFailed)
      }else if(pdfDocPermission.hasAnnotFormPermission){
        setIsCreateCollab(true)
      }else {
        message.error(lang.CollabAuthor.noCommentPermission)
      }
    }else {
      message.error(lang.CollabAuthor.portfolioTip)
    }
  }
  const checkBoxChange=(e)=>{
    setIsCheckPrivacy(e.target.checked)
  }
  const createCollab=()=>{
    props.createCollab()
    setIsCreateCollab(false)
  }
  return (
   <>
    <PopoverTip direction={"bottom"} content={"Create Share"} title={null}>
      <div className="share-btn" onClick={createShare}>
        <img src={createShareIcon} className="create-share" />
        Share
      </div>
    </PopoverTip>
    <Modal
      title={"Start Collaboration"}
      visible={isCreateCollab}
      onCancel={()=>setIsCreateCollab(false)}
      footer={null}
      centered>
      <div className="collab-modal-wrap">
        <div>{lang.ModalDes.getSharedLink}</div>
        <div className="create-footor-wrap">
          <div className="privacy-wrap">
            <Checkbox onChange={checkBoxChange}><a href={privacyPolicy} target="_blank">Foxit Privacy Policy</a></Checkbox>
          </div>
          <Button type="primary" key={'create-collab-btn'} disabled={!isCheckPrivacy} onClick={createCollab}>Create</Button>
        </div>

      </div>
    </Modal>
   </>
  );
};

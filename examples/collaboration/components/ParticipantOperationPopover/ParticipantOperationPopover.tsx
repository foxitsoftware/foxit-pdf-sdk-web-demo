import React, {useState } from 'react';
import './ParticipantOperationPopover.less'
import { Modal, Button, message, Popover } from 'antd';
import {lang} from '../../locales';
import { useCurrentCollaboration } from '../../context/collaboration';
import copyLinkIcon from 'assets/icon/copy-link.svg'
import Participants from '../Participants/Participants';
import { PUBLIC_PATH } from '../../config';
import copy from 'copy-to-clipboard';
import { useIsLoading } from '../../context/isLoading';

export default  (props) => {
  const [isShowRemovePopup, setIsShowRemovePopup] = useState<boolean>(false);
  const [settingPopoverVisible, setSettingPopoverVisible] = useState<boolean>(false);
  const { setIsLoading } = useIsLoading();
  const { collaboration } = useCurrentCollaboration()

  const removeMe = async () => {
    setIsLoading(true)
    if (collaboration) {
      try {
        let result = await collaboration.quit();
        if (result === false) {
          message.error(lang.CollabParticipant.removeError);
        }
        setIsLoading(false)
      } catch {
        setIsLoading(false)
        message.error(lang.CollabParticipant.removeError);
      }
    }
  }
  const copyLink = async () => {
    const { id: docId } = collaboration!;
    if (docId) {
      let linkValue = `${window.location.origin}${window.location.pathname}?participant=true&collaborationId=${docId}`;
      copy(linkValue);
      message.info(lang.copySuccess);
    } else {
      message.error(lang.CollabParticipant.noExistCollabId);
    }
  }
  const content = (
    <div>
      <div className="sets-wrap">
        <div className="participants-box">
          <Participants collaborationMembers={props.collaborationMembers}/>
        </div>
        <div className="footor-wrap">
          <div className="stop-collab" onClick={()=>setIsShowRemovePopup(true)}>Remove Me</div>
          <div className="copy-link" onClick={copyLink}>Copy link<img src={copyLinkIcon} /></div>
        </div>
      </div>
    </div>
  );
  return (
    <>
    <Popover placement={"bottomRight"} content={content} trigger="click" visible={settingPopoverVisible} onVisibleChange={(visible) => setSettingPopoverVisible(visible)} title={null}>
      {props.children}
    </Popover>
    <Modal
      title={lang.dialogTitle}
      visible={isShowRemovePopup}
      zIndex={1300}
      onCancel={()=>setIsShowRemovePopup(false)}
      footer={[
        <Button type="primary" key={"continue remove"} onClick={removeMe}>Continue</Button>
      ]}
      centered>
      <div className="collab-modal-wrap">
        {lang.ModalDes.RemoveMe}
      </div>
    </Modal>
    </>
  )
}

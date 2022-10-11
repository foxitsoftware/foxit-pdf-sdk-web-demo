import React, { PureComponent } from 'react';
import './CollabSettingPopup.less'
import { Modal } from 'antd';
import DropByIsPublicPermission from '../DropByIsPublicPermission/DropByIsPublicPermission';
import Participants from '../Participants/Participants';
import copyLink from 'assets/icon/copy-link.svg';
import InviteIcon from 'assets/icon/invite-icon.svg';
import DropByAnnotPermission from '../DropByAnnotPermission/DropByAnnotPermission';
interface IProps {
  visible: boolean
  closeCollabSettingPopup: Function
  inviteMemberPopup: Function
  copyLink: Function

  editAnnotPermissionByUser:Function
  stopShare: Function
}
interface IState {
}
class CollabSettingPopup extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {

    }
  }
  setUserPermission(key:string,item:any){
    this.props.editAnnotPermissionByUser(key,item)
  }
  render() {
    const { visible } = this.props;
    return (
      <Modal title={"Share"} visible={visible} footer={null} closable={true} width={500} centered onCancel={() => this.props.closeCollabSettingPopup()}>
        <div className="collab-set-wrap">
          <div className="drop-wrap">
            <div className="permission-wrap">
              <DropByIsPublicPermission/>
            </div>
            <div className="annot-permission-wrap">
              <DropByAnnotPermission/>
            </div>
          </div>
          <div className="participants-box">
            <Participants
              isShowPermissionDrop={true}
              setUserPermission={this.setUserPermission.bind(this)}
            />
            <div className="invite" onClick={() => this.props.inviteMemberPopup()}>
            <img src={InviteIcon} />Invite</div>
          </div>
          <div className="footor-wrap">
            <div className="stop-collab" onClick={() => this.props.stopShare()}>Stop share</div>
            <div className="copy-link" onClick={() => this.props.copyLink()}>Copy link<img src={copyLink} /></div>
          </div>
        </div>
      </Modal>
    );
  }
}
export default CollabSettingPopup;

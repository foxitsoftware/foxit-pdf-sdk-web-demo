import React, { PureComponent } from 'react';
import { useTranslation } from "react-i18next";
import './ParticipantSettingPopover.less'
import copyLink from 'assets/icon/copy-link.svg'
import Participants from '../Participants/Participants';
import { Button, Modal, Popover } from 'antd';
import {lang} from '../../locales';
interface IState {
  settingPopoverVisible: boolean
  isShowRemovePopup: boolean
}

class ParticipantSettingPopover extends PureComponent<any, IState> {
  t: any;
  constructor(props: any) {
    super(props);
    this.state = {
      isShowRemovePopup: false,
      settingPopoverVisible: false
    }
  }
  async handleVisibleChange(visible: boolean) {
    this.setState({ settingPopoverVisible: visible });
  }
  hideModal() {
    this.setState({ isShowRemovePopup: false });
  }
  openRemovePopup() {
    this.setState({
      isShowRemovePopup: true,
      settingPopoverVisible: false
    })
  }
  render() {
    const { children } = this.props;
    const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
    const content = (
      <div>
        <div className="sets-wrap">
          <div className="participants-box">
            <Participants/>
          </div>
          <div className="footor-wrap">
            <div className="stop-collab" onClick={this.openRemovePopup.bind(this)}>{t("Remove Me")}</div>
            <div className="copy-link" onClick={() => this.props.copyLink()}>{t("Copy link")}<img src={copyLink} /></div>
          </div>
        </div>
      </div>
    );
    return (
      <>
        <Popover placement={"bottomRight"} content={content} trigger="click" visible={this.state.settingPopoverVisible} onVisibleChange={(visible) => this.handleVisibleChange(visible)} title={null}>
          {children}
        </Popover>
        <Modal
          title={t("dialogTitle")}
          visible={this.state.isShowRemovePopup}
          onCancel={this.hideModal.bind(this)}
          footer={[
            <Button type="primary" className="create-collab-btn" key={"continue remove"} onClick={() => this.props.removeMe()}>{t("Continue")}</Button>
          ]}
          centered>
          <div className="create-collab-wrap">
            <div className="createDes">{t("ModalDes.RemoveMe")}</div>
          </div>
        </Modal>
      </>
    );
  }
}
export default ParticipantSettingPopover;

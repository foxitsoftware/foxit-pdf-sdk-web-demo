import React, { Component, Fragment } from 'react';
import './CollabAuthor.css'
import { Modal, Button, message, Col, Row, Tooltip, Checkbox } from 'antd'
import { useTranslation } from "react-i18next";
import { Collaboration } from '@foxitsoftware/web-collab-client'
import { Member } from "../../types/index";
import copy from 'copy-to-clipboard';
import SharesAndFilesPopup from '../../components/SharesAndFilesPopup/SharesAndFilesPopup';
import {collabAuthorSteps, randomMockName, storageGetItem, storageRemoveItem, storageSetItem, privacyPolicy} from '../../utils';
import {lang} from '../../locales';
import { PUBLIC_PATH, serverUrl } from "../../config";
import moreIcon from 'assets/icon/more-icon.svg';
import shareMembers from 'assets/icon/share-members.svg';
import createShare from 'assets/icon/create-share.svg'
import CollabSettingPopup from '../../components/CollabSettingPopup/CollabSettingPopup';
import OnlineMembers from '../../components/OnlineMembers/OnlineMembers';
import InvitePopup from '../../components/InvitePopup/InvitePopup';
import PopoverTip from '../../components/PopoverTip/PopoverTip';
import { MemberContext, PermissionContext, UserContext } from '../../context';

interface IState {
  isGuideStep: boolean;
  onlineMembers: any[]
  collabMembers: any[] | undefined
  currentUser: Member | null
  curCollaboration: Collaboration | null
  isCollabMode: boolean;
  isCreateCollab: boolean;
  isLinkVisible: boolean;
  chooseFileInfo: any;
  linkUrl: string;
  collabLists: any[]
  fileListPopupVisible: boolean
  isSetCollabPopup: boolean
  isInvitePopup: boolean
  isPublic: boolean
  isDocComment: boolean
  isShowStopCollabPopup: boolean
  isFirstVisit:boolean
  isCheckPrivacy:boolean

}
class CollabAuthor extends Component<any, IState> {
  state: IState
  t: any;
  constructor(props: any) {
    super(props);
    this.state = {
      isCheckPrivacy:false,
      isFirstVisit:true,
      collabMembers: [],
      isGuideStep: true,
      isShowStopCollabPopup: false,
      isPublic: true,
      isDocComment: true,
      isInvitePopup: false,
      isSetCollabPopup: false,
      fileListPopupVisible: false,
      onlineMembers: [],
      currentUser: null,
      curCollaboration: null,
      isCollabMode: false,
      isCreateCollab: false,
      isLinkVisible: false,
      chooseFileInfo: null,
      linkUrl: "",
      collabLists: [],
    };
    const { t } = useTranslation('translation',{keyPrefix: "Collaboration"});
    this.t = t;
  }
  async openFile(item: any) {
    const { curCollaboration, isCollabMode, isFirstVisit} = this.state;
    if (curCollaboration && isCollabMode) {
      await curCollaboration.end()
    }
    let fileUrl = item.path;

    this.props.openLocalDoc(fileUrl, item.name).then(() => {
      if (isFirstVisit) {
        /* const driver = this.props.stepDriver */
        // Define the steps for introduction
        /* driver.defineSteps(collabAuthorSteps); */
        // Start the introduction
        /* driver.start(); */
      }
      this.setState({
        isFirstVisit: false
      })
    })
    this.setState({
      chooseFileInfo: item,
      curCollaboration: null,
      isCollabMode: false,
      onlineMembers: [],
      fileListPopupVisible: false,
    })
  }
  //Open Collaboration
  async openCollabDocument(collaboration: Collaboration) {
    const { curCollaboration, isCollabMode } = this.state;
    if (curCollaboration && isCollabMode) {
      curCollaboration.end()
    }
    //Get whether the collaboration has comment permission
    let permission = await collaboration.getPermission().catch(()=>{
      message.error(this.t("getPermissionError"))
      return;
    })
    let isAllowComment = await permission!.isAllowComment();
    //Construct the address of the collaboration link
    let linkValue = `${window.location.origin + window.location.pathname}?participate=1&collaborationId=${collaboration.id}`;
    //Open collaboration and Subscription notification event
    await this.props.openDocAndGetOnlineUser(collaboration, async (action: string) => {
      let members: any[] = []
      if (!(action === 'delete-share' || action === 'edit-members')) {
        members = await collaboration!.getOnlineMembers();
      }
      this.setState({
        onlineMembers: members!,
        curCollaboration: collaboration!
      })
      this.getDocMembers()
    })
    this.setState({
      isPublic: collaboration.isDocPublic,
      isDocComment: isAllowComment,
      linkUrl: linkValue,
      isSetCollabPopup: true,
    })

  }
  //Get the list of collaborators
  getDocMembers() {
    const { curCollaboration } = this.state;
    if (curCollaboration) {
      curCollaboration?.getMembers().then((collabMembers)=>{
        this.setState({
          collabMembers
        })
      }).catch(()=>{
        message.error(this.t("getMembersError"));
      });
    }
  }

  //Create Collaboration
  async createCollab() {
    this.props.showLoading(true)
    const { chooseFileInfo } = this.state;
    let chooseFileUrl = chooseFileInfo.path;
    if (chooseFileUrl.indexOf('http') === -1) {
      chooseFileUrl = `${serverUrl}${chooseFileUrl}`
    }
    const { collabClient } = this.props;
    let collaboration = await collabClient!.createCollaboration({
      fileUrl: chooseFileUrl,
      isDocPublic: true,
      docName: chooseFileInfo.name
    })
    if (collaboration) {
      this.openCollabDocument(collaboration).then(() => {
        this.setState({
          isCreateCollab: false,
          isCollabMode: true,
          fileListPopupVisible: false
        })
      })
    }
  }
  copyLink() {
    copy(this.state.linkUrl)
    message.info(this.t("copySuccess"));
  }
  hideModal() {
    this.setState({
      isLinkVisible: false,
      isCreateCollab: false,
      isShowStopCollabPopup: false
    })
  }
  async editDocIsPublic(key: string) {
    let isDocPublic = key === 'Anyone'
    const { curCollaboration } = this.state;
    if (curCollaboration) {
      let isUpdatePermissionSuccess=await curCollaboration.updatePermission({ isDocPublic }).catch((result: string) => {
        message.error(this.t("CollabAuthor.permissionSetError"));
      })
      if(isUpdatePermissionSuccess){
        this.setState({
          isPublic: isDocPublic
        })
      }else{
        message.error(this.t("CollabAuthor.permissionSetError"));
      }
    }
  }
  async editAnnotPermissionByDoc(key: string) {
    let isDocComment = key === 'Comment'
    const { curCollaboration } = this.state;
    if (curCollaboration) {
      let isUpdatePermissionSuccess=await curCollaboration.updatePermission({ isAllowComment: isDocComment }).catch((result: string) => {
        message.error(this.t("CollabAuthor.permissionSetError"));
      })
      if(isUpdatePermissionSuccess){
        this.setState({
          isDocComment
        })
      }else{
        message.error(this.t("CollabAuthor.permissionSetError"));
      }
    }
  }
  async editAnnotPermissionByUser(key: string, item: any) {
    const { curCollaboration } = this.state;
    let members = [
      {
        id: item.id,
        isAllowComment: key === 'Comment'
      }

    ]
    if (curCollaboration) {
      let isUpdated=await curCollaboration.updateMemberPermission(members).catch((result: string) => {
        message.error(this.t("CollabAuthor.permissionSetError"));
      })
      if(isUpdated){
        this.getDocMembers()
      }else{
        message.error(this.t("CollabAuthor.permissionSetError"));
      }
    }

  }
  createTempUser() {
    //The creator account is currently randomly generated for login
    let creatorName = randomMockName('Creator')
    if (creatorName) {
      storageSetItem(localStorage, 'creatorName', creatorName);
    } else {
      throw new Error('Login failed')
    }
  }
  async componentDidMount() {
    this.createTempUser()
    let creatorName = storageGetItem(localStorage, 'creatorName')
    if (creatorName) {
      let currentUser = await this.props.loginAnonymously(creatorName)
      const { collabClient } = this.props;
      let collaborations = await collabClient.getCollaborationList();
      this.setState({
        currentUser,
        collabLists: collaborations
      })
    }
  }
  openFileListPopup() {
    this.setState({
      fileListPopupVisible: true
    })
  }
  closePopup() {
    this.setState({
      fileListPopupVisible: false,
      isSetCollabPopup: false,
      isInvitePopup: false,
      isGuideStep: false
    })
  }
  async onTabDocListClick(key: string) {
    const { collabClient } = this.props;
    if (key === 'ShareList') {
      let collaborations = await collabClient!.getCollaborationList();
      this.setState({ collabLists: collaborations });
    }
  }
  createSharePopup() {
    if (this.props && !this.props.isPortfolioDoc) {
      if (this.props && this.props.checkAnnotFormPermission) {
        this.setState({ isCreateCollab: true })
      } else {
        message.error(this.t("CollabAuthor.noCommentPermission"))
      }
    } else {
      message.error(this.t("CollabAuthor.portfolioTip"))
    }

  }
  isInviteMembersPopup(visible: boolean) {
    this.setState({
      isSetCollabPopup: !visible,
      isInvitePopup: visible
    })
  }
  async sendInvite(emails: any[]) {
    const { curCollaboration } = this.state;
    // let emailLists = emails.map((item) => { return item.email })
    if (curCollaboration) {
      let isInvited = await curCollaboration.addMembers(emails).catch((result: any) => {
        if (result.ret === 400) {
          message.error(result.message);
        } else {
          message.error(this.t("CollabAuthor.inviteFailed"));
        }
      })
      if (isInvited) {
        message.info(this.t("CollabAuthor.inviteSuccess"));
        this.closePopup()
        this.getDocMembers()
      }
    }
  }
  stopPopupVisible() {
    this.setState({
      isShowStopCollabPopup: true
    })
  }
  async stopShare() {
    this.setState({
      isSetCollabPopup: false,
      isShowStopCollabPopup: false
    }, () => {
      const stopShareFn = async () => {
        this.props.showLoading(true)
        const { curCollaboration } = this.state;
        let isClose = await curCollaboration?.end();
      }
      stopShareFn().then(() => {
        window.location.search = '?quit=1';
      })
    })
  }
  checkBoxChange(e){
    this.setState({
      isCheckPrivacy:e.target.checked
    })
  }
  render() {
    const {
      chooseFileInfo,
      isCollabMode,
      isPublic,
      currentUser,
      onlineMembers,
      curCollaboration,
      collabMembers,
      isCreateCollab,
      isShowStopCollabPopup,
      fileListPopupVisible,
      collabLists,
      isSetCollabPopup,
      isInvitePopup,
      isDocComment,
      isCheckPrivacy
    } = this.state;
    const t = this.t;
    return (
      <Fragment>
        <div className="initiator-wrap">
          <Row justify="space-between">
            <Col>
              <PopoverTip direction={"right"} content={t("File List")} title={null}>
                <img src={moreIcon} className="more-option" onClick={this.openFileListPopup.bind(this)} />
              </PopoverTip>
            </Col>
            {
              isCollabMode && <Col style={{maxWidth: "50%"}}>
                <div className="fileName">{curCollaboration && curCollaboration.docName}</div>
              </Col>
            }
            <Col>
              <div className="right-wrap">
                {
                  isCollabMode &&
                  <>
                    <OnlineMembers onlineMembers={onlineMembers} user={currentUser} />
                    <div className="create-share-btn" onClick={() => { this.setState({ isSetCollabPopup: true }) }}>
                      <img src={shareMembers} className="create-share" />
                      {t("Share")}
                    </div>
                  </>
                }
                {
                  chooseFileInfo && !isCollabMode ?
                    <PopoverTip direction={"bottom"} content={t("Create Share")} title={null}>
                      <div className="share-btn" onClick={this.createSharePopup.bind(this)}>
                        <img src={createShare} className="create-share" />
                        {t("Share")}
                      </div>
                    </PopoverTip>
                    : null
                }
                {
                  currentUser &&
                  <Tooltip placement="topLeft" title={currentUser.userName}>
                    <div className="user">{currentUser?.userName.charAt(0).toUpperCase()}</div>
                  </Tooltip>
                }
              </div>
            </Col>
          </Row>
        </div>
        <Modal
          title={t("Start Collaboration")}
          visible={isCreateCollab}
          onCancel={this.hideModal.bind(this)}
          footer={null}
          centered>
          <div className="create-collab-wrap">
            <div className="createDes">{t("ModalDes.getSharedLink")}</div>
            <div className="create-footor-wrap">
              <div className="privacy-wrap">
                <Checkbox onChange={this.checkBoxChange.bind(this)}><a href={privacyPolicy} target="_blank">{t("Foxit Privacy Policy")}</a></Checkbox>
              </div>
              <Button type="primary" className="create-collab-btn" key={'create-collab-btn'} disabled={!isCheckPrivacy} onClick={this.createCollab.bind(this)}>{("Create")}</Button>
            </div>

          </div>
        </Modal>
        <Modal
          title={t("dialogTitle")}
          visible={isShowStopCollabPopup}
          onCancel={this.hideModal.bind(this)}
          footer={[
            <Button type="primary" className="stop-collab-continue" onClick={() => this.stopShare()} key={"continue"}>{t("Continue")}</Button>
          ]}
          centered>
          <div className="create-collab-wrap">
            <div className="createDes">{t("ModalDes.endCollabTip")}</div>
          </div>
        </Modal>
        <SharesAndFilesPopup
          visible={fileListPopupVisible}
          currentUser={currentUser}
          collabLists={collabLists}
          openFile={this.openFile.bind(this)}
          openCollabDocument={this.openCollabDocument.bind(this)}
          onTabDocListClick={this.onTabDocListClick.bind(this)}
          closeFilePopup={this.closePopup.bind(this)}
          showLoading={(isShow: boolean) => this.props.showLoading(isShow)}
        />
        <div>
          <UserContext.Provider value={currentUser}>
            <PermissionContext.Provider value={
              {
                isDocComment,
                isPublic,
                editIsPublic: this.editDocIsPublic.bind(this),
                editAnnotPermissionByDoc: this.editAnnotPermissionByDoc.bind(this)
              }
            }>
              <MemberContext.Provider value={collabMembers}>
                <CollabSettingPopup
                  visible={isSetCollabPopup}
                  inviteMemberPopup={this.isInviteMembersPopup.bind(this, true)}
                  editAnnotPermissionByUser={this.editAnnotPermissionByUser.bind(this)}
                  closeCollabSettingPopup={this.closePopup.bind(this)}
                  copyLink={this.copyLink.bind(this)}
                  stopShare={this.stopPopupVisible.bind(this)}
                />
              </MemberContext.Provider>
            </PermissionContext.Provider>
          </UserContext.Provider>
        </div>

        <InvitePopup
          visible={isInvitePopup}
          sendInvite={this.sendInvite.bind(this)}
          closeInviteMembers={this.isInviteMembersPopup.bind(this, false)}
          backCollabSettingPopup={this.isInviteMembersPopup.bind(this, false)}
        />
      </Fragment>
    );
  }
}
export default CollabAuthor;

import React, { Component, Fragment } from 'react';
import './CollabAuthor.css'
import { Modal, Button, message, Col, Row, Tooltip } from 'antd'
import { Collaboration } from '@foxitsoftware/web-collab-client'
import { Member } from "../../types/index";
import copy from 'copy-to-clipboard';
import SharesAndFilesPopup from '../../components/SharesAndFilesPopup/SharesAndFilesPopup';
import { collabAuthorSteps, storageGetItem, storageRemoveItem } from '../../utils';
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

}
class CollabAuthor extends Component<any, IState> {
  state: IState
  constructor(props: any) {
    super(props);
    this.state = {
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
  }
  async openFile(item: any) {
    const { curCollaboration, isCollabMode } = this.state;
    if (curCollaboration && isCollabMode) {
      await curCollaboration.end()
    }
    let fileUrl = item.path;

    this.props.openLocalDoc(fileUrl, item.name).then(() => {
      const driver = this.props.stepDriver
      // Define the steps for introduction
      driver.defineSteps(collabAuthorSteps);
      // Start the introduction
      driver.start();
    })
    //打开文档时候执行，打开协作文档不执行
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
    let permission = await collaboration.getPermission().catch((err)=>{
      console.log(err)
      message.error("getPermission error")
      return;
    })
    let isAllowComment = await permission!.isAllowComment();
    //Construct the address of the collaboration link
    let linkValue = `${window.location.origin}${PUBLIC_PATH}collabParticipant?docId=${collaboration.id}`;
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
      }).catch((err)=>{
        console.log(err)
        message.error('getMembers error');
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
    message.info('copy success!');
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
        console.log('Collaboration edit error' + result);
        message.error('Permission setting error');
      })
      if(isUpdatePermissionSuccess){
        message.info('Permission setting succeeded');
        this.setState({
          isPublic: isDocPublic
        })
      }else{
        message.error('Permission setting error');
      }
    }
  }
  async editAnnotPermissionByDoc(key: string) {
    let isDocComment = key === 'Comment'
    const { curCollaboration } = this.state;
    if (curCollaboration) {
      let isUpdatePermissionSuccess=await curCollaboration.updatePermission({ isAllowComment: isDocComment }).catch((result: string) => {
        console.log('Collaboration edit error' + result);
        message.error('Permission setting error');
      })
      if(isUpdatePermissionSuccess){
        message.info('Permission setting succeeded');
        this.setState({
          isDocComment
        })
      }else{
        message.error('Permission setting error');
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
        console.log('Collaboration edit error' + result);
        message.error('Permission setting error');
      })
      if(isUpdated){
        this.getDocMembers()
        message.info('Permission setting succeeded');
      }else{
        message.error('Permission setting error');
      }
    }

  }
  async componentDidMount() {
    let creatorName = storageGetItem(localStorage, 'creatorName')
    if (creatorName) {
      let currentUser = await this.props.loginAnonymously(creatorName)
      const { collabClient } = this.props;
      let collaborations = await collabClient.getCollaborationList();
      this.setState({
        currentUser,
        collabLists: collaborations
      })
    } else {
      window.location.href = '/';
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
    this.setState({
      isCreateCollab: true
    })
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
          message.error('Invitation failed, please re invite');
        }
      })
      if (isInvited) {
        message.info('Invitation succeeded!');
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
        if (isClose) {
          storageRemoveItem(localStorage, 'creatorName');
        }
      }
      stopShareFn().then(() => {
        window.location.href = '/';
      })
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
      isDocComment
    } = this.state;
    return (
      <Fragment>
        <div className="initiator-wrap">
          <Row justify="space-between">
            <Col>
              <PopoverTip direction={"right"} content={"File List"} title={null}>
                <img src={moreIcon} className="more-option" onClick={this.openFileListPopup.bind(this)} />
              </PopoverTip>
            </Col>
            {
              isCollabMode && <Col>
                <div className="fileName">{curCollaboration && curCollaboration.docName} {isDocComment ? "(can comment)" : "(can view)"}</div>
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
                      Share
                    </div>
                  </>
                }
                {
                  chooseFileInfo && !isCollabMode ?
                    <PopoverTip direction={"bottom"} content={"Create Share"} title={null}>
                      <div className="share-btn" onClick={this.createSharePopup.bind(this)}>
                        <img src={createShare} className="create-share" />
                        Share
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
          title={"Start Collaboration"}
          visible={isCreateCollab}
          onCancel={this.hideModal.bind(this)}
          footer={[
            <Button type="primary" className="create-collab-btn" key={'create-collab-btn'} onClick={this.createCollab.bind(this)}>Create</Button>
          ]}
          centered>
          <div className="create-collab-wrap">
            <div className="createDes">The document needs to upload first!<br />Once uploaded successful, it will automatically switch to collaborative mode.</div>
          </div>
        </Modal>
        <Modal
          title={"Share"}
          visible={isShowStopCollabPopup}
          onCancel={this.hideModal.bind(this)}
          footer={[
            <Button type="primary" className="stop-collab-continue" onClick={() => this.stopShare()} key={"continue"}>Continue</Button>
          ]}
          centered>
          <div className="create-collab-wrap">
            <div className="createDes">You will not be able to access the Collaboration, do you want to stop sharing<br />continue stop?</div>
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

import React, { Component, Fragment } from 'react';
import './CollabParticipant.less'
import { Modal, Input, message, Row, Col, Tooltip, Button } from 'antd';
import { Collaboration } from '@foxitsoftware/web-collab-client'
import { Member } from "../../types/index";
import shareMembers from 'assets/icon/share-members.svg';
import lockPermission from 'assets/icon/lock-permission-icon.svg';
import { collabParticipantSteps, getQueryVariable, randomMockName, storageGetItem, storageRemoveItem, storageSetItem } from '../../utils';
import copy from 'copy-to-clipboard';
import { PUBLIC_PATH } from "../../config";
import OnlineMembers from '../../components/OnlineMembers/OnlineMembers';
import ParticipantSettingPopover from '../../components/ParticipantSettingPopover/ParticipantSettingPopover';
import { MemberContext, UserContext } from '../../context';
import {lang} from '../../locales';
interface IState {
  onlineMembers: any[];
  collabMembers: any[] | undefined
  curCollaboration: Collaboration | null;
  currentUser: Member | null
  isShowLogin: boolean
  loginPopupVisible: boolean
  emailValue: string
  isShowNoPermissionPopup: boolean
  stopShareTipPopup: boolean
  isGuideStep: boolean
  isAllowComment: boolean
  reEnterSharePopup: boolean
  collabStopTipPopup: boolean
}
class CollabParticipant extends Component<any, IState> {
  state: IState
  constructor(props: any) {
    super(props);
    this.state = {
      collabStopTipPopup: false,
      reEnterSharePopup: false,
      isAllowComment: true,
      stopShareTipPopup: false,
      isGuideStep: true,
      collabMembers: [],
      isShowNoPermissionPopup: false,
      emailValue: "",
      loginPopupVisible: false,
      isShowLogin: false,
      onlineMembers: [],
      curCollaboration: null,
      currentUser: null
    };
  }
  //Open Collaboration
  async openCollabDocument(collaboration: Collaboration) {
    //打开文档以及监听socket事件
    this.props.openDocAndGetOnlineUser(collaboration, async (action: string) => {
      let members: any[] = [];
      if (!(action === 'delete-share' || action === 'edit-members')) {
        members = await collaboration!.getOnlineMembers();
      }
      if (action === 'delete-share') {
        this.setState({
          stopShareTipPopup: true
        })
      } else if (action === 'edit-members') {
        this.setState({
          reEnterSharePopup: true
        })
      }
      this.setState({
        onlineMembers: members!
      })
      this.getDocMembers()
    })
  }
  //Get the list of collaborators
  getDocMembers() {
    const { curCollaboration } = this.state;
    curCollaboration?.getMembers().then((collabMembers)=>{
      this.setState({
        collabMembers
      })
    }).catch(()=>{
      message.error(lang.getMembersError);
    });
  }

  copyLink() {
    const { id: docId } = this.state.curCollaboration!;
    if (docId) {
      let linkValue = `${window.location.origin}${PUBLIC_PATH}collabParticipant?docId=${docId}`
      copy(linkValue)
      message.info(lang.copySuccess);
    } else {
      message.error(lang.CollabParticipant.noExistCollabId);
    }

  }
  async leaveShare() {
    this.props.showLoading(true)
    const { curCollaboration } = this.state;
    //Remove the current user from the collaboration
    if (curCollaboration) {
      let result = await curCollaboration.quit();
      if (result === true) {
        //Close Collaboration
        this.signOutShare()
      } else {
        message.error(lang.CollabParticipant.removeError);
      }
    }
  }
  signOutShare() {
    storageRemoveItem(localStorage, 'participantName')
    storageRemoveItem(localStorage, 'touristName')
    window.location.search = '?quit=1';
  }
  //Participant Email Login
  async loginSubmit() {
    const { emailValue } = this.state;
    if (emailValue === '') {
      message.error(lang.submitEmailTip);
      return;
    }
    if (emailValue.match(/^\w+@\w+\.\w+$/i)) {
      storageSetItem(localStorage, 'participantName', emailValue);
      let result=await this.participantLogin(emailValue);
      if(result){
        window.location.reload();
      }else{
        message.error(lang.CollabParticipant.noPermissionAccess)
      }
    } else {
      message.error(lang.emailFormatError);
    }
  }
  //Enable the boot function
  openDriver() {
    // const driver = this.props.stepDriver;
    // Define the steps for introduction
    // driver.defineSteps(collabParticipantSteps);
    // Start the introduction
    // driver.start()
  }
  async componentDidMount() {
    //Judge whether any participant has logged in, if any, continue to log in as the current user, if not, log in with tourist information, and display the "Go to Login" button
    let participantName = storageGetItem(localStorage, 'participantName');
    let touristName = storageGetItem(localStorage, 'touristName');
    let randowName = randomMockName('tourist');
    let nickName = participantName ? participantName : touristName ? touristName : randowName;
    await this.participantLogin(nickName)
    if (!participantName) {
      this.setState({
        isShowLogin: true
      })
      if (!touristName) {
        storageSetItem(localStorage, 'touristName', randowName)
      }
    }
    if(this.state.currentUser){
      this.openDriver()
    }

  }

  //Participant Login
  async participantLogin(userName: string): Promise<any>{
    const { curCollaboration } = this.state;
    if (curCollaboration) {
      curCollaboration.end()
    }
    let currentUser: Member = await this.props.loginAnonymously(userName);
    const collabClient = this.props.collabClient;
    if (currentUser) {
      let docId: string | null = getQueryVariable('collaborationId')
      if (docId) {
        let collaboration: Collaboration | void = await collabClient.getCollaboration(docId).catch((result: any) => {
          this.props.showLoading(false)
          storageRemoveItem(localStorage, 'participantName')
          storageRemoveItem(localStorage, 'touristName')
          //Whether the collaboration cannot be found
          if (result.ret === 404) {
            this.setState({
              stopShareTipPopup: true
            })
            return;
          }
          //If access is not available, show the login interface
          if (result.ret === 403) {
            this.setState({
              isShowNoPermissionPopup: true,
              emailValue:""
            })
            return
          }
        })
        if(this.state.emailValue){
          return Promise.resolve(true)
        }
        if (collaboration) {
          //Get whether the document has the argument permission
          let permissionApi = await collaboration.getPermission().catch(()=>{
            message.error(lang.getPermissionError)
            return;
          })
          let isAllowComment = await permissionApi!.isAllowComment();
          // Join Collaboration
          await this.openCollabDocument(collaboration)
          this.setState({
            curCollaboration: collaboration,
            isAllowComment,
            currentUser
          })
          this.props.isHideRightSelectText(isAllowComment)
          return Promise.resolve(true)
        }
      } else {
        message.error(lang.CollabParticipant.noExistCollabId);
      }
    }
  }
  //Display login pop-up window
  toLogin() {
    this.setState({
      loginPopupVisible: true,
    })
  }
  //Close the pop-up window
  hideModal() {
    this.setState({
      loginPopupVisible: false,
      emailValue: "",
      isGuideStep: false
    })
  }
  //Get the input mailbox value
  handleChange(e: any) {
    this.setState({
      emailValue: e.target.value
    })
  }
  //When the permission is changed, click to re-enter the collaboration interface
  reEnterShare() {
    window.location.reload();
  }
  render() {
    const {
      curCollaboration,
      currentUser,
      onlineMembers,
      isShowLogin,
      isShowNoPermissionPopup,
      collabMembers,
      emailValue,
      isAllowComment,
      reEnterSharePopup,
      stopShareTipPopup
    } = this.state;
    return (
      <Fragment>
        <div className='participant-wrap'>
          <Row justify="space-between">
            <Col></Col>
            {
              curCollaboration && <Col>
                <div className="fileName">{curCollaboration.docName} {isAllowComment ? "(Can Comment)" : "(Can View)"}</div>
              </Col>
            }
            <Col>
              <div className="right-wrap">
                {
                  currentUser ?
                    <>
                      <OnlineMembers onlineMembers={onlineMembers} user={currentUser} />
                      <UserContext.Provider value={currentUser}>
                        <MemberContext.Provider value={collabMembers}>
                          <ParticipantSettingPopover
                            copyLink={this.copyLink.bind(this)}
                            removeMe={this.leaveShare.bind(this)}
                          >
                            <div className="share-popover">
                              <img src={shareMembers} className="create-share" />
                              Share
                            </div>
                          </ParticipantSettingPopover>
                        </MemberContext.Provider>
                      </UserContext.Provider>
                    </> : null
                }
                {
                  isShowLogin ? <div className="login-btn" onClick={this.toLogin.bind(this)}>Login</div> :
                    currentUser && <Tooltip placement="topLeft" title={currentUser.userName}>
                      <div className="user">{currentUser?.userName.charAt(0).toUpperCase()}</div>
                    </Tooltip>
                }
              </div>
            </Col>
          </Row>
        </div>
        <Modal
          width={400}
          title={lang.dialogTitle}
          visible={stopShareTipPopup}
          closable={false}
          footer={[
            <Button type="primary" className="create-collab-btn" key={'signOutShare'} onClick={() => this.signOutShare()}>Sure</Button>
          ]}
          centered>
          <div className="create-collab-wrap">
            <div className="createDes">{lang.ModalDes.collabHasEndedTip}</div>
          </div>
        </Modal>
        <Modal
          width={400}
          title={lang.dialogTitle}
          visible={reEnterSharePopup}
          closable={false}
          footer={[
            <Button type="primary" className="create-collab-btn" key={'Sure'} onClick={() => this.reEnterShare()}>Sure</Button>
          ]}
          centered>
          <div className="create-collab-wrap">
            <div className="createDes">{lang.ModalDes.permissionChangeTip}</div>
          </div>
        </Modal>
        <Modal
          zIndex={10000}
          title={"Login"}
          visible={this.state.loginPopupVisible}
          onCancel={this.hideModal.bind(this)}
          footer={null}
          width={458}
          centered>
          <div className="login-modal-wrap">
            <div className="label">Email</div>
            <Input
              placeholder="Enter your email address"
              className='email-login-input'
              key={emailValue}
              defaultValue={emailValue}
              onBlur={this.handleChange.bind(this)}
            />
            <div className="to-login" onClick={this.loginSubmit.bind(this)}>Login</div>
          </div>
        </Modal>
        {
          isShowLogin &&
          <>
            <div className='login-tip'>Welcome to Foxit PDF Web Collaboration! <span onClick={this.toLogin.bind(this)}>Log in</span> to collaborate on this file.</div>
          </>
        }

        {
          !isAllowComment &&
          <>
            <div className="disabledComment"></div>
          </>
        }
        {
          isShowNoPermissionPopup &&
          <div className="no-permission-wrap">
            <img src={lockPermission} className="lockPermission-img" />
            <div className="lock-des">Permission is required to view this file,<br />
              Please log in to verify your permissions</div>
            <div className="lock-login-btn" onClick={this.toLogin.bind(this)}>Login</div>
          </div>
        }

      </Fragment>
    );
  }
}
export default CollabParticipant;

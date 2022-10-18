import React, { Component } from 'react'
import './App.less';
import CollabAuthor from './pages/CollabAuthor/CollabAuthor';
import CollabParticipant from './pages/CollabParticipant/CollabParticipant';
import { serverUrl, PUBLIC_PATH } from './config';
import { WebCollabClient, Collaboration } from '@foxitsoftware/web-collab-client';
import PDFViewer from './components/PDFViewer/PDFViewer';
import { message, Spin } from 'antd';
import Driver from 'driver.js';
import { getQueryVariable, stepOption } from './utils';
import { lang } from './locales';
import { getUser, loginAnonymously } from "./service/api";
import PasswordPopup from './components/PasswordPopup/PasswordPopup';
function createDeferred() {
  const deferred: any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

let passwordDefered = createDeferred();

enum DocEvent {
  onlineStatusChanged = 'onlineStatusChanged'
}

interface IState {
  webCollabClient: null | WebCollabClient;
  pdfViewer: any;
  pdfui:any;
  isCollabMode: boolean;
  isLoading: boolean;
  stepDriver: any;
  pwdVisible: boolean
  isSdkOpenDoc: boolean
  openFailedDoc: any;
  checkAnnotFormPermission:boolean
  isPortfolioDoc:boolean
  docPassword:string
}
export default class App extends Component<any, IState> {

  constructor(props: any) {
    super(props)
    this.state = {
      pdfViewer: undefined,
      pdfui:undefined,
      webCollabClient: null,
      checkAnnotFormPermission:true,
      isPortfolioDoc:false,
      isCollabMode: false,
      isLoading: false,
      pwdVisible: false,
      docPassword:"",
      isSdkOpenDoc: false,
      openFailedDoc: null,
      stepDriver: new Driver(stepOption)
    }

    this.openDocAndGetOnlineUser = this.openDocAndGetOnlineUser.bind(this);
    this.subscribeMemberChange = this.subscribeMemberChange.bind(this);
    this.onFinishInitPDFUI = this.onFinishInitPDFUI.bind(this);
    this.openFileSuccess = this.openFileSuccess.bind(this);
    this.showLoading = this.showLoading.bind(this)
    this.onRequestAnnotPermissions = this.onRequestAnnotPermissions.bind(this)
    this.openLocalDoc = this.openLocalDoc.bind(this)
    this.loginAnonymously = this.loginAnonymously.bind(this)
    this.isHideRightSelectText=this.isHideRightSelectText.bind(this)
  }
  showLoading(isLoading: boolean) {
    this.setState({
      isLoading
    })
  }
  //Open collaboration and Subscription notification event
  async openDocAndGetOnlineUser(doc: Collaboration, callback: any) {
    this.state.pdfViewer.close()
    let isViewSuccess;
    if(this.state.docPassword){
      isViewSuccess =await doc.begin({password:this.state.docPassword}).catch(async (e)=>{
        message.error(lang.passwordError)
        await this.exceptionHandle(e,doc,callback)
      })
    }else{
      isViewSuccess = await doc.begin().catch(async (e)=>{
        await this.exceptionHandle(e,doc,callback)
      });
    }

    if (isViewSuccess) {
      this.openCollabDocSuccess(doc,callback)
    }
  }
  openCollabDocSuccess(doc,callback){
    passwordDefered = createDeferred();
    this.setState({
      pwdVisible: false,
      isCollabMode: true,
      isSdkOpenDoc: false,
      openFailedDoc: null,
      docPassword:""
    })
    callback && callback();
    this.subscribeMemberChange(doc, callback)
    return true
  }
  async exceptionHandle(e,doc,callback){
    passwordDefered = createDeferred();
    if (e.error === 3) {
      this.setState({
        pwdVisible: true,
        openFailedDoc: e.pdfDoc,
        isSdkOpenDoc: true
      })
      let passwordValue=await passwordDefered.promise
      if(passwordValue){
          let isViewSuccess =await doc.begin({password:passwordValue}).catch(async (e)=>{
            message.error(lang.passwordError)
            await this.exceptionHandle(e,doc,callback)
          })
          if(isViewSuccess){
            this.openCollabDocSuccess(doc,callback)
          }
      }
    } else {
      message.error(lang.collabOpenFailed)
      passwordDefered.resolve(false)
    }
  }
  //Subscription notification event
  async subscribeMemberChange(collaboration: Collaboration, callback: any) {
    await collaboration.on(DocEvent.onlineStatusChanged, async (user, action) => {
      callback && callback(action)
    })
  }

  isParticipate = () => {
    const searchParams = new URLSearchParams(window.location.search)
    if(searchParams.get("collaborationId")){
      return true
    }else{
      return false
    }
  }

  async loginAnonymously(userName: string) {
    let currentToken = await loginAnonymously(userName);
    let userInfo = await getUser().catch(() => {
      Promise.reject()
    });
    let webCollabClient = new WebCollabClient({
      pdfViewer: this.state.pdfViewer,
      baseURL: serverUrl,
      userProvider: () => {
        return {
          id: userInfo!.id,
          username: userInfo!.userName,
          token: currentToken
        }
      },
    });
    this.setState({
      webCollabClient
    })
    return userInfo
  }
  async onFinishInitPDFUI(pdfui: any) {
    let pdfViewer = await pdfui.getPDFViewer();
    this.setState({
      pdfViewer,
      pdfui
    })
  }
  async checkAllowComment(){
    const docRender = this.state.pdfViewer.getPDFDocRender();
    const doc = await this.state.pdfViewer.getCurrentPDFDoc()
    const isPortfolio = doc.isPortfolio()
    const hasAnnotFormPermission = docRender.getUserPermission().checkAnnotForm();
    return {isPortfolio,hasAnnotFormPermission}
  }
  async openFileSuccess() {
    const { isPortfolio, hasAnnotFormPermission } = await this.checkAllowComment();
    this.setState({
      checkAnnotFormPermission: Boolean(hasAnnotFormPermission),
      isPortfolioDoc:isPortfolio
    })
    this.showLoading(false)
  }
  onRequestAnnotPermissions(annot: any): Promise<any> {
    let docId: string | null = getQueryVariable('collaborationId')
    if (!this.state.isCollabMode || !this.state.webCollabClient) {
      if(!docId){
        return Promise.resolve()
      }
    }
    return this.state.webCollabClient!.getAnnotPermissions(annot);
  }
  async openLocalDoc(fileUrl: string, fileName: string) {
    this.showLoading(true)
    let filePath = fileUrl;
    if (!this.state.pdfViewer) {
      throw new Error('init fail')
    }
    if(!filePath.startsWith("http")) {
      filePath = `${serverUrl}${filePath}`
    }
    this.state.pdfViewer.openPDFByHttpRangeRequest({
      range: {
        url: filePath
      }
    }, { fileName: fileName }).then(() => {
      this.setState({
        isCollabMode: false,
        isSdkOpenDoc: false
      })
      Promise.resolve()
    }).catch((e: any) => {
      this.showLoading(false)
      if (e.error === 3) {
        this.setState({
          pwdVisible: true,
          openFailedDoc: e.pdfDoc
        })
        return
      }else{
        message.error(lang.openFailed)
      }
    })

  }
  //Confirmation of pop-up window when encrypting document
  async onSubmit(value: string) {
    if (this.state.isSdkOpenDoc){
      passwordDefered.resolve(value)
      return
    }
    await this.state.pdfViewer.reopenPDFDoc(this.state.openFailedDoc, {
      password: value,
    }).then(() => {
      this.setState({
        pwdVisible: false,
        isSdkOpenDoc: false,
        openFailedDoc: null,
        docPassword:value
      })
    }).catch(() => {
      message.error(lang.passwordError)
    });

  }
  closePswPupup() {
    this.setState({
      pwdVisible: false,
      openFailedDoc: null,
      isSdkOpenDoc: false
    });
    passwordDefered = createDeferred();
    this.showLoading(false)
  }
  async isHideRightSelectText(isAllowComment){
    if(!isAllowComment){
      let selectText=await this.state.pdfui.getComponentByName('fv--contextmenu-item-select-text-image')
      selectText.hide()

      let keyboard = await this.state.pdfui.getKeyboard()
      keyboard.interceptor((e, next) => {
        if(e.command === (window as any).UIExtension.PDFViewCtrl.keyboard.BuiltinCommand.COPY_ACTIVATE_ELEMENT) {
            return;
        } else {
            next(e);
        }
      })
    }
  }
  render() {
    const { webCollabClient, isLoading, stepDriver, pdfViewer, pwdVisible,checkAnnotFormPermission,isPortfolioDoc } = this.state;
    return (<>
        <Spin tip="Loading..." spinning={isLoading} size={"large"}>
          {
            pdfViewer && <>
                { !this.isParticipate() ?
                  <CollabAuthor
                    collabClient={webCollabClient}
                    openLocalDoc={this.openLocalDoc}
                    checkAnnotFormPermission={checkAnnotFormPermission}
                    isPortfolioDoc={isPortfolioDoc}
                    openDocAndGetOnlineUser={this.openDocAndGetOnlineUser}
                    loginAnonymously={this.loginAnonymously}
                    showLoading={this.showLoading}
                    stepDriver={stepDriver}
                  /> : <CollabParticipant
                  collabClient={webCollabClient}
                  openDocAndGetOnlineUser={this.openDocAndGetOnlineUser}
                  loginAnonymously={this.loginAnonymously}
                  showLoading={this.showLoading}
                  isHideRightSelectText={this.isHideRightSelectText}
                  stepDriver={stepDriver}
                  />
                }
              </>
          }
            <PDFViewer
              showLoading={this.showLoading}
              onFinishInitPDFUI={this.onFinishInitPDFUI}
              openFileSuccess={this.openFileSuccess}
              onRequestAnnotPermissions={this.onRequestAnnotPermissions}
            />;
        </Spin>
      <PasswordPopup visible={pwdVisible} closePopup={this.closePswPupup.bind(this)} onSubmit={this.onSubmit.bind(this)} />
    </>
    );
  }
}

import React, { Component } from 'react'
import './App.less';
import { BrowserRouter, Route } from 'react-router-dom';
import CollabAuthor from './pages/CollabAuthor/CollabAuthor';
import CollabParticipant from './pages/CollabParticipant/CollabParticipant';
import { serverUrl, PUBLIC_PATH } from './config';
import { WebCollabClient, Collaboration } from '@foxitsoftware/web-collab-client';
import PDFViewer from './components/PDFViewer/PDFViewer';
import Login from './pages/Login/Login';
import { message, Spin } from 'antd';
import Driver from 'driver.js';
import { stepOption } from './utils';
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
  isCollabMode: boolean;
  isLoading: boolean;
  stepDriver: any;
  pwdVisible: boolean
  isSdkOpenDoc: boolean
  openFailedDoc: any;
}
export default class App extends Component<any, IState> {

  constructor(props: any) {
    super(props)
    this.state = {
      pdfViewer: undefined,
      webCollabClient: null,
      isCollabMode: false,
      isLoading: false,
      pwdVisible: false,
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
  }
  showLoading(isLoading: boolean) {
    this.setState({
      isLoading
    })
  }
  //Open collaboration and Subscription notification event
  async openDocAndGetOnlineUser(doc: Collaboration, callback: any) {
    this.state.pdfViewer.close()
    let isViewSuccess = await doc.begin().catch(async (e)=>{
      await this.exceptionHandle(e,doc,callback)
    });
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
      openFailedDoc: null
    })
    message.info('Now,you are in collabrative mode')
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
            message.error("Password error")
            await this.exceptionHandle(e,doc,callback)
          })
          if(isViewSuccess){
            this.openCollabDocSuccess(doc,callback)
          }
      }
    } else {
      console.log(e)
      message.error('collabration open error')
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
      pdfViewer
    })
  }
  openFileSuccess() {
    this.showLoading(false)
  }
  onRequestAnnotPermissions(annot: any): Promise<string[]> {
    const fully = (window as any).UIExtension.PDFViewCtrl.constants.ANNOTATION_PERMISSION.fully
    if (!this.state.isCollabMode || !this.state.webCollabClient) {
      return Promise.resolve([fully])
    }
    return this.state.webCollabClient.getAnnotPermissions(annot);
  }
  async openLocalDoc(fileUrl: string, fileName: string) {
    this.showLoading(true)
    let filePath = fileUrl;
    if (!this.state.pdfViewer) {
      throw new Error('init fail')
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
      }
      console.log("[log][debug] ~ App ~ openLocalDoc ~ error", e)
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
        openFailedDoc: null
      })
    }).catch((e: any) => {
      console.log(e)
      message.error("Password error")
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
  render() {
    const { webCollabClient, isLoading, stepDriver, pdfViewer, pwdVisible } = this.state;
    return (<>
        <Spin tip="Loading..." spinning={isLoading} size={"large"}>
          {
            pdfViewer && <>
                { !this.isParticipate() ?
                  <CollabAuthor
                      collabClient={webCollabClient}
                      openLocalDoc={this.openLocalDoc}
                      openDocAndGetOnlineUser={this.openDocAndGetOnlineUser}
                      loginAnonymously={this.loginAnonymously}
                      showLoading={this.showLoading}
                      stepDriver={stepDriver}
                  /> : <CollabParticipant
                  collabClient={webCollabClient}
                  openDocAndGetOnlineUser={this.openDocAndGetOnlineUser}
                  loginAnonymously={this.loginAnonymously}
                  showLoading={this.showLoading}
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
import React, { PureComponent } from 'react';
import './SharesAndFilesPopup.less'
import { Modal, Tabs, List, Upload, message } from 'antd';
import { localDocList } from '../../utils';
import { serverUrl} from '../../config';
import {getLocalDocList} from "../../service/api";
import {lang} from '../../locales';
const { TabPane } = Tabs;
function createDeferred() {
  const deferred: any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

let passwordDefered = createDeferred();
interface IProps {
  visible: boolean
  openFile: Function
  currentUser: any
  openCollabDocument: Function
  onTabDocListClick: Function
  closeFilePopup: Function
  collabLists: any
  showLoading:Function
}
class SharesAndFilesPopup extends PureComponent<IProps, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      rowClickItemName: '',
      fileList:[],
      isSameFileTip:false
    }
  }
  openCollabDocument(item: any) {
    this.props.openCollabDocument(item);
    this.setState({
      rowClickItemName: item.name
    })
  }
  openLocalFile(item: any,index:number) {
    this.props.openFile(item)
    this.setState({
      rowClickItemName: item.name
    })
  }
  async componentDidMount() {
    let files=await this.getList();
    //Open the doc by default and record the selected doc
    let defauleDoc = files[0]
    this.props.openFile(defauleDoc)
    this.setState({
      rowClickItemName: defauleDoc.name
    })
  }

  async componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<any>, snapshot?: any) {
    if(prevProps.currentUser !== this.props.currentUser){
      await this.getList();
    }
  }

  async getList(){
    let files=[...localDocList];
    let result=await getLocalDocList(this.props.currentUser?.userName || 'anon_user').catch(()=>{
      message.error(lang.Component.getFileFailed);
    })
    if(result){
      files=[...localDocList,...result]
    }
    this.setState({
      fileList:files
    })
    return files;
  }
  handleChange = (info: any) => {
    if (info.file.status && info.file.status === 'uploading') {
      this.props.showLoading(true)
    }
    if (info.file.status && info.file.status === 'done') {
      this.props.showLoading(false)
      this.getList();
      message.success(lang.Component.uploadedSuccess);
    } else if (info.file.status && info.file.status === 'error') {
      this.props.showLoading(false);
      message.error(lang.Component.fileuploadFailed);
    }
  }
 beforeUploadFile=async (file: any)=> {
    passwordDefered = createDeferred();
    const uploadedfiles=this.state.fileList.map((item)=>{
      return item.name
    })
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      message.error(lang.Component.fileMoreThen50M);
      return false
    } else {
      if(uploadedfiles.indexOf(file.name)!==-1){
        this.setState({
          isSameFileTip:true
        })
        let result=await passwordDefered.promise
        if(!result){
          return false
        }
      }else{
        return true
      }
    }
  }
  cancelTipPopup(){
    passwordDefered.resolve(false)
    this.setState({
      isSameFileTip:false
    })
  }
  sureBtn(){
    passwordDefered.resolve(true)
    this.setState({
      isSameFileTip:false
    })
  }
  render() {
    const { visible,collabLists, currentUser } = this.props;
    const {isSameFileTip}=this.state;
    const uploadProps = {
      name: 'file',
      action: `${serverUrl}/api/files/upload?username=${currentUser?.userName || 'anon_user'}`,
      showUploadList:false,
      accept:".pdf",
      beforeUpload:this.beforeUploadFile.bind(this)
    };
    return (
      <>
      <Modal title={"File list"} visible={visible} footer={null} closable={true} width={840} centered onCancel={() => this.props.closeFilePopup()}>
        <div className="files-wrap">
          <Tabs tabPosition={'left'} onTabClick={(key) => this.props.onTabDocListClick(key)}>
            {/* <TabPane tab={<div className="shareList-tab">Share list</div>} key="ShareList">
              <div className="shareList">
                <List
                  size="small"
                  dataSource={collabLists}
                  renderItem={(item: any) => <List.Item onClick={() => this.openCollabDocument(item)}><div className={this.state.rowClickItemId !== item.id ? 'list-des' : 'list-des-active'}>{item.name}</div></List.Item>}
                />
              </div>
            </TabPane> */}
            <TabPane tab={<div className="shareList-tab"></div>} key="fileList">
              <div className="shareList">
                <List
                  size="small"
                  dataSource={this.state.fileList}
                  renderItem={(item: any,index:number) => <List.Item onClick={() => this.openLocalFile(item,index)}><div className={this.state.rowClickItemName !== item.name ? 'list-des' : 'list-des-active'}>{item.name}</div></List.Item>}
                />
              </div>
            </TabPane>
          </Tabs>
          <div className="upload-wrap">
            <Upload {...uploadProps} onChange={(info:any)=>this.handleChange(info)}>
              <div className="upload-btn">Upload file</div>
            </Upload>
          </div>
        </div>
      </Modal>
       <Modal
        zIndex={10000}
        title={lang.dialogTitle}
        visible={isSameFileTip}
        footer={null}
        closable={false}
        className={"passwordPopup"}
        width={360}
        centered>
        <div className="login-password-wrap">
          <div>{lang.Component.fileExistTip}</div>
          <div className='bottom-btn'>
            <div className="to-login" onClick={this.sureBtn.bind(this)}>OK</div>
            <div className="cancel-btn" onClick={this.cancelTipPopup.bind(this)}>Cancel</div>
          </div>
        </div>
     </Modal>
     </>
    );
  }
}
export default SharesAndFilesPopup;

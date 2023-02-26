import { Button, List, message, Modal,Tabs, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import {lang} from '../../locales';
import { useIsLoading } from '../../context/isLoading';
import { serverUrl } from '../../config';
import { createDeferred, formatTime, getQueryVariable, storageGetItem, storageRemoveItem, storageSetItem } from '../../utils/utils';
import {
  localDocList, toCreatorCollaboration, toCreatorPage,
} from '../../utils/collab-utils';
import { useCurrentUser } from '../../context/user';
import './FileList.less';
import PopoverTip from '../PopoverTip/PopoverTip';
import moreIcon from 'assets/icon/more-icon.svg';
import { useCurrentCollabClient } from '../../context/WebCollabClient';
import {getLocalDocList} from "../../service/api";
const { TabPane } = Tabs;

let passwordDefered = createDeferred();

interface IProps {
  openFile:Function
  openCollaboration:Function
}


export default (props: IProps) => {

  const {setIsLoading}=useIsLoading()
  const [collaborationId,setCollaborationId]=useState<string>('')
  const {currentUser}=useCurrentUser()
  const [visible, setVisible] = useState(false)
  const [tabKey,setTabKey]=useState<string>('fileList')
  const [fileList, setFileList] = useState<any>([])
  const [collabList,setCollabList]=useState<any>([])
  const [activeFile,setActiveFile]=useState('')
  const [sameFileVisible,setUploadSameFile]=useState(false)
  const {collabClient}=useCurrentCollabClient()
  useEffect(()=>{
    (async () => {
      let files=await getList();
      const searchParams = new URLSearchParams(window.location.search);
      let collabId = searchParams.get('collaborationId');
      if (collabId) {
        setCollaborationId(collabId)
        return;
      }
      //Open the doc by default and record the selected doc
      let localFile = JSON.parse(storageGetItem(localStorage, 'localFile'));
      let file=localFile?localFile:files[0]
      props.openFile(file)
      setActiveFile(file.name)
    })();
  }, [])

  useEffect(()=>{
    (async () => {
      if (visible) {
        if (tabKey !== 'fileList') {
          getCollaborationList()
        }
        const searchParams = new URLSearchParams(window.location.search);
        let collabId = searchParams.get('collaborationId');
        if (collabId) {
          setCollaborationId(collabId)
        } else {
          setCollaborationId('')
        }
      }
    })();
  }, [visible])

  const openLocalFile = (fileInfo) => {
    if( storageGetItem(localStorage,'collaborationId')){
      storageRemoveItem(localStorage, 'collaborationId');
    }
    storageSetItem(localStorage, 'localFile', JSON.stringify(fileInfo));
    if (getQueryVariable('collaborationId')) {
      toCreatorPage()
    } else {
      props.openFile(fileInfo)
      setActiveFile(fileInfo.name)
      setVisible(false)
    }
  }

  const getList = async () => {
    let files=[...localDocList];
    let result=await getLocalDocList(currentUser?.userName || 'anon_user').catch(()=>{
      message.error(lang.Component.getFileFailed);
    })
    if(result){
      files=[...localDocList,...result]
    }
    setFileList(files)
    return files;
  }
  const beforeUploadFile=async (file: any)=> {
    passwordDefered = createDeferred();
    const uploadedfiles=fileList.map((item:any)=>{
      return item.name
    })
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      message.error(lang.Component.fileMoreThen50M);
      return false
    } else {
      if(uploadedfiles.indexOf(file.name)!==-1){
        setUploadSameFile(true)
        let result=await passwordDefered.promise
        if(!result){
          return false
        }
      }else{
        return true
      }
    }
  }
  const uploadProps = {
    name: 'file',
    action: `${serverUrl}/api/files/upload?username=${currentUser?.userName || 'anon_user'}`,
    showUploadList:false,
    accept:".pdf",
    beforeUpload:beforeUploadFile
  };
  const handleChange = (info: any) => {
    if (info.file.status && info.file.status === 'uploading') {
      setIsLoading(true)
    }
    if (info.file.status && info.file.status === 'done') {
      setIsLoading(false)
      getList();
      message.success(lang.Component.uploadedSuccess);
    } else if (info.file.status && info.file.status === 'error') {
      setIsLoading(false);
      message.error(lang.Component.fileuploadFailed);
    }
  }
  const cancelTipPopup=()=>{
    passwordDefered.resolve(false)
    setUploadSameFile(false)
  }
  const sureBtn=()=>{
    passwordDefered.resolve(true)
    setUploadSameFile(false)
  }
  const onTabClickChange=async (key)=> {
    if (key === 'ShareList') {
      getCollaborationList()
    }
    setTabKey(key)
  }
  const getCollaborationList=async ()=> {
    let collaborations = await collabClient!.getCollaborationList();
    setCollabList(collaborations)
  }
  return (
    <>
    <PopoverTip direction={"right"} content={"File List"} title={null}>
      <img src={moreIcon} className="more-option" onClick={()=>setVisible(true)} />
    </PopoverTip>
    <Modal
      title={lang.dialogTitle}
      visible={visible}
      footer={null}
      closable={true}
      width={840}
      zIndex={1510}
      centered
      onCancel={() => setVisible(false)}
    >
      <div className="files-wrap">
        <Tabs
          tabPosition={'left'}
          onTabClick={(key) => onTabClickChange(key)}
          defaultActiveKey={tabKey}
        >
          <TabPane
            tab={<div className="shareList-tab">Share list</div>}
            key="ShareList"
          >
            <div className="share-list-wrap">
              <List
                className='share-list'
                size="small"
                header={
                  <div className='share-header'>
                    <div className='share-header-name'>Name</div>
                    <div>Create time</div>
                  </div>
                }
                dataSource={collabList}
                renderItem={(item: any) => (
                  <List.Item>
                    <div className="tab-list">
                      <div
                        title={item.docName}
                        className={
                          collaborationId !== item.id
                            ? 'tab-list-des'
                            : 'tab-list-des tab-item-active'
                        }
                      >
                        {item.docName}
                      </div>
                      <div
                        title={formatTime(item.createdAt)}
                        className={
                          collaborationId !== item.id
                            ? 'tab-list-time'
                            : 'tab-list-time tab-item-active'
                        }
                      >
                        {formatTime(item.createdAt)}
                      </div>
                      {(collaborationId !== item.id) ? (
                        <Button
                          onClick={() => {
                            toCreatorCollaboration(item.id)
                          }}
                        >
                          Start collaboration
                        </Button>
                      ) : (
                        <div className="tab-item-active">
                          Current Collaboration
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </TabPane>
          <TabPane
            tab={<div className="shareList-tab">File list</div>}
            key="fileList"
          >
            <div className="share-list-wrap">
              <List
                size="small"
                className='share-list'
                dataSource={fileList}
                renderItem={(item: any, index: number) => (
                  <List.Item>
                    <div className="tab-list">
                      <div
                        title={ item.name }
                        className={
                          activeFile !== item.name
                            ? 'tab-list-des'
                            : 'tab-list-des tab-item-active'
                        }
                      >
                        {item.name}
                      </div>
                      <Button
                        onClick={() =>openLocalFile(item)}
                      >
                        Open
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </TabPane>
        </Tabs>
        <div className="upload-wrap">
          {tabKey === 'fileList' && (
            <Upload
              {...uploadProps}
              onChange={(info: any) =>handleChange(info)}
            >
              <div className="upload-btn">Upload file</div>
            </Upload>
          )}
        </div>
      </div>
    </Modal>
    <Modal
      zIndex={10000}
      title={lang.dialogTitle}
      visible={sameFileVisible}
      footer={null}
      closable={false}
      className={'passwordPopup'}
      width={360}
      centered
    >
      <div className="login-password-wrap">
        <div>{lang.Component.fileExistTip}</div>
        <div className="bottom-btn password-footor">
          <div className="to-login" onClick={sureBtn}>
            OK
          </div>
          <div
            className="cancel-btn"
            onClick={cancelTipPopup}
          >
            Cancel
          </div>
        </div>
      </div>
    </Modal>
  </>
  );
};

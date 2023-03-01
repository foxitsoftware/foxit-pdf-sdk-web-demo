import { Col, message, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { lang } from '../../locales';
import { useIsLoading } from '../../context/isLoading';
import shareMembersIcon from 'assets/icon/share-members.svg';
import {
  createDeferred,
  getQueryVariable,
  storageGetItem,
  storageSetItem,
} from '../../utils/utils';
import {
  isParticipantView
} from '../../utils/collab-utils';
import './TopNav.less';
import 'driver.js/dist/driver.min.css';
import FileList from '../FileList/FileList';
import ScreenSync from '../ScreenSync/ScreenSync';
import CreatorOperationModal from '../CreatorOperationModal/CreatorOperationModal';
import CreateCollaboration from '../CreateCollaboration/CreateCollaboration';
import { useCurrentCollaboration } from '../../context/collaboration';
//import Driver from 'driver.js';
import CollaborationModal from '../CollaborationModal/CollaborationModal';
import { serverUrl } from '../../config';
import { useCurrentCollabClient } from '../../context/WebCollabClient';
import { Collaboration } from '@foxitsoftware/web-collab-client';
import ParticipantOperationPopover from '../ParticipantOperationPopover/ParticipantOperationPopover';
import ParticipantModal from '../ParticipantModal/ParticipantModal';
import { DocEvent } from '../../types';

let passwordDefered = createDeferred();

export default (props) => {
  //const [stepDriver] = useState(new Driver(stepOption));
  const { setIsLoading } = useIsLoading();
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [passwordPopupVisible, setPasswordPopupVisible] = useState(false);
  const [isShowLogin, setIsShowLogin] = useState(false);
  const [isShowNoPermissionPopup, setShowNoPermissionPopup] = useState(false);
  const [permissionChangeVisible, setPermissionChangeVisible] = useState(false);
  const [collaborationEventData, setCollaborationEventData] =
    useState<any>(null);
  const [isCollabMode, setIsCollabMode] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [chooseFile, setChooseFile] = useState<any>(null);
  const [password, setPassword] = useState('');
  const { collabClient } = useCurrentCollabClient();
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
  const [openDocFailed, setOpenDocFailed] = useState(false);
  const { collaboration: currentCollaboration, setCollaboration } =
    useCurrentCollaboration();
  const [isCollaborationBegin, setIsCollaborationBegin] = useState(false);
  const [openFailedDocInfo, setOpenFailedDocInfo] = useState(null);
  const [collaborationEndedPopup, setCollaborationEndedPopup] = useState(false);
  const [collaborationMembers, setCollaborationMembers] = useState<any>([]);

  useEffect(() => {
    (async () => {
      let collaborationId: string | null = getQueryVariable('collaborationId')||storageGetItem(sessionStorage,'collaborationId');
      if (collaborationId && collabClient) {
        try {
          let collaboration = await collabClient.getCollaboration(
            collaborationId,
          );
          beginCollaboration(collaboration);
          if (isParticipantView()) {
            getParticipantPermission(collaboration);
            let participantName = storageGetItem(
              localStorage,
              'participantName',
            );
            if (!participantName) {
              setIsShowLogin(true);
            }
          }
        } catch (error: any) {
          setIsLoading(false);
          //Whether the collaboration cannot be found
          if (error.ret === 404) {
            setCollaborationEndedPopup(true);
            return;
          }
          //If access is not available, show the login interface
          if (error.ret === 403) {
            setShowNoPermissionPopup(true);
            return;
          }
        }
      }
    })();
  }, []);

  //get participant comment permission from the collaboration.
  const getParticipantPermission = async (collaboration) => {
    let permissionApi = await collaboration.getPermission().catch(() => {
      message.error(lang.getPermissionError);
      return;
    });
    let isAllowComment = await permissionApi!.isAllowComment();
    setCanComment(isAllowComment);
    props.setPermissionByParticipant(isAllowComment);
  };
  //start the driver step
  // const startDriver=(role)=> {
  //   // Define the steps for introduction
  //   stepDriver.defineSteps(role);
  //         // Start the introduction
  //   stepDriver.start();
  // }
  //open local file by websdk
  const openFile = async (fileInfo) => {
    if (!props.pdfViewer) {
      throw new Error('PdfViewer init fail')
    }
    setIsLoading(true)
    setIsCollabMode(false);
    setChooseFile(fileInfo);
    let filePath = fileInfo.path;
    if (filePath.indexOf('http') === -1) {
      filePath = `${serverUrl}${fileInfo.path}`
    }
    try{
      let openSuccess=await props.pdfViewer.openPDFByHttpRangeRequest({
        range: {
          url: filePath
        }
      }, { fileName: fileInfo.name })
      if (openSuccess) {
        setIsLoading(false)
        setIsCollaborationBegin(false);
        setOpenDocFailed(false);
        setCollaboration(null);
        // if (isFirstVisit) {
        //   startDriver(collabCreatorSteps)
        //   setIsFirstVisit(false);
        // }
      }
    } catch (errorResponse: any) {
      setIsLoading(false);
      if (errorResponse.error === 3) {
        setPasswordPopupVisible(true);
        setOpenFailedDocInfo(errorResponse.pdfDoc);
      } else {
        message.error(lang.openFailed);
        setOpenDocFailed(true);
      }
    }
  };
  const closePasswordPopup = () => {
    setPasswordPopupVisible(false);
    setOpenDocFailed(true);
    setOpenFailedDocInfo(null);
    setIsCollaborationBegin(false);
    passwordDefered = createDeferred();
    setIsLoading(false);
  };
  //Verify the encrypted document password
  const submitPassword = async (password: string) => {
    if (isCollaborationBegin) {
      passwordDefered.resolve(password);
      return;
    }
    await props.pdfViewer
      .reopenPDFDoc(openFailedDocInfo, {
        password,
      })
      .then(() => {
        setIsCollaborationBegin(false);
        setPasswordPopupVisible(false);
        setPassword(password);
        setOpenDocFailed(false);
        setOpenFailedDocInfo(null);
      })
      .catch(() => {
        message.error(lang.passwordError);
      });
  };
  //Create Collaboration
  const createCollab = async () => {
    setIsLoading(true);
    let chooseFileUrl = chooseFile!.path;
    if (chooseFileUrl.indexOf('http') === -1) {
      chooseFileUrl = `${serverUrl}${chooseFileUrl}`;
    }
    try {
      let collaboration = await collabClient!.createCollaboration({
        fileUrl: chooseFileUrl,
        isDocPublic: true,
        docName: chooseFile.name,
      });
      if (collaboration) {
        beginCollaboration(collaboration);
      }
    } catch (err) {
      message.error(lang.collabOpenFailed);
      setIsLoading(false);
    }
  };
  const openCollaboration = async (collaborationId: string) => {
    setIsLoading(true);
    let collaboration = await collabClient!.getCollaboration(collaborationId);
    beginCollaboration(collaboration);
  };
  //begin Collaboration
  const beginCollaboration = async (collaboration: Collaboration) => {
    //debugger
    props.pdfViewer && props.pdfViewer.close();
    //begin collaboration and Subscription notification event
    setCollaboration(collaboration);
    await subscribeCollaborationEvent(collaboration);
    try {
      let isBeginSuccess;
      if (password) {
        isBeginSuccess=await collaboration.begin({ password });
      } else {
        isBeginSuccess=await collaboration.begin();
      }
      if (isBeginSuccess) {
        await beginCollaborationSuccess(collaboration);
      }
    } catch (error) {
      setIsLoading(false);
      encryptedDocumentHandle(error, collaboration);
    }
  };
  const encryptedDocumentHandle = async (e, collaboration) => {
    passwordDefered = createDeferred();
    if (e.error === 3) {
      setPasswordPopupVisible(true);
      setOpenFailedDocInfo(e.pdfDoc);
      setIsCollaborationBegin(true);

      let passwordValue = await passwordDefered.promise;
      if (passwordValue) {
        try {
          await collaboration.begin({ password: passwordValue });
          beginCollaborationSuccess(collaboration);
        } catch (error) {
          message.error(lang.passwordError);
          encryptedDocumentHandle(error, collaboration);
        }
      }
    } else {
      message.error(lang.collabOpenFailed);
      passwordDefered.resolve(false);
    }
  };

  const beginCollaborationSuccess = async (collaboration) => {
    passwordDefered = createDeferred();
    setPasswordPopupVisible(false);
    setIsCollabMode(true);
    setIsCollaborationBegin(false);
    setOpenFailedDocInfo(null);
    setPassword('');
    if (!isParticipantView()) {
      storageSetItem(sessionStorage, 'collaborationId', collaboration.id);
    }
    // @ts-ignore
    let app = window.app = window.app || {}; let state = app.state = app.state || {}; state.curCollaboration = collaboration;
  };
  //Subscription notification event
  const subscribeCollaborationEvent = async (collaboration: Collaboration) => {
    await collaboration.on(
      DocEvent.onlineStatusChanged,
      async (actionData: any, action) => {
        if (
          action === 'screen-sync-created' ||
          action === 'screen-sync-member-joined' ||
          action === 'screen-sync-member-leave' ||
          action === 'screen-sync-stopped'
        ) {
          setCollaborationEventData({
            actionData,
            action,
          });
          return;
        }
        if (action === 'delete-members') {
          setCollaborationEventData({
            actionData,
            action,
          });
          if (isParticipantView() && actionData.length === 0) {
            return;
          }
        }
        if (action === 'online' || action === 'offline') {
          let members = await collaboration!.getOnlineMembers();
          setOnlineMembers(members!);
        }
        if (!isParticipantView() && action === 'offline') {
          if (actionData.length > 0) {
            if (actionData[0].userName.includes('tourist')) {
              collaboration.removeMembers(actionData);
            }
          }
        }
        if (action === 'delete-share') {
          setCollaborationEndedPopup(true);
          return;
        }
        if (action === 'edit-members') {
          setPermissionChangeVisible(true);
          return;
        }
        getCollaborationMembers(collaboration);
      },
    );
  };
  //Update the collaboration members
  const getCollaborationMembers = async (collaboration) => {
    let collaborationInstance = collaboration
      ? collaboration
      : currentCollaboration;
    if (collaborationInstance) {
      try {
        let collabMembers = await collaborationInstance.getMembers();
        setCollaborationMembers(collabMembers);
      } catch {
        message.error(lang.getMembersError);
      }
    }
  };

  return (
    <>
      <div className="collabView-wrap">
        <Row justify="space-between">
          <Col>
            {!isParticipantView() && (
              <FileList
                openFile={(file) =>
                  openFile(file)
                }
                openCollaboration={(collaborationId) =>
                  openCollaboration(collaborationId)
                }
              />
            )}
          </Col>
          {isCollabMode && (
            <Col>
              <div className="fileName-wrap">
                <div className="fileName">
                  {currentCollaboration && currentCollaboration.docName}
                </div>
                {isParticipantView() && (
                  <div className="participant-permission">
                    {canComment ? '(Can Comment)' : '(Can View)'}
                  </div>
                )}
              </div>
            </Col>
          )}
          <Col>
            <div className="operation-wrap">
              {isCollabMode && (
                <>
                  {onlineMembers && currentCollaboration && (
                    <ScreenSync
                      onlineMembers={onlineMembers}
                      eventData={collaborationEventData}
                      collaboration={currentCollaboration}
                    />
                  )}
                  {!isParticipantView() ? (
                    <CreatorOperationModal
                      collaborationMembers={collaborationMembers}
                      onInvitedMembers={getCollaborationMembers}
                    />
                  ) : (
                    <ParticipantOperationPopover
                      collaborationMembers={collaborationMembers}
                    >
                      <div className="share-popover">
                        <img src={shareMembersIcon}/>
                        Share
                      </div>
                    </ParticipantOperationPopover>
                  )}
                </>
              )}
              {!isParticipantView() && chooseFile && !isCollabMode ? (
                <CreateCollaboration
                  pdfDocPermission={props.pdfDocPermission}
                  openDocFailed={openDocFailed}
                  createCollab={createCollab}
                />
              ) : null}
              {isParticipantView() && isShowLogin && (
                <div className="login-btn-wrap"></div>
              )}
            </div>
          </Col>
        </Row>
      </div>
      <CollaborationModal
        passwordVisible={passwordPopupVisible}
        closePasswordPopup={closePasswordPopup}
        submitPassword={submitPassword}
        collaborationEndedPopup={collaborationEndedPopup}
      />
      {isParticipantView() && (
        <ParticipantModal
          permissionChangeVisible={permissionChangeVisible}
          isShowNoPermissionPopup={isShowNoPermissionPopup}
          isShowLogin={isShowLogin}
        />
      )}
    </>
  );
};

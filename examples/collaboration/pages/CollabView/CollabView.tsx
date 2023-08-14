import React, { useState } from 'react';
import { Spin } from 'antd';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import { useIsLoading } from '../../context/isLoading';
import { PUBLIC_PATH, serverUrl } from '../../config';
import {
  creatorLogin,
  isParticipantView,
  participantLogin,
  toStartLocation,
  updatePdfViewerByPermission,
} from '../../utils/collab-utils';
import { useCurrentCollabClient } from '../../context/WebCollabClient';
import { WebCollabClient } from '@foxitsoftware/web-collab-client';
import { getUser, loginAnonymously } from '../../service/api';
import { useCurrentUser } from '../../context/user';
import TopNav from '../../components/TopNav/TopNav';

export default () => {
  const { isLoading, setIsLoading } = useIsLoading();
  const { collabClient, setCollabClient } = useCurrentCollabClient();
  const { currentUser,setCurrentUser } = useCurrentUser();
  const [pdfDocPermission, setPdfDocPermission] = useState<any>(null);
  const [pdfViewer, setPdfViewer] = useState<any>(null);
  const [pdfui, setPdfui] = useState<any>(null);
  const initCollabclient = async (curPdfviewer) => {
    let isParticipant = isParticipantView();
    let nickName;
    if (!isParticipant) {
      nickName = await creatorLogin();
    } else {
      nickName = await participantLogin();
    }
    if (nickName) {
      let currentToken = await loginAnonymously(nickName);
      let currentUser = await getUser();
      let webCollabClient = await new WebCollabClient({
        pdfViewer: curPdfviewer,
        baseURL: serverUrl,
        userProvider: () => {
          return {
            id: currentUser!.id,
            username: currentUser!.userName,
            token: currentToken,
          };
        },
      });
      setCollabClient(webCollabClient);
      setCurrentUser(currentUser);
    // @ts-ignore
    let app = window.app = window.app || {}; let state = app.state = app.state || {}; state.currentUser = currentUser; state.pdfViewer = curPdfviewer;
    } else {
      toStartLocation()
    }
  };

  const getDocumentPermission = (isPortfolio, hasAnnotFormPermission) => {
    let pdfDocPermission = {
      isPortfolio: Boolean(isPortfolio),
      hasAnnotFormPermission: Boolean(hasAnnotFormPermission),
    };
    setPdfDocPermission(pdfDocPermission);
    setIsLoading(false);
  };

  return (
    <>
      <Spin tip="Loading..." spinning={isLoading} size={'large'}>
        {pdfViewer && collabClient && currentUser &&(
          <TopNav
            pdfViewer={pdfViewer}
            pdfDocPermission={pdfDocPermission}
            setPermissionByParticipant={(isAllowComment) => {
              if (!isAllowComment) {
                updatePdfViewerByPermission(pdfui, pdfViewer);
              }
            }}
          />
        )}
        <PDFViewer
          OnInitializationCompleted={(pdfui, pdfViewer) => {
            setPdfViewer(pdfViewer);
            setPdfui(pdfui);
            initCollabclient(pdfViewer);
          }}
          getDocumentPermission={getDocumentPermission}
        />
      </Spin>
    </>
  );
};
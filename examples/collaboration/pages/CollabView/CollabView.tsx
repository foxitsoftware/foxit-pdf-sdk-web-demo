import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useTranslation } from "react-i18next";
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
import {
  WebCollabClient,
  LoggerFactory,
} from '@foxitsoftware/web-collab-client';
import { getUser, loginAnonymously } from '../../service/api';
import { useCurrentUser } from '../../context/user';
import TopNav from '../../components/TopNav/TopNav';

export default () => {
  const { t, i18n } = useTranslation('translation');
  const { isLoading, setIsLoading } = useIsLoading();
  const { collabClient, setCollabClient } = useCurrentCollabClient();
  const { currentUser, setCurrentUser } = useCurrentUser();
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
      // print out collab add-on version
      console.table(await webCollabClient.getVersion());
      setCollabClient(webCollabClient);
      setCurrentUser(currentUser);

      // this is for used for testing only
      // @ts-ignore
      let app = (window.app = window.app || {});
      let state = (app.state = app.state || {});
      state.currentUser = currentUser;
      state.pdfViewer = curPdfviewer;

      // set collab client log level
      app.LoggerFactory = LoggerFactory;
      // LoggerFactory.setLogLevel('debug');
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

  useEffect(() => {
    pdfui && pdfui?.changeLanguage(i18n.language);
  },[i18n.language])

  useEffect(() => {
    pdfui && pdfui?.changeLanguage(i18n.language);
  }, [pdfui]);

  return (
    <>
      <Spin tip={t('Loading...')} spinning={isLoading} size={'large'}>
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

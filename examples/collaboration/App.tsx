import React from 'react'
import './App.less';
import CollabView from './pages/CollabView/CollabView';
import { WithCollaboration } from './context/collaboration';
import { WithIsLoading } from './context/isLoading';
import { WithCurrentUser } from './context/user';
import { WithCollabClient } from './context/WebCollabClient';
import { useTranslation } from "react-i18next";

export default() => {
  const { i18n } = useTranslation('translation');
  window.i18n = i18n;
  return (
    <>
    <WithIsLoading>
      <WithCurrentUser>
        <WithCollabClient>
            <WithCollaboration>
              <CollabView></CollabView>
            </WithCollaboration>
          </WithCollabClient>
        </WithCurrentUser>
        </WithIsLoading>
    </>
  );
};

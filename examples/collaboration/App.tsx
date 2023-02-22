import React from 'react'
import './App.less';
import CollabView from './pages/CollabView/CollabView';
import { WithCollaboration } from './context/collaboration';
import { WithIsLoading } from './context/isLoading';
import { WithCurrentUser } from './context/user';
import { WithCollabClient } from './context/WebCollabClient';

export default() => {
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

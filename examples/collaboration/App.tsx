import React, {useEffect} from 'react'
import './App.less';
import CollabView from './pages/CollabView/CollabView';
import { WithCollaboration } from './context/collaboration';
import { WithIsLoading } from './context/isLoading';
import { WithCurrentUser } from './context/user';
import { WithCollabClient } from './context/WebCollabClient';
import { useTranslation } from "react-i18next";

export default() => {
  const { i18n } = useTranslation('translation');
  
  useEffect(() => {
    let language = navigator.language || 'en-US';
    i18n.changeLanguage(language);
    const getMessage = (event) => {
        let Data;
        try {
          Data = JSON.parse(event.data);
        } catch (error) {
          return;
        }
        if (Data.hasOwnProperty("language")){
          if(language !== Data.language ){
            i18n.changeLanguage(Data.language);
          }
        }
    };
    window.addEventListener("message", getMessage, false);
    window.top?.postMessage('ready', {
      targetOrigin: '*'
    });
    return () => {
      window.addEventListener("message", getMessage, false);
    };
  }, [location.hash]);

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

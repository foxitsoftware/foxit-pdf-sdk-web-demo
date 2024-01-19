import React, { useEffect } from 'react';
import './App.less';
import Uploader from "./Upload";
import BasicLayout from "./layout";
import { useTranslation } from "react-i18next";

export default() => {
  const { i18n } = useTranslation('translation', {keyPrefix: "Conversion"});
  useEffect(() => {
    let currentLanguage = 'en-US';
    const getMessage = (event) => {
        let Data;
        try {
          Data = JSON.parse(event.data);
        } catch (error) {
          return;
        }
        if (Data.hasOwnProperty("language")){
          let language = Data.language;
          if(currentLanguage !== language ){
            currentLanguage = language;
            i18n.changeLanguage(language);
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
      <div className="main">
        <BasicLayout>
          <Uploader />
        </BasicLayout>
      </div>
    </>
  );
};

import React, { useEffect, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import zhTW from 'antd/es/locale/zh_TW';
import enUS from 'antd/es/locale/en_US';
import './App.less';
import Uploader from "./Upload";
import BasicLayout from "./layout";
import { useTranslation } from "react-i18next";

function antdLocaleForLng(lng: string) {
  if (lng === 'zh-CN') return zhCN;
  if (lng === 'zh-TW') return zhTW;
  return enUS;
}

export default() => {
  const { i18n } = useTranslation('translation', {keyPrefix: "Conversion"});
  const antdLocale = useMemo(() => antdLocaleForLng(i18n.language), [i18n.language]);
  useEffect(() => {
    const getMessage = (event: MessageEvent) => {
        let Data;
        try {
          Data = JSON.parse(event.data as string);
        } catch (error) {
          return;
        }
        if (Data.hasOwnProperty("language")){
          const language = Data.language;
          if (i18n.language !== language) {
            i18n.changeLanguage(language);
          }
        }
    };
    window.addEventListener("message", getMessage, false);
    window.top?.postMessage('ready', '*');
    return () => {
      window.removeEventListener("message", getMessage, false);
    };
  }, [location.hash]);
  
  return (
    <ConfigProvider locale={antdLocale}>
      <div className="main">
        <BasicLayout>
          <Uploader />
        </BasicLayout>
      </div>
    </ConfigProvider>
  );
};

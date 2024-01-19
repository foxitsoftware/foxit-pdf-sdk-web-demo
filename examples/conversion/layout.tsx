//@ts-nocheck
import React from "react";
import { Layout } from "antd";
import { supportVersion } from './config'
import foxitLogo from 'assets/icon/foxit.svg';
import { useTranslation } from "react-i18next";

const { Header, Content } = Layout;

export default (props)=> {
  const { t } = useTranslation('translation', { keyPrefix: 'Conversion' });

  return (
    <>
      <Layout style={{ background: "#ffffff" }}>
        <Header className="tools-main-layout-header">
          <div className="header-logo-container">
            <img className="logo-img" src={foxitLogo} alt=""></img>
          </div>
          <span>{t("PDF To Office")}</span>
          <span className="header-version">{supportVersion}</span>
        </Header>
        <Content
          className="tools-main-layout-content"
          style={{ margin: "24px 16px 0" }}
        >
          {props.children}
        </Content>
      </Layout>
    </>
  );
}

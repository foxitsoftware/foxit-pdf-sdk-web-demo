//@ts-nocheck
import React from "react";
import { Layout } from "antd";
import { supportVersion } from './config'
import foxitLogo from 'assets/icon/foxit.svg';
const { Header, Content } = Layout;

class BasicLayout extends React.Component {
  render() {
    return (
      <Layout style={{ background: "#ffffff" }}>
        <Header className="tools-main-layout-header">
          <div className="header-logo-container">
            <img className="logo-img" src={foxitLogo} alt=""></img>
          </div>
          <span>PDF To Office</span>
          <span className="header-version">{supportVersion}</span>
        </Header>
        <Content
          className="tools-main-layout-content"
          style={{ margin: "24px 16px 0" }}
        >
          {this.props.children}
        </Content>
      </Layout>
    );
  }
}

export default BasicLayout;

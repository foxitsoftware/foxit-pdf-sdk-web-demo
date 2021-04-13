import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useEffect, useRef } from "react";
import { Switch, Route, HashRouter } from "react-router-dom";
import { examples } from "./foundation/examples";
const { Content } = Layout;

const App = () => {
  const iframeRef = useRef<any>();

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = function () {
        if (iframeRef.current.contentWindow.errorLoad) {
          window.errorLoad = {
            error: true,
            message: "Error load pdf",
          };
          return;
        }
        window.errorLoad = {
          error: false,
          message: "Success",
        };
      };
    }
  }, [iframeRef.current]);

  return (
    <>
      <HashRouter>
        <Layout className="fv__catalog-app">
          <Layout className="fv__catalog-app-body">
            <Layout>
              <Content>
                <Switch>
                  {examples.map((it) => {
                    return (
                      <Route path={"/examples/" + it.baseName} key={it.name}>
                        <iframe
                          ref={iframeRef}
                          className="fv__catalog-app-previewer"
                          src={it.path}
                        ></iframe>
                      </Route>
                    );
                  })}
                </Switch>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </HashRouter>
    </>
  );
};

export default App;

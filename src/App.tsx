import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React from "react";
import { Switch, Route, BrowserRouter, HashRouter } from "react-router-dom";
import { ExampleList } from "./components/example-list/ExampleList";
import { examples } from "./foundation/examples";
const { Header, Content, Sider } = Layout;

const App = () => {
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

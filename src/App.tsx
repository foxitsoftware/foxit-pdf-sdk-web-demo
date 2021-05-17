import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter, useLocation } from "react-router-dom";
import { examples } from "./foundation/examples";
import { Tooltip } from "./components/tooltip/Tooltip";
import { advanced_forms, form, annotation, redaction, editPdf } from "./scenes";

const { Content } = Layout;

const App = () => {
  const iframeRef = useRef<any>(null);
  const locationDom = useLocation();
  const [curent, setCurent] = useState<number>(0);
  const [isDoneScene, changeDone] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [scene, setCurentScene] = useState<any>(editPdf);
  const [el, setEl] = useState<any>()
  window.onload = () => console.log(document.getElementsByName(`change-color-dropdown`).length)
  const handleNext = () => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent + 1;
      scene[newCurent].func(iframeRef);
      return newCurent;
    });
  };

  const handlePrev = () => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent - 1;
      scene[newCurent].func(iframeRef);
      return newCurent;
    });
  };
  const getOffset = async(el:any) => {
    if(el.length){
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    }
  }
  const handleDone = useCallback(() => {
    changeDone(false);
  }, []);

  useEffect(() => {
    switch (locationDom.hash) {
      case "#/examples/00-hello": {
        setCurentScene(editPdf);
        break;
      }
      case "#/examples/01-annotation": {
        setCurentScene(annotation);
        break;
      }
      case "#/examples/02-forms": {
        setCurentScene(form);
        break;
      }
      case "#/examples/03-redaction": {
        setCurentScene(redaction);
        break;
      }
      case "#/examples/04-advanced_forms": {
        setCurentScene(advanced_forms);
        break;
      }
    }
  }, [locationDom.hash]);

  useEffect(() => {
    console.log(scene[curent].elementName)
    
    changeDone(true);
    setIsSuccess(false);
    setCurent(0);
  }, [locationDom.hash]);
  useEffect( () => {
    setEl( iframeRef.current.contentDocument.getElementsByName(`change-color-dropdown`))
    if(el){
      let originalLog = console.log;
      console.log = function(el:any) {
          originalLog(JSON.parse(JSON.stringify(el)));
      };
    }  
  },[el])
  return (
    <HashRouter>
      <Layout className="fv__catalog-app">
        <Layout className="fv__catalog-app-body">
          <Layout>
            <Content>
              <Switch>
                {examples.map((it) => {
                  return (
                    <Route path={"/examples/" + it.baseName} key={it.name}>
                      {(isDoneScene && isSuccess) && (
                        <Tooltip
                          positionX={scene[curent].positionX}
                          positionY={scene[curent].positionY}
                          sideTriangle={scene[curent].sideTriangle}
                          header={scene[curent].header}
                          description={scene[curent].description}
                          isFirst={Boolean(curent)}
                          isLast={scene.length - 1 === curent}
                          handleNext={handleNext}
                          handlePrev={handlePrev}
                          handleDone={handleDone}
                        />
                      )}
                      <iframe
                        onLoad={() => setIsSuccess(true)}
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
  );
};

export default App;

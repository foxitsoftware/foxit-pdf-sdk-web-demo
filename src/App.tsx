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
  const [el, setEl] = useState<any>();
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
  const getOffset = (el: any) => {
    if (el.length) {
      const rect = el[0].getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    }
  };
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

    // iframeRef.current.contentDocument.addEventListener("load", () =>
    //   console.dir(iframeRef.current.contentDocument.anchors["create-text"])
    // );
  }, [locationDom.hash]);

  useEffect(() => {
    // console.log(scene[curent].elementName);

    changeDone(true);
    setIsSuccess(false);
    setCurent(0);
  }, [locationDom.hash]);
  useEffect(() => {
    // console.log(iframeRef);
    if (iframeRef.current) {
      if (iframeRef.current.contentWindow.pdfui) {
        iframeRef.current.contentWindow.pdfui.addViewerEventListener(
          "open-file-success",
          () => {
            console.log("file load");
            setIsSuccess(true);
          }
        );
        console.log(
          getOffset(
            iframeRef.current.contentDocument.getElementsByName(
              "download-file-button"
            )
          )
        );
      }
    }
  }, [iframeRef.current]);

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
                      {isDoneScene && isSuccess && (
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
                        onLoad={() => {
                          setIsSuccess(true);
                          // console.log(iframeRef.current.contentWindow.pdfui);
                        }}
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

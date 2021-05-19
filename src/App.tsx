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
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [scene, setCurentScene] = useState<any>(editPdf);
  const [locationTooltipX, setLocationTooltipX] = useState<string>("")
  const [locationTooltipY, setLocationTooltipY] = useState<string>("")


  const getElement = (curent:number) => {
    console.log(curent)
    console.log("file load");
    setIsSuccess(true);
    console.log(
      getOffset(
        iframeRef.current.contentDocument.getElementsByName(
          scene[curent].elementName
        )
      )
    );
  }


  const handleNext = () => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent + 1;
      getElement(newCurent)
      scene[newCurent].func(iframeRef);
      return newCurent;
    });
  };

  const handlePrev = () => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent - 1;
      scene[newCurent].func(iframeRef);
      getElement(newCurent)
      return newCurent;
    });
  };
  const getOffset = (el: any) => {
    if (el.length) {
      const rect = el[0].getBoundingClientRect();
      setLocationTooltipX(`${rect.left + window.scrollX - 100}px`)
      setLocationTooltipY(`${rect.top + window.scrollY+40}px`)
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
      case "#/examples/04-edit_pdfs": {
        setCurentScene(advanced_forms);
        break;
      }
    }

    // iframeRef.current.contentDocument.addEventListener("load", () =>
    //   console.dir(iframeRef.current.contentDocument.anchors["create-text"])
    // );
  }, [locationDom.hash]);



  useEffect(() => {
    changeDone(true);
    setIsLoad(false);
    setIsSuccess(false);
    setCurent(0);
  }, [locationDom.hash]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow.pdfui) {
      iframeRef.current.contentWindow.pdfui.addViewerEventListener("open-file-success",() => { getElement(curent) })
    }
  }, [isLoad]);

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
                          positionX={scene[curent].sideTriangle === "top"?locationTooltipX:scene[curent].positionX}
                          positionY={scene[curent].sideTriangle === "top"?locationTooltipY:scene[curent].positionY}
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
                          setIsLoad(true);
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

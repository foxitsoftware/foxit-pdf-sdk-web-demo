import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter, useLocation } from "react-router-dom";
import { examples } from "./foundation/examples";
import { Tooltip } from "./components/tooltip/Tooltip";
import {
  advanced_forms,
  form,
  annotation,
  redaction,
  editPdf,
  digital_signature,
  search,
} from "./scenes";

const { Content } = Layout;

const App = () => {
  const iframeRef = useRef<any>(null);
  const locationDom = useLocation();
  const [isShow, setIsShow] = useState(false);
  const [current, setCurrent] = useState<number>(0);
  const [isDoneScene, changeDone] = useState<boolean>(true);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [scene, setScene] = useState<any>(editPdf);
  const [locationTooltipX, setLocationTooltipX] = useState<string>("");
  const [locationTooltipY, setLocationTooltipY] = useState<string>("");
  const [isDesktopDevice, setIsDevice] = useState<boolean>(false);

  const getMessage = (event: any) => {
    setIsShow(event.data);
  };

  useEffect(() => {
    window.addEventListener("message", getMessage, false);
    return () => {
      window.addEventListener("message", getMessage, false);
    };
  }, [iframeRef, location.hash]);


  const getElement = (newCurrent: number) => {
    setIsSuccess(true);

    if (locationDom.hash === "#/examples/digital_signature") {
      const currentItem =
        iframeRef.current.contentDocument.getElementsByClassName(
          "fv__ui-portfolio-container"
        )[0];
      currentItem &&
        (currentItem.style.cssText =
          "padding: 0px 200px; background: gainsboro;");
    }
    if(locationDom.hash === "#/examples/annotation" && newCurrent === 1) {
      getOffset(
        iframeRef.current.contentDocument.querySelector(
         `.${scene[newCurrent].elementName}`
        )
      );
    }else {
      getOffset(
        iframeRef.current.contentDocument.getElementsByName(
          scene[newCurrent].elementName
        )
      );
    }
  };

  const handleNext = () => {
    setCurrent((prevCurrent) => {
      const newCurrent = prevCurrent + 1;
      scene[newCurrent].func(iframeRef)
      console.log("2")
      getElement(newCurrent);
      return newCurrent;
    });
  };

  const handlePrev = () => {
    setCurrent((prevCurrent) => {
      const newCurrent = prevCurrent - 1;
      scene[newCurrent].func(iframeRef);
      getElement(newCurrent);
      return newCurrent;
    });
  };

  const handleThisFunc = (el: string) => {
    if (el === "move") {
      scene[current].func(iframeRef);
    } else {
      scene[current].func(iframeRef);
    }
  };

  const getOffset = (el: any) => {
    console.log(el)
    if (el.length) {
      const rect = el[0].getBoundingClientRect();
      console.log(el[0].getBoundingClientRect())
      if (scene[current].sideTriangle === "right") {
        setLocationTooltipX(`${rect.left + window.scrollX - 316}px`);
        setLocationTooltipY(`${rect.top + window.scrollY - 120}px`);
      } else if(scene[current].sideTriangle === "left-fixed"){
        setLocationTooltipX(`${rect.left + window.scrollX + 70}px`);
        setLocationTooltipY(`${rect.top + window.scrollY - 85}px`);
      } else {
        rect.left + window.scrollX === 0
          ? setLocationTooltipX(`${rect.left + window.scrollX}px`)
          : setLocationTooltipX(`${rect.left + window.scrollX - 100}px`);
        setLocationTooltipY(`${rect.top + window.scrollY + 40}px`);
      }
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    }
  };

  const handleDone = useCallback(() => {
    changeDone(false);
  }, []);

  const resizeWindow = () => {
    if (iframeRef.current.contentWindow.innerWidth < 900) {
      setIsDevice(false);
    } else {
      setIsDevice(true);
    }
  };

  useEffect(() => {
    switch (locationDom.hash) {
      case "#/examples/hello": {
        setScene(editPdf);
        break;
      }
      case "#/examples/annotation": {
        setScene(annotation);
        break;
      }
      case "#/examples/forms": {
        setScene(form);
        break;
      }
      case "#/examples/redaction": {
        setScene(redaction);
        break;
      }
      case "#/examples/edit_pdfs": {
        setScene(advanced_forms);
        break;
      }
      case "#/examples/digital_signature": {
        setScene(digital_signature);
        break;
      }
      case "#/examples/search": {
        setScene(search);
        break;
      }
    }
  }, [locationDom.hash]);

  useEffect(() => {
    getElement(current);
  }, [current]);

  useEffect(() => {
    changeDone(true);
    setIsLoad(false);
    setIsSuccess(false);
    setCurrent(0);
  }, [locationDom.hash]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow.pdfui) {
      setIsDevice(iframeRef.current.contentWindow.isDesktopDevise);

      iframeRef.current.contentWindow.onresize = resizeWindow;

      iframeRef.current.contentWindow.pdfui.addViewerEventListener(
        "open-file-success",
        () => {
          getElement(current);
        }
      );
    }
    return () => {
      iframeRef.current.contentWindow.onresize = null;
    };
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
                      {isShow &&
                        isDoneScene &&
                        isSuccess &&
                        isDesktopDevice && (
                          <Tooltip
                            positionX={
                              scene[current].sideTriangle === "top" ||
                              scene[current].sideTriangle === "right"||
                              scene[current].sideTriangle === 'left-fixed'
                                ? locationTooltipX
                                : scene[current].positionX
                            }
                            positionY={
                              scene[current].sideTriangle === "top" ||
                              scene[current].sideTriangle === "right"||
                              scene[current].sideTriangle === 'left-fixed'
                                ? locationTooltipY
                                : scene[current].positionY
                            }
                            sideTriangle={scene[current].sideTriangle}
                            header={scene[current].header}
                            isRotate={scene[current].header === "Rotate pages"}
                            isMove={scene[current].header === "Reorder pages"}
                            description={scene[current].description}
                            isFirst={Boolean(current)}
                            isLast={scene.length - 1 === current}
                            handleNext={handleNext}
                            handlePrev={handlePrev}
                            handleDone={handleDone}
                            handleThisFunc={handleThisFunc}
                          />
                        )}
                      <iframe
                        onLoad={() => {
                          setIsLoad(true);
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

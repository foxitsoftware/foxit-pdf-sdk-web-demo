import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter, useLocation } from "react-router-dom";
import { examples } from "./foundation/examples";
import { Tooltip } from "./components/tooltip/Tooltip";
import { AdvancedTooltip } from "./components/advancedTooltip/AdvancedTooltip";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";

import {
  hello,
  form,
  annotation,
  redaction,
  editPdf,
  digital_signature,
  search,
  measurement
} from "./scenes";

const { Content } = Layout;

const App = () => {
  const iframeRef = useRef<any>(null);
  const locationDom = useLocation();
  const [isShow, setIsShow] = useState(true);
  const [current, setCurrent] = useState<number>(0);
  const [isDoneScene, changeDone] = useState<boolean>(true);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [scene, setScene] = useState<any>(hello);
  const [locationTooltipX, setLocationTooltipX] = useState<string>("");
  const [locationTooltipY, setLocationTooltipY] = useState<string>("");
  const [screenSize, setScreenSize] = useState<string>("desktop");
  const [isReloadToolTip, setIsReloadToolTip] = useState<boolean>(false);
  const getMessage = (event: any) => {
    let Data;
    try {
      Data = JSON.parse(event.data);
    } catch (error) {
      return;
    }
    if (Data.hasOwnProperty("isTurn")) {
      setIsShow(Data.isTurn);
    }
    if (Data.screenSize) {
      setScreenSize(Data.screenSize);
      if(Data.screenSize !== "desktop"){
        setIsSuccess(false)
      }
      iframeRef.current.contentWindow.location.reload();
    }
  };

  useEffect(() => {
    window.addEventListener("message", getMessage, false);
    return () => {
      window.addEventListener("message", getMessage, false);
    };
  }, [iframeRef, location.hash]);

  const getElement = (newCurrent: number) => {
    setIsSuccess(true);
    let currentScene = scene[newCurrent], element = null;
    if(currentScene.elementClassName){
      element = iframeRef.current.contentDocument.getElementsByClassName(
        currentScene.elementClassName
      )
    }else{
      element = iframeRef.current.contentDocument.getElementsByName(
        currentScene.elementName
      )
    }
    getOffset(element);
  };

  const handleNext = () => {
    setCurrent((prevCurrent) => {
      const newCurrent = prevCurrent + 1;
      scene[newCurrent].func(iframeRef);
      scene[newCurrent].asyncLoadToolTip&&reloadToolTip(newCurrent);
      getElement(newCurrent);
      return newCurrent;
    });
  };

  const handlePrev = () => {
    setCurrent((prevCurrent) => {
      const newCurrent = prevCurrent - 1;
      scene[newCurrent].func(iframeRef);
      scene[newCurrent].asyncLoadToolTip&&reloadToolTip(newCurrent);
      getElement(newCurrent);
      return newCurrent;
    });
  };
  const handleThisFunc = () => {
    scene[current].func(iframeRef);
  };

  const exportInf = () => {
    const example = iframeRef.current.contentWindow.__example__;
    return example.exportData()
  };

  const reloadToolTip = (newCurrent: number)=>{
    const pdfui = iframeRef.current.contentWindow.pdfui;
    const resetPosition = ()=>{
      const { elementClassName, elementIndex} = scene[newCurrent]
      console.log(iframeRef.current.contentDocument.getElementsByClassName(elementClassName)[elementIndex]);
      setIsReloadToolTip(true);
      getOffset(iframeRef.current.contentDocument.getElementsByClassName(elementClassName)[elementIndex])
      pdfui.removeUIEventListener("render-page-success",resetPosition)
      setIsReloadToolTip(false);
    }
    return pdfui.addUIEventListener("render-page-success",resetPosition)
  }

  const getOffset = (el: any) => {
    const {scrollX,scrollY,innerWidth} = window;
    const {sideTriangle,positionX,positionY,offsetX=0,offsetY=0,elementIndex=0} = scene[current];
    const rectLeft = Number(positionX.slice(0,-2));
    const rectTop = Number(positionY.slice(0,-2));
    if (el.length) {
      if(!el[elementIndex]){
        setLocationTooltipX(`200%`);
        setLocationTooltipY(`200%`);
        return
      }
      const {left,top,bottom} = el[elementIndex].getBoundingClientRect();
      switch (sideTriangle) {
        case 'right':
          setLocationTooltipX(`${left + scrollX - 316}px`);
          setLocationTooltipY(`${top + scrollY - 30}px`);
          break;
        case 'right-bottom':
          setLocationTooltipX(`${innerWidth - rectLeft - 280}px`);
          setLocationTooltipY(`${bottom - 290}px`);
          break;
        case 'left-custom':
          setLocationTooltipX(`${left + scrollX + 90}px`);
          setLocationTooltipY(`${top + scrollY - 40}px`);
          break;
        default:
          left + scrollX === 0
          ? setLocationTooltipX(`${left + scrollX}px`)
          : setLocationTooltipX(`${left + scrollX - Number(offsetX) - 100}px`);
          setLocationTooltipY(`${top + scrollY - Number(offsetY) + 40}px`);
          break;
      }
      return {
        left: left + scrollX,
        top: top + scrollY,
      };
    }else{
      if(scene[current].sideTriangle === 'right-custom'){
        setLocationTooltipX(`${innerWidth - rectLeft - 280}px`);
        setLocationTooltipY(`${rectTop}px`);
      }
    }
  };

  const handleDone = useCallback(() => {
    changeDone(false);
  }, []);

  useEffect(() => {
    switch (locationDom.hash) {
      case "#/hello": {
        setScene(hello);
        break;
      }
      case "#/annotation": {
        setScene(annotation);
        break;
      }
      case "#/measurement": {
        setScene(measurement);
        break;
      }
      case "#/forms": {
        setScene(form);
        break;
      }
      case "#/redaction": {
        setScene(redaction);
        break;
      }
      case "#/edit_pdfs": {
        setScene(editPdf);
        break;
      }
      case "#/digital_signature": {
        setScene(digital_signature);
        break;
      }
      case "#/search": {
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
      iframeRef.current.contentWindow.pdfui.addViewerEventListener(
        "open-file-success",
        () => {
          getElement(current);
        }
      );
    }
  }, [isLoad, screenSize]);

  useEffect(() => {
    if(isReloadToolTip){
      getElement(current);
    }
  }, [isReloadToolTip]);

  return (
    <HashRouter>
        <Layout className="fv__catalog-app-body">
            <Content>
              <Switch>
                {examples.map((it) => {
                  return (
                    <Route path={"/" + it.baseName} key={it.name}>
                      {isShow &&
                        isDoneScene &&
                        isSuccess &&
                        locationDom.hash !== "#/advanced_form" &&
                        screenSize === "desktop" && (
                          <Tooltip
                            positionX={
                              ["top","right","right-bottom","right-custom","left-custom"].findIndex(item=>scene[current].sideTriangle==item)>-1
                                ? locationTooltipX
                                : scene[current].positionX
                            }
                            positionY={
                              ["top","right","right-bottom","right-custom","left-custom"].findIndex(item=>scene[current].sideTriangle==item)>-1
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
                      {locationDom.hash === "#/advanced_form" &&
                        isShow &&
                        isSuccess &&
                        screenSize === "desktop" && (
                          <AdvancedTooltip
                            header="Save your form data"
                            description="Download your partially-filled form data as HTML to save your place, and pick it up again later."
                            positionY="0px"
                            positionX="70px"
                            exportInf={exportInf}
                          />
                        )}

                      <iframe
                        onLoad={() => {
                          setIsLoad(true);
                        }}
                        ref={iframeRef}
                        className="fv__catalog-app-previewer"
                        src={it.path}
                        allowFullScreen
                      ></iframe>
                    </Route>
                  );
                })}
              </Switch>
            </Content>
          </Layout>
    </HashRouter>
  );
};

export default App;
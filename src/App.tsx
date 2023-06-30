import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter, useLocation } from "react-router-dom";
import { examples } from "./foundation/examples";
import { Tooltip } from "./components/tooltip/Tooltip";
import { AdvancedTooltip } from "./components/advancedTooltip/AdvancedTooltip";
// import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";

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
import { isMobile, isTablet } from "./foundation/device";

const { Content } = Layout;

const screenSize = new URL(location.href).searchParams.get('screen-size') || (isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop');
const TURN_ON_OFF_STORE_KEY = '__foxit_websdk_turn_on_off_tooltip__';

const App = () => {
  const iframeRef = useRef<any>(null);
  const locationDom = useLocation();
  const [isShow, setIsShow] = useState(false);
  const [current, setCurrent] = useState<number>(0);
  const [isDoneScene, changeDone] = useState<boolean>(true);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [scene, setScene] = useState<any>(hello);
  const [locationTooltipX, setLocationTooltipX] = useState<string>("");
  const [locationTooltipY, setLocationTooltipY] = useState<string>("");
  const [isReloadToolTip, setIsReloadToolTip] = useState<boolean>(false);
  const [isTurn, setIsTurn] = useState(localStorage.getItem(TURN_ON_OFF_STORE_KEY) ?? true);
  const getMessage = (event: any) => {
    let Data;
    try {
      Data = JSON.parse(event.data);
    } catch (error) {
      return;
    }
    if (Data.hasOwnProperty("isTurn")) {
      setIsTurn(Data.isTurn);
    }
  };

  useEffect(() => {
    window.addEventListener("message", getMessage, false);
    window.top?.postMessage('ready', {
      targetOrigin: '*'
    });
    return () => {
      window.addEventListener("message", getMessage, false);
    };
  }, [iframeRef, location.hash]);
  
  useEffect(() => {
    const pdfui = iframeRef.current?.contentWindow?.pdfui;
    if(pdfui) {
      pdfui.getCurrentPDFDoc().then((doc: any) => {
        setIsShow(!!doc && isTurn && isLoad);
      })
    }
  }, [isTurn, isLoad])
  
  const updateCurrentElement = (newCurrent: number) => {
    let currentScene = scene[newCurrent], element = null;
    if(currentScene.elementClassName){
      element = iframeRef.current.contentDocument.getElementsByClassName(
        currentScene.elementClassName
      )
    }else{
      element = iframeRef.current?.contentDocument.getElementsByName(
        currentScene.elementName
      )
    }
    updateOffset(element);
  };

  const handleNext = () => {
    setCurrent((prevCurrent) => {
      const newCurrent = prevCurrent + 1;
      scene[newCurrent].func(iframeRef);
      scene[newCurrent].asyncLoadToolTip&&reloadToolTip(newCurrent);
      updateCurrentElement(newCurrent);
      return newCurrent;
    });
  };

  const handlePrev = () => {
    setCurrent((prevCurrent) => {
      const newCurrent = prevCurrent - 1;
      scene[newCurrent].func(iframeRef);
      scene[newCurrent].asyncLoadToolTip&&reloadToolTip(newCurrent);
      updateCurrentElement(newCurrent);
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
      setIsReloadToolTip(true);
      updateOffset(iframeRef.current.contentDocument.getElementsByClassName(elementClassName)[elementIndex])
      pdfui.removeUIEventListener("render-page-success",resetPosition)
      setIsReloadToolTip(false);
    }
    return pdfui.addUIEventListener("render-page-success",resetPosition)
  }

  const updateOffset = (el: any) => {
    const {scrollX,scrollY,innerWidth} = window;
    const {sideTriangle,positionX,positionY,offsetX=0,offsetY=0,elementIndex=0} = scene[current];
    const rectLeft = Number(positionX.slice(0,-2));
    const rectTop = Number(positionY.slice(0,-2));
    if (el && el.length) {
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
    updateCurrentElement(current);
  }, [current]);

  useEffect(() => {
    changeDone(true);
    setIsLoad(false);
    setCurrent(0);
  }, [locationDom.hash]);

  const [pdfui, setPDFUI] = useState<any>(null);
  
  useEffect(() => {
    if(!pdfui) {
      return;
    }
    pdfui.getCurrentPDFDoc().then((doc: any) => {
      if(doc) {
        setIsShow(!!doc && isTurn && isLoad);
        updateCurrentElement(current);
      }
    })
    return pdfui.addViewerEventListener(
      "open-file-success",
      () => {
        setIsShow(isTurn && isLoad);
        updateCurrentElement(current);
      }
    );
  }, [pdfui])


  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    let pdfui = win?.pdfui;
    if(pdfui) {
      setPDFUI(pdfui);
      return;
    }
    setTimeout(function wait() {
      pdfui = win?.pdfui;
      if(!pdfui) {
        setTimeout(wait, 100);
      } else {
        setIsLoad(true);
        setPDFUI(pdfui);
      }
    }, 100)
  }, [iframeRef.current]);

  useEffect(() => {
    if(isReloadToolTip){
      updateCurrentElement(current);
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
                        locationDom.hash !== "#/advanced_form" &&
                        screenSize === "desktop" &&
                        locationDom.hash !== "#/collaboration" && (
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
                        x-screen-size={screenSize}
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
import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter, useLocation } from "react-router-dom";
import { examples } from "./foundation/examples";
import { Tooltip } from "./components/tooltip/Tooltip";
import { advanced_forms, form, annotation, redaction, editPdf, digital_signature, search } from "./scenes";


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
  const [isDesktopDevice, setIsDevice] = useState<boolean>(false)
  const getElement = (curent:number) => {
    console.log(curent)
    console.log("file load");
    setIsSuccess(true);
    if(locationDom.hash === "#/examples/05-digital_signature"){
      const curentItem = iframeRef.current.contentDocument.getElementsByClassName('fv__ui-portfolio-container')[0]
      curentItem && (curentItem.style.cssText = 'padding: 0px 224px; background: gainsboro;')
    }
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
      scene[newCurent].func(iframeRef);
      getElement(newCurent)
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

  const handleThisFunc = (el:string) => {
    if(el === "move"){
      scene[curent].func(iframeRef);
    } else {
      scene[curent].func(iframeRef);
    }
  }

  useEffect(() => {
    getElement(curent)
  }, [curent])
  const getOffset = (el: any) => {
    if (el.length) {
      const rect = el[0].getBoundingClientRect();
      if(scene[curent].sideTriangle === "right"){
        setLocationTooltipX(`${rect.left + window.scrollX -316}px`)
        setLocationTooltipY(`${rect.top + window.scrollY -120}px`)
      } else {
        setLocationTooltipX(`${rect.left + window.scrollX - 100}px`)
        setLocationTooltipY(`${rect.top + window.scrollY+40}px`)
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
      case "#/examples/05-digital_signature": {
        setCurentScene(digital_signature);
        break;
      }
      case "#/examples/06-search": {
        setCurentScene(search);
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
      setIsDevice(iframeRef.current.contentWindow.isDesktopDevise)
      iframeRef.current.contentWindow.onresize = () => {
        if(iframeRef.current.contentWindow.innerWidth<900){
          setIsDevice(false)
        } else {
          setIsDevice(true)
        }
      }
      iframeRef.current.contentWindow.pdfui.addViewerEventListener("open-file-success",() => { getElement(curent) })
    }
    return () => { iframeRef.current.contentWindow.onresize = null}
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
                      {isDoneScene && isSuccess && isDesktopDevice && (
                        <Tooltip
                          positionX={scene[curent].sideTriangle === "top" || scene[curent].sideTriangle === "right"?locationTooltipX:scene[curent].positionX}
                          positionY={scene[curent].sideTriangle === "top"|| scene[curent].sideTriangle === "right"?locationTooltipY:scene[curent].positionY}
                          sideTriangle={scene[curent].sideTriangle}
                          header={scene[curent].header}
                          isRotate={scene[curent].header === "Rotate pages"}
                          isMove = {scene[curent].header === "Reorder pages"}
                          description={scene[curent].description}
                          isFirst={Boolean(curent)}
                          isLast={scene.length - 1 === curent}
                          handleNext={handleNext}
                          handlePrev={handlePrev}
                          handleDone={handleDone}
                          handleThisFunc = {handleThisFunc}
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

import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter } from "react-router-dom";
import { examples } from "./foundation/examples";
import {InfoModal} from "./components/tooltip/Tooltip";
import { closeSidebar, createCalloutAnnotation, createCustomStamp, disableAll, hideAll, markAndRedactAStringOfText, movePage, openSidebar, rotatePage } from "./snippets/snippets"
const { Content } = Layout;



const App = () => {
  const iframeRef = useRef<any>();
  const [isError, setIsError] = useState<boolean>(false);
  const [curent, setCurent] = useState<number>(0)
  const [isDoneScene, changeDone] = useState<boolean>(true)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = function () {
        if (iframeRef.current.contentWindow.errorLoad) {
          setIsError(true);
        } else {
          setIsError(false);
        }
      };
      console.dir(iframeRef.current.baseURI.split("/")[iframeRef.current.baseURI.split("/").length-1])
    }
  }, [iframeRef.current]);

  const scens = [
    {positionX:"75px", positionY:"75px", sideTriangle:"top", header:"Create & edit", description:"The toolbar has everything you need. Print, protect, edit, comment, and much more.", func: () => openSidebar(iframeRef.current.contentWindow.pdfui, 'sidebar-bookmark')},
    {positionX:"250px", positionY:"120px", sideTriangle:"rigth", header:"Navigate the PDF", description:"Use the sidebar to see pages, annotations, form information, and to search the PDF.", func: () => closeSidebar(iframeRef.current.contentWindow.pdfui)},
    {positionX:"125px", positionY:"75px", sideTriangle:"top", header:"Test with your own PDF", description:"Upload a file and test our capabilities.", func: () => {}},
  ]
  
  
  const clickNext = () => {
    setCurent(curent+1)
    scens[curent].func()
  }

  const clickPrev = async() => {
    setCurent(curent-1)
    scens[curent].func()
  }

  const clickDone = () => {
    changeDone(false)
  }

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
                        {isDoneScene && <InfoModal 
                          positionX = {scens[curent].positionX} 
                          positionY =  {scens[curent].positionY} 
                          sideTriangle =  {scens[curent].sideTriangle} 
                          header= {scens[curent].header} 
                          description= {scens[curent].description} 
                          isFirst = {Boolean(curent)}
                          isLast = {scens.length-1 === curent}  
                          clickNext = {clickNext} 
                          clickPrev = {clickPrev}
                          clickDone = {clickDone}
                        />}
                        {isError ? (
                          <div className="fv-catalog-app-error">
                            <div className="fv-catalog-app-error-box">
                              <div className="fv-catalog-app-error-box-img">
                                <svg
                                  width="72"
                                  height="65"
                                  viewBox="0 0 72 65"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M0.554372 58.2447L31.8912 2.44991C33.413 -0.259598 37.3082 -0.274732 38.851 2.42286L70.7611 58.2176C72.2862 60.8843 70.3608 64.2035 67.2888 64.2035H4.04195C0.983793 64.2035 -0.943191 60.9111 0.554372 58.2447ZM38.2911 37.4611C38.2911 39.4006 36.7616 40.9785 34.8818 40.9785C33.002 40.9785 31.4728 39.4006 31.4728 37.4611V23.5348C31.4728 21.5953 33.002 20.0174 34.8818 20.0174C36.7616 20.0174 38.2911 21.5953 38.2911 23.5348V37.4611ZM38.3705 50.8367C38.3705 52.8213 36.8055 54.436 34.8822 54.436C32.9588 54.436 31.3938 52.8213 31.3938 50.8367C31.3938 48.8522 32.9588 47.2374 34.8822 47.2374C36.8055 47.2374 38.3705 48.8522 38.3705 50.8367Z"
                                    fill="#DBDBDB"
                                  />
                                </svg>
                              </div>
                              <p className="fv-catalog-app-error-box-title">
                                An error occurred while loading the pdf file.
                                Please try again.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            ref={iframeRef}
                            className="fv__catalog-app-previewer"
                            src={it.path}
                          ></iframe>
                        )}
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

import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter } from "react-router-dom";
import { examples } from "./foundation/examples";
import {InfoModal} from "./components/tooltip/Tooltip";
import { closeSidebar, openTab, createCalloutAnnotation, createCustomStamp, disableAll, hideAll, markAndRedactAStringOfText, movePage, openSidebar, rotatePage } from "./snippets/snippets"

const { Content } = Layout;



const App = () => {
  const iframeRef = useRef<any>();
  const [isError, setIsError] = useState<boolean>(false);
  const [curent, setCurent] = useState<number>(0)
  const [isDoneScene, changeDone] = useState<boolean>(true)
  const defaultScene = [
    {positionX:"75px", positionY:"75px", sideTriangle:"top", header:"Create & edit", description:"The toolbar has everything you need. Print, protect, edit, comment, and much more.", func: () => closeSidebar(iframeRef.current.contentWindow.pdfui)},
    {positionX:"250px", positionY:"120px", sideTriangle:"rigth", header:"Navigate the PDF", description:"Use the sidebar to see pages, annotations, form information, and to search the PDF.", func: () => openSidebar(iframeRef.current.contentWindow.pdfui, 'sidebar-bookmark')},
    {positionX:"125px", positionY:"75px", sideTriangle:"top", header:"Test with your own PDF", description:"Upload a file and test our capabilities.", func: () => closeSidebar(iframeRef.current.contentWindow.pdfui)},
  ]
  const [scene, setCurentScene] = useState<any>(defaultScene)
  console.log(iframeRef)
  
  useEffect(() => {
    if (iframeRef.current) {
      switch(iframeRef.current.baseURI.split("/")[iframeRef.current.baseURI.split("/").length-1]){
        case "00-hello": {
          setCurentScene(defaultScene);
          break;
        }
        case "01-annotation": {
          setCurentScene(annotation);
          
          break;
        }
        case "02-forms": {
          setCurentScene(form);
          break;
        }
        case "03-redaction": {
          setCurentScene(redaction);
          break;
        }
        case "04-advanced_forms": {
          setCurentScene(advanced_forms);
          break;
        }
      }
      iframeRef.current.onload = function () {
        
        if (iframeRef.current.contentWindow.errorLoad) {
          setIsError(true);
        } else {
          setIsError(false);
        }
        console.log(iframeRef.current.contentWindow.pdfui)
      };
      
      console.dir(iframeRef.current.baseURI.split("/")[iframeRef.current.baseURI.split("/").length-1])
      console.log(scene)
      if(iframeRef.current.contentWindow.pdfui){
        advanced_forms[1].func()}
    }
  }, [iframeRef.current]);
 

  const advanced_forms = [
    {positionX:"75px", positionY:"75px", sideTriangle:"top", header:"Directly edit PDF content", description:"Select the Edit tool to move or modify text, images, and shapes within the PDF.", func: () => closeSidebar(iframeRef.current.contentWindow.pdfui)},
    {positionX:"250px", positionY:"280px", sideTriangle:"rigth", header:"Rotate pages", description:"Right-click the page thumbnail to fix the page.", func: () => openSidebar(iframeRef.current.contentWindow.pdfui, 'sidebar-bookmark')},
    {positionX:"250px", positionY:"300px", sideTriangle:"rigth", header:"Reorder pages", description:"Click & drag pages to put pages in the right order in the Thumbnail sidebar.", func: () => {}},
  ]

  const annotation = [
    {positionX:"65px", positionY:"75px", sideTriangle:"top", header:"Add a note", description:"The ‘Note’ tool adds a note annotation to the top-left of the PDF page. You can drag-and-drop it to your desired location.", func: () => console.log("sad")},
    {positionX:"75%", positionY:"280px", sideTriangle:"rigth", header:"Leave your note", description:"Click directly in the PDF to leave a note in context.", func: () => closeSidebar(iframeRef.current.contentWindow.pdfui)},
    {positionX:"436px", positionY:"75px", sideTriangle:"top", header:"Create a callout", description:"Add a callout annotation to the page to highlight a detail or part of the document. You can freely move, resize or add text to the annotation after that.", func: () => {openSidebar(iframeRef.current.contentWindow.pdfui, 'comment-list-sidebar-panel')}},
    {positionX:"747px", positionY:"75px", sideTriangle:"top", header:"Stamp", description:"Let's create your own stamp to easily mark your pages.", func: () => {}},
    {positionX:"800px", positionY:"510px", sideTriangle:"top", header:"Create a stamp", description:"You can create your own custom stamps using the Custom Stamps option. Click on any of the stamps to add on the page", func: () => iframeRef.current.contentWindow.pdfui.prompt(location.origin + '/assets/stamp.jpg', 'Custom stamp image url').then((url:string) => {createCustomStamp(iframeRef.current.contentWindow.pdfui, url);})},
    {positionX:"75%", positionY:"300px", sideTriangle:"rigth", header:"Stamp", description:"Click to stamp anywhere on the page.", func: () => {}},
    {positionX:"935px", positionY:"75px", sideTriangle:"top", header:"Attach a link, image, video, or an entire file", description:"Keep related content together.", func: () => {}},
  ]
  

  const form = [
    {positionX:"351px", positionY:"75px", sideTriangle:"top", header:"Select what to redact", description:"Select Mark for Redaction to begin selecting text, an area, or a whole page to redact.", func: () => {}},
    {positionX:"475px", positionY:"75px", sideTriangle:"top", header:"Apply the redaction", description:"Ready to redact what you selected? Click “Apply”.", func: () => closeSidebar(iframeRef.current.contentWindow.pdfui)},
    {positionX:"565px", positionY:"75px", sideTriangle:"top", header:"Search & Redact", description:"Search for terms in the whole PDF, and choose which to redact.", func: () => {createCalloutAnnotation(iframeRef.current.contentWindow.pdfui)}},
    {positionX:"300px", positionY:"100px", sideTriangle:"rigth", header:"Search for terms", description:"Additionally, you can search a word or phrase in the document and select which instances of it you want to redact.", func: () => {openSidebar(iframeRef.current.contentWindow.pdfui, 'sidebar-search')}},
  ]
  
  const redaction = [
    {positionX:"385px", positionY:"75px", sideTriangle:"top", header:"Form builder", description:"Let’s create this form! Select the Create Text Field tool and place one in the document.", func: () => closeSidebar(iframeRef.current.contentWindow.pdfui)},
    {positionX:"430px", positionY:"75px", sideTriangle:"top", header:"Create a signature field", description:"Create a desginated space for a signature. Select the tool, then click & drag.", func: () => openSidebar(iframeRef.current.contentWindow.pdfui, 'sidebar-field')},
    {positionX:"335px", positionY:"75px", sideTriangle:"top", header:"Add more form fields", description:"Test out more types of fields! Checkboxes, radio input, dropdowns, and more await you in the toolbar.", func: () => {}},
  ]
  const clickNext = () => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent+1
      scene[newCurent].func()
      return newCurent;
    })
  }

  const clickPrev = async() => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent-1
      scene[newCurent].func()
      return newCurent;
    })
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
                          positionX = {scene[curent].positionX} 
                          positionY =  {scene[curent].positionY} 
                          sideTriangle =  {scene[curent].sideTriangle} 
                          header= {scene[curent].header} 
                          description= {scene[curent].description} 
                          isFirst = {Boolean(curent)}
                          isLast = {scene.length-1 === curent}  
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

import { Layout } from "antd";
import "antd/dist/antd.less";
import "./app.less";
import React, { useEffect, useRef, useState } from "react";
import { Switch, Route, HashRouter, useParams } from "react-router-dom";
import { examples } from "./foundation/examples";
import { InfoModal } from "./components/tooltip/Tooltip";
import { useHistory } from "react-router-dom";
import {
  closeSidebar,
  openTab,
  createCalloutAnnotation,
  createCustomStamp,
  disableAll,
  hideAll,
  markAndRedactAStringOfText,
  movePage,
  openSidebar,
  rotatePage,
} from "./snippets/snippets";

const { Content } = Layout;

const App = () => {
  const iframeRef = useRef<any>(null);
  const [curent, setCurent] = useState<number>(0);
  const [isDoneScene, changeDone] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const defaultScene = [
    {
      positionX: "75px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Create & edit",
      description:
        "The toolbar has everything you need. Print, protect, edit, comment, and much more.",
      func: () => closeSidebar(iframeRef.current.contentWindow.pdfui),
    },
    {
      positionX: "250px",
      positionY: "120px",
      sideTriangle: "rigth",
      header: "Navigate the PDF",
      description:
        "Use the sidebar to see pages, annotations, form information, and to search the PDF.",
      func: () =>
        openSidebar(iframeRef.current.contentWindow.pdfui, "sidebar-bookmark"),
    },
    {
      positionX: "125px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Test with your own PDF",
      description: "Upload a file and test our capabilities.",
      func: () => closeSidebar(iframeRef.current.contentWindow.pdfui),
    },
  ];
  const [scene, setCurentScene] = useState<any>(defaultScene);
  console.log(iframeRef);

  const advanced_forms = [
    {
      positionX: "75px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Directly edit PDF content",
      description:
        "Select the Edit tool to move or modify text, images, and shapes within the PDF.",
      func: () => closeSidebar(iframeRef.current.contentWindow.pdfui),
    },
    {
      positionX: "250px",
      positionY: "280px",
      sideTriangle: "rigth",
      header: "Rotate pages",
      description: "Right-click the page thumbnail to fix the page.",
      func: () =>
        openSidebar(iframeRef.current.contentWindow.pdfui, "sidebar-bookmark"),
    },
    {
      positionX: "250px",
      positionY: "300px",
      sideTriangle: "rigth",
      header: "Reorder pages",
      description:
        "Click & drag pages to put pages in the right order in the Thumbnail sidebar.",
      func: () => movePage(iframeRef.current.contentWindow.pdfui, 1, 0),
    },
  ];

  const annotation = [
    {
      positionX: "65px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Add a note",
      description:
        "The ‘Note’ tool adds a note annotation to the top-left of the PDF page. You can drag-and-drop it to your desired location.",
      func: () => {},
    },
    {
      positionX: "75%",
      positionY: "280px",
      sideTriangle: "rigth",
      header: "Leave your note",
      description: "Click directly in the PDF to leave a note in context.",
      func: () => closeSidebar(iframeRef.current.contentWindow.pdfui),
    },
    {
      positionX: "436px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Create a callout",
      description:
        "Add a callout annotation to the page to highlight a detail or part of the document. You can freely move, resize or add text to the annotation after that.",
      func: () => {
        openSidebar(
          iframeRef.current.contentWindow.pdfui,
          "comment-list-sidebar-panel"
        );
      },
    },
    {
      positionX: "747px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Stamp",
      description: "Let's create your own stamp to easily mark your pages.",
      func: () => {},
    },
    {
      positionX: "800px",
      positionY: "510px",
      sideTriangle: "top",
      header: "Create a stamp",
      description:
        "You can create your own custom stamps using the Custom Stamps option. Click on any of the stamps to add on the page",
      func: () =>
        iframeRef.current.contentWindow.pdfui
          .prompt("/assets/stamp.jpg", "Custom stamp image url")
          .then((url: string) => {
            createCustomStamp(iframeRef.current.contentWindow.pdfui, url);
          }),
    },
    {
      positionX: "75%",
      positionY: "300px",
      sideTriangle: "rigth",
      header: "Stamp",
      description: "Click to stamp anywhere on the page.",
      func: () => {},
    },
    {
      positionX: "935px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Attach a link, image, video, or an entire file",
      description: "Keep related content together.",
      func: () => {},
    },
  ];

  const redaction = [
    {
      positionX: "351px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Select what to redact",
      description:
        "Select Mark for Redaction to begin selecting text, an area, or a whole page to redact.",
      func: () => {},
    },
    {
      positionX: "475px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Apply the redaction",
      description: "Ready to redact what you selected? Click “Apply”.",
      func: () => closeSidebar(iframeRef.current.contentWindow.pdfui),
    },
    {
      positionX: "565px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Search & Redact",
      description:
        "Search for terms in the whole PDF, and choose which to redact.",
      func: () => {
        createCalloutAnnotation(iframeRef.current.contentWindow.pdfui);
      },
    },
    {
      positionX: "300px",
      positionY: "100px",
      sideTriangle: "rigth",
      header: "Search for terms",
      description:
        "Additionally, you can search a word or phrase in the document and select which instances of it you want to redact.",
      func: () => {
        openSidebar(iframeRef.current.contentWindow.pdfui, "sidebar-search");
      },
    },
  ];
  const form = [
    {
      positionX: "385px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Form builder",
      description:
        "Let’s create this form! Select the Create Text Field tool and place one in the document.",
      func: () => closeSidebar(iframeRef.current.contentWindow.pdfui),
    },
    {
      positionX: "430px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Create a signature field",
      description:
        "Create a desginated space for a signature. Select the tool, then click & drag.",
      func: () =>
        openSidebar(iframeRef.current.contentWindow.pdfui, "sidebar-field"),
    },
    {
      positionX: "335px",
      positionY: "75px",
      sideTriangle: "top",
      header: "Add more form fields",
      description:
        "Test out more types of fields! Checkboxes, radio input, dropdowns, and more await you in the toolbar.",
      func: () => {},
    },
  ];
  const clickNext = () => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent + 1;
      scene[newCurent].func();
      return newCurent;
    });
  };

  const clickPrev = async () => {
    setCurent((prevCurent) => {
      const newCurent = prevCurent - 1;
      scene[newCurent].func();
      return newCurent;
    });
  };

  const clickDone = () => {
    changeDone(false);
  };

  useEffect(() => {
    switch (location.hash) {
      case "#/examples/00-hello": {
        setCurentScene(defaultScene);
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
    // console.log(scene);
  }, [location.hash, iframeRef.current, isSuccess]);

  return (
    <>
      <HashRouter>
        <Layout className="fv__catalog-app">
          <Layout className="fv__catalog-app-body">
            <Layout>
              <Content>
                <Switch>
                  {examples.map((it) => {
                    console.log(it);
                    return (
                      <Route path={"/examples/" + it.baseName} key={it.name}>
                        {isDoneScene && isSuccess && (
                          <InfoModal
                            positionX={scene[curent].positionX}
                            positionY={scene[curent].positionY}
                            sideTriangle={scene[curent].sideTriangle}
                            header={scene[curent].header}
                            description={scene[curent].description}
                            isFirst={Boolean(curent)}
                            isLast={scene.length - 1 === curent}
                            clickNext={clickNext}
                            clickPrev={clickPrev}
                            clickDone={clickDone}
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
    </>
  );
};

export default App;

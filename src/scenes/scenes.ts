import { closeSidebar, openTab, createCalloutAnnotation, createCustomStamp, disableAll, hideAll, markAndRedactAStringOfText, movePage, openSidebar, rotatePage } from "../snippets/snippets"


 export const scens = (el:any) => { 
     return (
    [
        {positionX:"75px", positionY:"75px", sideTriangle:"top", header:"Create & edit", description:"The toolbar has everything you need. Print, protect, edit, comment, and much more.", func: () => openSidebar(el, 'sidebar-bookmark')},
        {positionX:"250px", positionY:"120px", sideTriangle:"rigth", header:"Navigate the PDF", description:"Use the sidebar to see pages, annotations, form information, and to search the PDF.", func: () => openSidebar(el, 'sidebar-bookmark')},
        {positionX:"125px", positionY:"75px", sideTriangle:"top", header:"Test with your own PDF", description:"Upload a file and test our capabilities.", func: () => {closeSidebar(el)}},
    ])
}
  
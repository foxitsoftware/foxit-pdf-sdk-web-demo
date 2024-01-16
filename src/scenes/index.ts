import {
  closeSidebar,
  openSidebar,
  openSidebarRightTab,
  closeSidebarRightTab,
  openDropdown,
  closeDropdown,
  openStampDropdown,
  openProtectDropdown
} from "../snippets";

const hello = [
  {
    positionX: "75px",
    positionY: "75px",
    elementName: "snapshot-button",
    sideTriangle: "top",
    header: "Create & edit",
    description: "Create & edit description",
    func: (ref: any) => closeSidebar(ref.current.contentWindow.pdfui),
  },
  {
    positionX: "250px",
    positionY: "120px",
    elementName: "sidebar-bookmark",
    sideTriangle: "left",
    header: "Navigate the PDF",
    description: "Navigate the PDF description",
    func: (ref: any) =>
      openSidebar(ref.current.contentWindow.pdfui, "sidebar-bookmark"),
  },
  {
    positionX: "125px",
    positionY: "75px",
    elementName: "open-file-button-list",
    sideTriangle: "top",
    header: "Test with your own PDF",
    description: "Test with your own PDF description",
    func: (ref: any) => closeSidebar(ref.current.contentWindow.pdfui),
  },
  {
    positionX: "125px",
    positionY: "75px",
    elementName:"print-button",
    sideTriangle: "top",
    header: "Print your PDF",
    description: "Print your PDF description",
    func: (ref: any) => closeSidebar(ref.current.contentWindow.pdfui),
  },
];

const editPdf = [
  {
    positionX: "115px",
    positionY: "90px",
    sideTriangle: "top-custom",
    elementName: "edit-object-ribbon-dropdown",
    header: "Directly edit PDF content",
    description: "Directly edit PDF content description",
    func: (ref: any) => closeSidebar(ref.current.contentWindow.pdfui),
  },
  {
    positionX: "250px",
    positionY: "280px",
    sideTriangle: "left",
    header: "Rotate pages",
    description: "Rotate pages description",
    func: (ref: any) =>
      openSidebar(
        ref.current.contentWindow.pdfui,
        "sidebar-thumbnail-panel"
      ).then(() => {
        ref.current.contentWindow.__example__.rotatePage();
      }),
  },
  {
    positionX: "250px",
    positionY: "300px",
    sideTriangle: "left",
    header: "Reorder pages",
    description: "Reorder pages description",
    func: (ref: any) => {
      ref.current.contentWindow.__example__.movePage( 1, 0)
      ref.current.contentWindow.__example__.switchToHandStateHandler()
    },
  },
  {
    positionX: "250px",
    positionY: "500px",
    sideTriangle: "left",
    header: "Crop pages",
    description: "Crop pages description",
    func: (ref: any) => {
      ref.current.contentWindow.__example__.cropPage();
    },
  },
];

const annotation = [
  {
    positionX: "65px",
    positionY: "75px",
    elementName: "create-text",
    sideTriangle: "top",
    header: "Add a note",
    description: "Add a note description",
    func: (ref: any) => {
      closeSidebarRightTab(ref.current.contentWindow.pdfui);
      closeSidebar(ref.current.contentWindow.pdfui);
    },
  },
  {
    positionX:'42%',
    positionY: "185px",
    sideTriangle: "left-custom",
    asyncLoadToolTip:true,
    elementClassName:"fv__pdf-page-note-annot-container",
    elementIndex:1,
    header: "Leave your note",
    description: "Leave your note description",
    func: (ref: any) => {
      openSidebar(ref.current.contentWindow.pdfui,"comment-list-sidebar-panel");
      openSidebarRightTab(ref.current.contentWindow.pdfui, 'edit-properties-panel',9);
      ref.current.contentWindow.__example__.createTextNoteAnnotationAt(30, 30);
    },
  },
  {
    positionX:'42%',
    positionY: "185px",
    sideTriangle: "right",
    elementName:"sidebar-right-tabs",
    header: "Format your note",
    description: "Format your note description",
    func: (ref: any) => {
      closeSidebar(ref.current.contentWindow.pdfui);
      openSidebarRightTab(ref.current.contentWindow.pdfui, 'edit-properties-panel',9);
    },
  },
  {
    positionX: "436px",
    positionY: "75px",
    elementName: "freetext-callout",
    sideTriangle: "top",
    header: "Create a callout",
    description: "Create a callout description",
    func: (ref: any) => {
      openSidebar(
        ref.current.contentWindow.pdfui,
        "comment-list-sidebar-panel"
      ).then(() => {
        closeSidebarRightTab(ref.current.contentWindow.pdfui);
        ref.current.contentWindow.__example__.createCalloutAnnotation();
      });
    },
  },
  {
    positionX: "747px",
    positionY: "75px",
    offsetX:0,
    offsetY:50,
    elementName: "stamp-drop-down-ui",
    sideTriangle: "top",
    header: "Stamp",
    description: "Stamp description",
    func: () => {},
  },
  {
    positionX: "800px",
    positionY: "510px",
    elementName: "create-stamp-button-list",
    sideTriangle: "right",
    header: "Create a stamp",
    description: "Create a stamp description",
    func: (ref: any) => openStampDropdown(ref.current.contentWindow.pdfui),
  },
];

const measurement = [
  {
    positionX: "65px",
    positionY: "75px",
    elementName: "create-measurement-button-list",
    sideTriangle: "top",
    header: "Measurement",
    description: "Measurement list description",
    func: (ref:any) => {
      closeSidebarRightTab(ref.current.contentWindow.pdfui);
      closeDropdown(ref.current.contentWindow.pdfui,"create-measurement-button-list");
    }
  },
  {
    positionX: "65px",
    positionY: "75px",
    elementName: "create-perimeter-btn",
    sideTriangle: "right",
    header: "Measurement",
    description: "Measurement description",
    func: (ref:any) => {
      openSidebarRightTab(ref.current.contentWindow.pdfui,'edit-properties-panel',7);
      openDropdown(ref.current.contentWindow.pdfui,"create-measurement-button-list");
    }
  },
]

const redaction = [
  {
    positionX: "85px",
    positionY: "90px",
    elementName: "create-redaction-controllers",
    sideTriangle: "top",
    header: "Select what to redact",
    description: "Select what to redact description",
    func: () => {},
  },
  {
    positionX: "475px",
    positionY: "75px",
    elementName: "redaction-apply",
    sideTriangle: "top",
    header: "Apply the redaction",
    description: "Apply the redaction description",
    func: () => {},
  },
  {
    positionX: "565px",
    positionY: "75px",
    elementName: "redaction-search",
    sideTriangle: "top",
    header: "Search & Redact",
    description: "Search & Redact description",
    func: (ref:any) => {
      ref.current.contentWindow.__example__.closeSidebarRight();
      ref.current.contentWindow.__example__.unActiveAnnot();
    },
  },
  {
    positionX: "300px",
    positionY: "550px",
    elementName: "advanced-search",
    sideTriangle: "right-bottom",
    header: "Search for terms",
    description: "Search for terms description",
    func: (ref: any) => {
      ref.current.contentWindow.__example__.redactionSearch();
    },
  },
];
const minBtnOffset = 10;
const form = [
  {
    positionX: "265px",
    positionY: "75px",
    offsetX:minBtnOffset,
    offsetY:minBtnOffset,
    elementName: "fv--form-designer-create-text-btn",
    sideTriangle: "top",
    header: "Form builder",
    description: "Form builder description",
    func: (ref: any) => closeSidebar(ref.current.contentWindow.pdfui),
  },
  {
    positionX: "375px",
    positionY: "75px",
    offsetX:minBtnOffset,
    offsetY:minBtnOffset,
    elementName: "fv--form-designer-create-sign-btn",
    sideTriangle: "top",
    header: "Create a signature field",
    description: "Create a signature field description",
    func: (ref: any) =>
      openSidebar(ref.current.contentWindow.pdfui, "sidebar-field"),
  },
  {
    positionX: "335px",
    positionY: "75px",
    offsetX:minBtnOffset,
    offsetY:minBtnOffset,
    sideTriangle: "top",
    elementName: "fv--form-designer-create-list-box-btn",
    header: "Add more form fields",
    description: "Add more form fields description",
    func: () => {},
  },
];

const digital_signature = [
  {
    positionX: "18px",
    positionY: "105px",
    elementName: "protect-tab-group-sign",
    sideTriangle: "top",
    header: "Create a signature",
    description: "Create a signature description",
    func: (ref: any) => closeSidebar(ref.current.contentWindow.pdfui),
  },
  {
    positionX: "70%",
    positionY: "70%",
    sideTriangle: "left",
    header: "Insert your signature",
    description: "Insert your signature description",
    func: (ref: any) =>
      openSidebar(ref.current.contentWindow.pdfui, "sidebar-field")
      .then(() => {
        const el = document.querySelector('.wrapBlock-flex') as HTMLElement;
        el.style.display = 'none'
        const contentWindow = ref.current.contentWindow;
        const off = contentWindow.pdfui.addViewerEventListener('inkSign-added', function () {
            el.style.display = 'flex';
            off();
        });
        contentWindow.__example__.openSignDialog()
      }),
  },
  {
    positionX: "325px",
    positionY: "145px",
    sideTriangle: "top-custom",
    elementName: "password-protect-btn",
    header: "Protect your PDF",
    description: "Protect your PDF description",
    func: (ref: any) => {
      openProtectDropdown(ref.current.contentWindow.pdfui);
    },
  },
];

const search = [
  {
    positionX: "300px",
    positionY: "170px",
    elementName: "advanced-search",
    sideTriangle: "right-custom",
    header: "Search PDF text",
    description: "Search PDF text description",
    func: () => {},
  }
];

export {
  hello,
  editPdf,
  redaction,
  form,
  annotation,
  digital_signature,
  search,
  measurement,
};

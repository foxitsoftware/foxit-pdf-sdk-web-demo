import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI, initTab } from '../../common/pdfui';

const pdfui = createPDFUI({});
initTab(pdfui,{
  menuTabName: "form-tab",
  group:[
    {
      groupTabName: "form-tab-group-fields",
      groupTabIndex:2,
      retainCount: 100
    }
  ]
});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      //Default PDF file path
      url: "/assets/5-feature-example_forms.pdf",
    },
  },
  { fileName: "5-feature-example_forms.pdf" }
);
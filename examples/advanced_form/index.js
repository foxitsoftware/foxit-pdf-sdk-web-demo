import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import "./index.css";
import { createPDFUI } from '../../common/pdfui';

const pdfui = createPDFUI({});

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/Advanced_form.pdf",
    },
  },
  { fileName: "Advanced_form.pdf" }
);

import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const pdfui = createPDFUI({});

export function exportData() {
  return pdfui.getCurrentPDFDoc().then(doc => {
      return doc.exportFormToFile(1).then(xfdf => {
          const url = URL.createObjectURL(xfdf);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'form.xfdf';
          a.rel = 'noopener';
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
      })
  })
}

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/Advanced_form.pdf?",
    },
  },
  { fileName: "Advanced_form.pdf" }
);

import { loadPDFUI } from "../../common/pdfui";

loadPDFUI()
  .then((pdfui) => {
    pdfui.openPDFByHttpRangeRequest(
      {
        range: {
          url: "/assets/FoxitPDFSDKforWeb_DemoGuide.pdf",
        },
      },
      { fileName: "FoxitPDFSDKforWeb_DemoGuide.pdf" }
    );
    window.errorLoad = false;
  })
  .catch((e) => {
    console.log(e, "errror");
    window.errorLoad = true;
  });

# Conversion
Converting PDF files to MS office suite formats while maintaining the layout and format of your original documents.

# Web Demo
You can explore the functionality in our [showcase](https://webviewer-examples.com/#/conversion)

# Read All About It
It is necessary for conversion demo to initialize Foxit PDF Conversion SDK using a license before calling any APIs. Please contact Foxit support team or sales team to get license files for Foxit PDF Conversion SDK. To use conversion, you need to replace licenseSN and licenseKey located in PDFToOfficeService/src/conversionSdk/pdfToOffice.js file.

```js
const initConversionSdk = async () => {
  const licenseSN = "";
  const licenseKey= "";
  var error_code = Library.Initialize(licenseSN, licenseKey);
  if (ErrorCode.e_ErrSuccess != error_code) {
    if (ErrorCode.e_ErrInvalidLicense == error_code)
      console.log("[Failed] Current used Foxit PDF Conversion SDK key information is invalid.");
    else
      console.log("Library Initialize Error: %d", error_code);
    return;
  }
}
```
For more information, you can visit the 
[How convert PDF to word, powerpoint and excel using nodejs](https://developers.foxit.com/developer-hub/document/convert-pdf-word-powerpoint-excel-using-node-js)


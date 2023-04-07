let {
  ErrorCode,
  State,
  Library,
  PDF2OfficeSettingData,
  ConvertCallback,
  PDF2Office } = require("@foxitsoftware/foxit-pdf-conversion-sdk-node");
const axios = require("axios");
class CustomConvertCallback extends ConvertCallback {
  NeedToPause() {
    return true;
  }

  ProgressNotify(converted_count, total_count) {

  }
}
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
let custom_callback = new CustomConvertCallback();

module.exports = {
  initConversionSdk,
  PDF2Office,
  PDF2OfficeSettingData,
  custom_callback,
  State,
  ErrorCode
}
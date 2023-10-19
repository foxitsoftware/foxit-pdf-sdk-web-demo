const {
  ErrorCode,
  State,
  Library,
  PDF2OfficeSettingData,
  PDF2WordSettingData,
  Range,
  ConvertCallback,
  PDF2Office,
} = require('@foxitsoftware/foxit-pdf-conversion-sdk-node');
const path = require('path');
const { getLicense } = require('./license-service');

class CustomConvertCallback extends ConvertCallback {
  NeedToPause() {
    return true;
  }

  ProgressNotify(converted_count, total_count) {
    console.log(`progress notify: ${converted_count}/${total_count}`);
    // send progress to parent process
    process.send(
      JSON.stringify({
        status: 'running',
        progress: `${converted_count}/${total_count}`,
        percentage: (converted_count / total_count) * 100,
      }),
    );
  }
}

const initConversionSdk = async () => {
  const { licenseSN, licenseKey } = await getLicense();
  const error_code = Library.Initialize(licenseSN, licenseKey);

  if (ErrorCode.e_ErrSuccess !== error_code) {
    if (ErrorCode.e_ErrInvalidLicense === error_code) {
      console.log('[Failed] Current used Foxit PDF Conversion SDK key information is invalid.');
    } else {
      console.log(`Library initialize error With error code: ${error_code}`);
    }
    throw new Error(`Library initialize error With error code: ${error_code}`);
  }
};

// a map from conversion type to conversion config
const conversionTypeMap = {
  200: {
    type: 200,
    fileExtension: 'docx',
    fileType: 'Word',
    method: 'StartConvertToWordWithPath',
  },
  201: {
    type: 201,
    fileExtension: 'xlsx',
    fileType: 'Excel',
    method: 'StartConvertToExcelWithPath',
  },
  202: {
    type: 202,
    fileExtension: 'pptx',
    fileType: 'PPT',
    method: 'StartConvertToPowerPointWithPath',
  },
};

const errorMsgMap = {
  [ErrorCode.e_ErrUnsupported]: 'Some types are not supported.',
  [ErrorCode.e_ErrPassword]: 'Invalid password.',
  [ErrorCode.e_ErrCertificate]: 'Certificate error.',
  [ErrorCode.e_ErrOutOfMemory]: 'Out-of-memory error occurs.',
  [ErrorCode.e_ErrParam]: 'Parameter error.',
};

function getErrorMsg(e) {
  const errorMsg = JSON.parse(e.message);
  return errorMsgMap[errorMsg.code] || 'Unknown conversion error.';
}

let conversionSDKInitialized = false;

const getFileExtensionByConvertType = (convertType) => {
  return conversionTypeMap[convertType].fileExtension;
};

async function convert(
  src_pdf_path,
  saved_file_path,
  password,
  convertType,
  enable_ml_recognition,
) {
  if (!conversionSDKInitialized) {
    await initConversionSdk();
    conversionSDKInitialized = true;
  }

  const convertConfig = conversionTypeMap[convertType];
  if (!convertConfig) {
    throw new Error(`convert types ${convertType} are not supported.`);
  }

  const custom_callback = new CustomConvertCallback();
  const enable_retain_page_layout = false;
  const word_setting_data = new PDF2WordSettingData(enable_retain_page_layout);
  const range = new Range();
  const metrics_data_folder_path = path.join(__dirname, 'metrics_data');
  const include_pdf_comments = true;

  const setting_data = new PDF2OfficeSettingData(
    metrics_data_folder_path,
    enable_ml_recognition,
    range,
    include_pdf_comments,
    word_setting_data,
  );
  console.log('conversion setting data', setting_data);
  try {
    let progressive = PDF2Office[convertConfig.method](
      src_pdf_path,
      password,
      saved_file_path,
      setting_data,
      custom_callback,
    );

    if (progressive.GetRateOfProgress() !== 100) {
      let state = State.e_ToBeContinued;
      while (State.e_ToBeContinued === state) {
        state = progressive.Continue();
      }
    }
  } catch (e) {
    console.log(e);
    throw new Error(getErrorMsg(e));
  }
}

module.exports = {
  convert,
  getFileExtensionByConvertType,
};

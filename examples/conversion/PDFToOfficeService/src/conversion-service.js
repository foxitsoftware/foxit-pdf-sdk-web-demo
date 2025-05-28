const {
  ErrorCode,
  State,
  Library,
  PDF2OfficeSettingData,
  PDF2WordSettingData,
  PDF2PowerPointSettingData,
  PDF2ExcelSettingData,
  WorkbookSettings,
  Range,
  ConvertCallback,
  PDF2Office,
  Word2PDFSettingData,
  Excel2PDFSettingData,
  Office2PDFSettingData,
  Office2PDF,
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
  203: {
    type: 203,
    fileExtension: 'pdf',
    fileType: 'PDF',
    method: 'ConvertFromWordWithPath',
  },
  204: {
    type: 204,
    fileExtension: 'pdf',
    fileType: 'PDF',
    method: 'ConvertFromExcelWithPath',
  },
  205: {
    type: 205,
    fileExtension: 'pdf',
    fileType: 'PDF',
    method: 'ConvertFromPowerPointWithPath',
  },
};

const errorMsgMap = {
  [ErrorCode.e_ErrUnsupported]: 'Some types are not supported.',
  [ErrorCode.e_ErrSecurityHandler]: 'Some types are not supported.',
  [ErrorCode.e_ErrPassword]: 'Invalid password.',
  [ErrorCode.e_ErrCertificate]: 'The demo does not support PDF encrypted with certificate.',
  [ErrorCode.e_ErrOutOfMemory]: 'Out-of-memory error occurs.',
  [ErrorCode.e_ErrParam]: 'Parameter error.',
  [ErrorCode.e_ErrFile]: 'The file is damaged or some types are not supported.',
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
  params,
) {
  if (!conversionSDKInitialized) {
    await initConversionSdk();
    conversionSDKInitialized = true;
  }

  const convertConfig = conversionTypeMap[convertType];
  if (!convertConfig) {
    throw new Error(`convert types ${convertType} are not supported.`);
  }

  if (convertType === 200 || convertType === 201 || convertType === 202) {
    const custom_callback = new CustomConvertCallback();
    const enable_retain_page_layout = params.pdf2office.pdf2word.enable_retain_page_layout;
    const enable_generate_headers_and_footers = false;
    const enable_generate_footnotes_and_endnotes = false;
    const enable_generate_page_rendered_break = false;
    const word_setting_data = new PDF2WordSettingData(enable_retain_page_layout, enable_generate_headers_and_footers, enable_generate_footnotes_and_endnotes, enable_generate_page_rendered_break);
    const enable_aggressively_split_sections = false;
    const powerpoint_setting_data = new PDF2PowerPointSettingData(enable_aggressively_split_sections);
    const decimal_symbol = "";
    const thousands_separator = "";
    const workbook_settings = params.pdf2office.pdf2excel.workbook_settings;
    const excel_setting_data = new PDF2ExcelSettingData(decimal_symbol, thousands_separator, workbook_settings);
    const range = new Range();
    const metrics_data_folder_path = path.join(__dirname, 'metrics_data');
    const include_pdf_comments = params.pdf2office.include_pdf_comments;
    const enable_trailing_space = true;
    const include_images = params.pdf2office.include_images;
    const enable_ml_recognition = params.pdf2office.enable_ml_recognition;

    const setting_data = new PDF2OfficeSettingData(
      metrics_data_folder_path,
      enable_ml_recognition,
      range,
      include_pdf_comments,
      word_setting_data,
      powerpoint_setting_data,
      excel_setting_data, 
      enable_trailing_space, 
      include_images
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
  } else if (convertType === 203 || convertType === 204 || convertType === 205) {
    try {
      const resource_data_folder_path = path.join(__dirname, 'office2pdf');
      const is_embed_font = params.office2pdf.is_embed_font;
      const is_generate_bookmark = params.office2pdf.word2pdf.is_generate_bookmark;
      const word_setting_data = new Word2PDFSettingData(is_generate_bookmark);
      const is_separate_workbook  = params.office2pdf.excel2pdf.is_separate_workbook;
      const is_output_hidden_worksheets = params.office2pdf.excel2pdf.is_output_hidden_worksheets;
      const worksheet_names = params.office2pdf.excel2pdf.worksheet_names;
      const excel_setting_data = new Excel2PDFSettingData(is_separate_workbook, is_output_hidden_worksheets, worksheet_names);
      const setting_data = new Office2PDFSettingData(resource_data_folder_path, is_embed_font, word_setting_data, excel_setting_data);
      var ret = Office2PDF[convertConfig.method](src_pdf_path, password, saved_file_path, setting_data);
      if (!ret) {
        throw new Error('Convert from office to PDF failed.');
      }
    } catch (e) {
      console.log(e);
      throw new Error(getErrorMsg(e));
    }
  }
}

module.exports = {
  convert,
  getFileExtensionByConvertType,
};

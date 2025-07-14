//@ts-nocheck
import {
  Button,
  Card,
  Space,
  Upload,
  Col,
  Row,
  Spin,
  Checkbox,
  message,
  Modal,
  Input,
  Divider,
  Radio,
} from "antd";
import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { serverUrl } from "./config";
import dark_icon_open_26 from "assets/icon/dark_open_26.svg";
import icon_pdf_48 from "assets/icon/file_pdf_32.svg";
import dark_icon_word_26 from "assets/icon/dark_file_word_26.svg";
import dark_icon_excel_26 from "assets/icon/dark_file_excel_26.svg";
import dark_icon_ppt_26 from "assets/icon/dark_file_ppt_26.svg";
import icon_word_32 from "assets/icon/file_word_32.svg";
import icon_excel_32 from "assets/icon/file_excel_32.svg";
import icon_ppt_32 from "assets/icon/file_ppt_32.svg";
import dark_icon_save_26 from "assets/icon/dark_save_26.svg";

const { Meta } = Card;
const baseUrl = serverUrl;
const download = (url, fileName) => {
  const x = new window.XMLHttpRequest();
  x.open("GET", url, true);
  x.responseType = "blob";
  x.onload = () => {
    const url = window.URL.createObjectURL(x.response);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };
  x.send();
};

// limit file size to 40MB
const UPLOAD_FILE_SIZE_LIMIT_MB = 40;

export default () => {
  const { t } = useTranslation("translation", { keyPrefix: "Conversion" });
  const [isConvertLoading, setIsConvertLoading] = useState(false);
  const [upload, setUpload] = useState(true);
  const [filename, setFilename] = useState(null);
  const [convert, setConvert] = useState(false);
  const [convertedFilename, setConvertedFilename] = useState(null);
  const [convertType, setConvertType] = useState();
  const [docidUpload, setDocidUpload] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [convertloadLoading, setConvertloadLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [progress, setProgress] = useState(null);
  const [password, setPassword] = useState("");
  const [showUpload, setshowUpload] = useState(true);
  const [settings, setSettings] = useState({
    UseAIRecognize: false,
    page_range: '',
    include_pdf_comments: true,
    include_images: true,
    enable_retain_page_layout: false,
    workbook_settings: 2, // 0: SeparateWorkbook 1: EachTable, 2: EachPage,  
    is_embed_font: false,
    is_generate_bookmark: false,
    is_separate_workbook: false,
    is_output_hidden_worksheets: false,
    worksheet_names: '',
  });

  useEffect(() => {
    console.log("settings changed", settings);
  }, [settings]);

  const pdf2OfficeCards = [
    {
      title: t("PDF To Word"),
      description: t("Convert PDF to Word documents"),
      convertType: 200,
    },
    {
      title: t("PDF To Excel"),
      description: t("Convert PDF to Excel documents"),
      convertType: 201,
    },
    {
      title: t("PDF To PowerPoint"),
      description: t("Convert PDF to PowerPoint"),
      convertType: 202,
    },
  ];

  const office2PDFCards = [
    {
      title: t("Word To PDF"),
      description: t("Convert Word to PDF documents"),
      convertType: 203,
    },
    {
      title: t("Excel To PDF"),
      description: t("Convert Excel to PDF documents"),
      convertType: 204,
    },
    {
      title: t("PowerPoint To PDF"),
      description: t("Convert PowerPoint to PDF documents"),
      convertType: 205,
    },
  ];

  const getTaskStatus = (taskId) => {
    axios
      .post(`${baseUrl}/api/convert/status`, {
        taskId,
      })
      .then((response) => {
        if (response.data.code === 200) {
          const taskInfo = response.data.data;
          if (taskInfo.status === "running") {
            setProgress(taskInfo.progress);
            return;
          }
          if (taskInfo.status === "error") {
            if (taskInfo.error === "Invalid password.") {
              if (password == "") {
                setPasswordVisible(true);
              } else {
                message.error(t("Password error"));
              }
            } else {
              message.error(taskInfo.error);
            }
          }
          if (taskInfo.status === "finished") {
            setDownloadUrl(taskId);
          }
          setConvertloadLoading(false);
          setIsConvertLoading(false);
          stopPollingForTaskStatus();
        }
      });
  };

  let interval = null;
  const pollForTaskStatus = (taskId) => {
    interval = setInterval(() => {
      getTaskStatus(taskId);
    }, 3000);
  };

  const stopPollingForTaskStatus = () => {
    if (interval) {
      clearInterval(interval);
    }
  };

  const onConvert = () => {
    setProgress(null);
    setConvertloadLoading(true);
    setIsConvertLoading(true);
    setDownloadLoading(false);

    let data = {
      docId: docidUpload,
      type: convertType,
      password,
      ...settings,
    };

    let url = `${baseUrl}/api/convert`;
    axios
      .post(url, data)
      .then((response) => {
        if (response.data.code === 200) {
          pollForTaskStatus(response.data.data.url);
        }
      })
      .catch(() => {
        message.error(t("Convert failed"));
        setConvertloadLoading(false);
        setIsConvertLoading(false);
      });
    let c = /(.*)\.\w+/;
    let last =
      [11, 200].indexOf(convertType) !== -1
        ? ".docx"
        : [14, 201].indexOf(convertType) !== -1
          ? ".xlsx"
          : [16, 202].indexOf(convertType) !== -1
            ? ".pptx"
            : ".pdf";
    setConvertedFilename(c.exec(filename)[1] + last);
  };

  async function onDownload() {
    setDownloadLoading(true);
    let suffix;
    if (convertType === 200) {
      suffix = "docx";
    } else if (convertType === 201) {
      suffix = "xlsx";
    } else if (convertType === 202) {
      suffix = "pptx";
    } else if (convertType === 203 || convertType === 204 || convertType === 205) {
      suffix = "pdf";
    }
    // let date = getDateDirName();
    // let saved_file_path = `fileOutput/${date}/${downloadUrl}.${suffix}`;
    let url = `${serverUrl}/${downloadUrl}`;
    let c = /(.*)\.\w+/;
    let fileName = c.exec(filename)[1] + `.${suffix}`;
    await download(url, fileName);
    setTimeout(() => {
      setDownloadLoading(false);
    }, 3000);
  }

  const onChangeAITable = (e) => {
    setAITableChecked(e.target.checked);
    setDownloadUrl(null);
  };

  const onRemoveIcon = () => {
    stopPollingForTaskStatus();
    //setConvertType(200);
  };
  const submitPassword = () => {
    if (password === "") {
      message.error(t("Please enter password"));
      return;
    }
    onConvert();
    setPasswordVisible(false);
    setPassword("");
  };
  const cancel = () => {
    setPasswordVisible(false);
  };
  const handleChange = (e) => {
    setPassword(e.target.value);
  };



  return (
    <>
      <Spin
        tip={`${t("Converting...")} ${progress || ""}`}
        spinning={isConvertLoading}
        size={"large"}
      >
        <Space direction="vertical">
          <Divider className="title">PDF to Office</Divider>
          <div className="settings-common">
            <div>{t("General Settings")}：</div>
            <Checkbox
              checked={settings.UseAIRecognize}
              onChange={e => setSettings({ ...settings, UseAIRecognize: e.target.checked })}
            >{t("Enable AI Recognition")}</Checkbox>
            <Checkbox
              checked={settings.include_pdf_comments}
              onChange={e => setSettings({ ...settings, include_pdf_comments: e.target.checked })}
            >{t("Retain PDF Comments")}</Checkbox>
            <Checkbox
              checked={settings.include_images}
              onChange={e => setSettings({ ...settings, include_images: e.target.checked })}
            >{t("Retain PDF Images")}</Checkbox>
            <div>
              <span>{t("Page Range")}：</span>
              <Input
                style={{ width: "200px" }}
                placeholder={t("e.g., 1-3,5,7-10")}
                value={settings.page_range}
                onChange={e => setSettings({ ...settings, page_range: e.target.value })}
                size="small"
              />
            </div>
          </div>
          <Row gutter={16}>
            {pdf2OfficeCards.map((it, index) => {
              return (
                <Col key={index} span={8}>
                  <Card
                    className={convertType === it.convertType ? "clicked" : ""}
                    size="small"
                    hoverable
                    onClick={() => {
                      setshowUpload(false);
                      setUpload(true);
                      setConvert(false);
                      setDocidUpload(null);
                      stopPollingForTaskStatus();
                      setConvertType(it.convertType);
                      setDownloadUrl(null);
                    }}
                  >
                    <div className="title">{it.title}</div>
                    <div>{it.description}</div>
                    <div className="settings-warp">
                      {it.convertType === 200 ? <>
                        <Checkbox
                          checked={settings.enable_retain_page_layout}
                          onChange={e => setSettings({ ...settings, enable_retain_page_layout: e.target.checked })}
                        >{t("Retain PDF Page Layout")}</Checkbox>
                      </> : null}
                      {it.convertType === 201 ? <>
                        <div>{t("Workbook Structure Settings")}：</div>
                        <Radio.Group
                          value={settings.workbook_settings}
                          onChange={e => setSettings({ ...settings, workbook_settings: e.target.value })}
                        >
                          <Space direction="vertical" align="start">
                            <Radio value={0}>{t("Single Worksheet")}</Radio>
                            <Radio value={1}>{t("Each Table Worksheet")}</Radio>
                            <Radio value={2}>{t("Each Page Worksheet")}</Radio>
                          </Space>
                        </Radio.Group>
                      </> : null}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Divider className="title">Office to PDF</Divider>
          <div className="settings-common">
            <div>{t("General Settings")}：</div>
            <Checkbox
              checked={settings.is_embed_font}
              onChange={e => setSettings({ ...settings, is_embed_font: e.target.checked })}
            >{t("Embed Fonts in PDF")}</Checkbox>
          </div>
          <Row gutter={16}>
            {office2PDFCards.map((it, index) => {
              return (
                <Col key={index} span={8}>
                  <Card
                    className={convertType === it.convertType ? "clicked" : ""}
                    size="small"
                    hoverable
                    onClick={() => {
                      setshowUpload(false);
                      setUpload(true);
                      setConvert(false);
                      setDocidUpload(null);
                      stopPollingForTaskStatus();
                      setConvertType(it.convertType);
                      setDownloadUrl(null);
                    }}
                  >
                    <div className="title">{it.title}</div>
                    <div>{it.description}</div>
                    <div className="settings-warp">
                      {it.convertType === 203 ? <>
                        <Checkbox
                          checked={settings.is_generate_bookmark}
                          onChange={e => setSettings({ ...settings, is_generate_bookmark: e.target.checked })}
                        >{t("Generate PDF Bookmarks")}</Checkbox>
                      </> : null}
                      {it.convertType === 204 ? <>
                        <Space direction="vertical" align="start">
                          {/*
                          <Checkbox
                            checked={settings.is_separate_workbook}
                            onChange={e => setSettings({ ...settings, is_separate_workbook: e.target.checked })}
                          >{t("Separate Workbook PDF")}</Checkbox>
                          */}
                          <Checkbox
                            checked={settings.is_output_hidden_worksheets}
                            onChange={e => setSettings({ ...settings, is_output_hidden_worksheets: e.target.checked })}
                          >{t("Include Hidden Worksheets")}</Checkbox>
                          <Input
                            style={{ width: "295px" }}
                            placeholder={t("Specific Worksheet Names")}
                            value={settings.worksheet_names}
                            onChange={e => setSettings({ ...settings, worksheet_names: e.target.value })}
                            size="small"
                          />
                        </Space>
                      </> : null}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
          <Space direction="vertical" className="tools-main-content-content">
            <Upload
              listType="picture"
              iconRender={() => <img alt="pdf" src={icon_pdf_48} />}
              action={`${baseUrl}/api/upload`}
              accept={convertType === 203 ? ".docx" : convertType === 204 ? ".xlsx" : convertType === 205 ? ".pptx" : ".pdf"}
              beforeUpload={(file: RcFile) => {
                const exceededSizeLimit =
                  file.size / 1024 / 1024 > UPLOAD_FILE_SIZE_LIMIT_MB;
                if (exceededSizeLimit) {
                  message.error(
                    t("uploadFileSizeLimit", { UPLOAD_FILE_SIZE_LIMIT_MB })
                  );
                  file.status = "error";
                  return false;
                }
                const file_extension = file.name.split('.').pop().toLowerCase();
                if (file_extension != 'pdf' && file_extension != 'docx' && file_extension != 'xlsx' && file_extension != 'pptx') {
                  message.error(
                    t("uploadFileFormatError")
                  );
                  file.status = "error";
                  return false;
                }
                if (!convertType) {
                  message.error(t("uploadTypeError"));
                  file.status = "error";
                  return false;
                }
                return true;
              }}
              onChange={(info) => {
                // console.log(info);
                setshowUpload(true);
                if (info.file.status === "done") {
                  setUpload(false);
                  setFilename(info.file.name);
                  setConvert(true);
                  setDocidUpload(info.file.response.docId);
                }
                if (info.fileList.length === 0) {
                  setUpload(true);
                  setConvert(false);
                  setDocidUpload(null);
                  setDownloadUrl(null);
                }
              }}
              maxCount={1}
              progress={{
                strokeColor: {
                  "0%": "#108ee9",
                  "100%": "#87d068",
                },
                strokeWidth: 5,
                format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
              }}
              showUploadList={showUpload}
              onRemove={onRemoveIcon}
            >
              {upload ? (
                <Button
                  size="large"
                  shape="round"
                  icon={<img src={dark_icon_open_26} alt="open" />}
                  type="primary"
                >
                  {t("Upload")}
                </Button>
              ) : null}
            </Upload>
            {convert && !downloadUrl ? (
              <Button
                size="large"
                shape="round"
                type="primary"
                onClick={onConvert}
                loading={convertloadLoading}
                disabled={convertloadLoading}
              >
                {[11, 200].indexOf(convertType) !== -1 ? (
                  <>
                    <img alt="word" src={dark_icon_word_26} />
                    {t("Convert to Word")}
                  </>
                ) : [14, 201].indexOf(convertType) !== -1 ? (
                  <>
                    <img alt="excel" src={dark_icon_excel_26} />
                    {t("Convert to Excel")}
                  </>
                ) : [16, 202].indexOf(convertType) !== -1 ? (
                  <>
                    <img alt="ppt" src={dark_icon_ppt_26} />
                    {t("Convert to PPT")}
                  </>
                ) : [17, 203].indexOf(convertType) !== -1 ? (
                  <>
                    <img alt="pdf" src={icon_pdf_48} />
                    {t("Convert Word to PDF")}
                  </>
                ) : [18, 204].indexOf(convertType) !== -1 ? (
                  <>
                    <img alt="pdf" src={icon_pdf_48} />
                    {t("Convert Excel to PDF")}
                  </>
                ) : (
                  <>
                    <img alt="pdf" src={icon_pdf_48} />
                    {t("Convert PowerPoint to PDF")}
                  </>
                )}
              </Button>
            ) : null}
            {!convertloadLoading && downloadUrl ? (
              <Upload
                iconRender={() =>
                  convertType === 200 ? (
                    <img alt="word" src={icon_word_32} />
                  ) : convertType === 201 ? (
                    <img alt="excel" src={icon_excel_32} />
                  ) : (
                    <img alt="ppt" src={icon_ppt_32} />
                  )
                }
                listType="picture"
                fileList={[{ name: convertedFilename }]}
                showUploadList={{ showRemoveIcon: false }}
              />
            ) : null}
            {!convertloadLoading && downloadUrl ? (
              <Button
                size="large"
                shape="round"
                type="primary"
                onClick={onDownload}
                icon={<img alt="save" src={dark_icon_save_26} />}
                loading={downloadLoading}
              >
                {t("Download")}
              </Button>
            ) : null}
          </Space>
        </Space>
      </Spin>
      <Modal
        zIndex={10000}
        title={t("Password")}
        open={passwordVisible}
        footer={null}
        className={"passwordPopup"}
        width={360}
        onCancel={cancel.bind(this)}
        centered
      >
        <div className="login-password-wrap">
          <div className="password-label">{t("Please input password")}:</div>
          <div className="input-password-wrap">
            <Input
              type="password"
              key={password}
              defaultValue={password}
              onBlur={handleChange.bind(this)}
            />
          </div>
          <div className="password-footor">
            <div className="to-login" onClick={submitPassword.bind(this)}>
              {t("OK")}
            </div>
            <div className="cancel-btn" onClick={cancel.bind(this)}>
              {t("Cancel")}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

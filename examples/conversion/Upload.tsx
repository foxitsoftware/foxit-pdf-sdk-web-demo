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
} from "antd";
import React, { useState } from "react";
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
  const [convertType, setConvertType] = useState(200);
  const [docidUpload, setDocidUpload] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [AITableChecked, setAITableChecked] = useState(false);
  const [convertloadLoading, setConvertloadLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [progress, setProgress] = useState(null);
  const [password, setPassword] = useState("");
  const [clickedCard, setClickedCard] = useState("");
  const [showUpload, setshowUpload] = useState(true);

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
    let data;
    data = {
      docId: docidUpload,
      type: convertType,
      password,
    };
    if (AITableChecked === true) {
      data["UseAIRecognize"] = true;
    }

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
    setClickedCard("");
    setConvertType(200);
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
  const convertistPDF2Office = [
    [
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
    ],
  ];
  const convertistOffice2PDF = [
    [
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
    ],
  ];
  return (
    <>
      <Spin
        tip={`${t("Converting...")} ${progress || ""}`}
        spinning={isConvertLoading}
        size={"large"}
      >
        <Space direction="vertical">
          <Divider style={{ textAlign: 'center', fontSize: '23px', fontWeight: 'bold', marginTop: '0' }}>PDF to Office</Divider>
          {convertistPDF2Office.map((row, rIndex) => {
            return (
              <Row key={rIndex} gutter={16}>
                {row.map((col, cIndex) => {
                  let cardClassName = "";
                  let currentCard = rIndex + "_" + cIndex;
                  if (clickedCard === currentCard) {
                    cardClassName = "clicked";
                  } else {
                    
                  }
                  return (
                    <Col key={cIndex} span={8}>
                      <Card
                        className={cardClassName}
                        size="small"
                        hoverable
                        onClick={() => {
                          setshowUpload(false);
                          setUpload(true);
                          setConvert(false);
                          setDocidUpload(null);
                          stopPollingForTaskStatus();
                          setConvertType(col.convertType);
                          setDownloadUrl(null);
                          setClickedCard(currentCard);
                        }}
                      >
                        <Meta title={col.title} description={col.description} />
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            );
          })}
          <div style={{ textAlign: "right" }}>
            <div
              className="ai-table-checked-box"
              style={{ display: "inline-block" }}
            >
              <Checkbox checked={AITableChecked} onChange={onChangeAITable}>
                {t("Use AI to recognize borderless tables")}
              </Checkbox>
            </div>
          </div>

          <Divider style={{ textAlign: 'center', fontSize: '23px', fontWeight: 'bold', marginTop: '0' }}>Office to PDF</Divider>
          {convertistOffice2PDF.map((row, rIndex) => {
            return (
              <Row key={rIndex} gutter={16}>
                {row.map((col, cIndex) => {
                  let cardClassName = "";
                  let currentCard = rIndex + 1 + "_" + cIndex;
                  if (clickedCard === currentCard) {
                    cardClassName = "clicked";
                  }
                  return (
                    <Col key={cIndex} span={8}>
                      <Card
                        className={cardClassName}
                        size="small"
                        hoverable
                        onClick={() => {
                          setshowUpload(false);
                          setUpload(true);
                          setConvert(false);
                          setDocidUpload(null);
                          stopPollingForTaskStatus();
                          setConvertType(col.convertType);
                          setDownloadUrl(null);
                          setClickedCard(currentCard);
                        }}
                      >
                      <Meta title={col.title} description={col.description} />
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            );
          })}
          <Space direction="vertical" className="tools-main-content-content">
            <Upload
              listType="picture"
              iconRender={() => <img alt="pdf" src={icon_pdf_48} />}
              action={`${baseUrl}/api/upload`}
              accept= {clickedCard === "1_0" ? ".docx" : clickedCard === "1_1" ? ".xlsx" : clickedCard === "1_2" ? ".pptx" : ".pdf"}
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
                  if (!clickedCard) {
                    setClickedCard("0_0");
                  }
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
              showUploadList = {showUpload}
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

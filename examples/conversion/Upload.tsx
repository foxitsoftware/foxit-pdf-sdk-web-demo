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
} from "antd";
import React from "react";
import axios from "axios";
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
function getDateDirName() {
  const date = new Date();
  let month = Number.parseInt(date.getMonth()) + 1;
  month = month.toString().length > 1 ? month : `0${month}`;
  const dir = `${date.getFullYear()}${month}${date.getDate()}`;
  return dir;
}
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

class Uploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConvertLoading: false,
      upload: true,
      filename: null,
      convert: false,
      download: false,
      convertedFilename: null,
      convertType: 200,
      docidUpload: null,
      taskid: null,
      percentage: 0,
      downloadUrl: null,
      downloadLoading: false,
      AITableChecked: false,
      isStopConvertProcessTimmerId: false,
      convertloadLoading: false,
      passwordVisible: false,
      password: "",
    };
    this.onConvert = this.onConvert.bind(this);
    this.onDownload = this.onDownload.bind(this);
  }

  onConvert() {
    this.setState({
      convertloadLoading: true,
      isConvertLoading: true,
      downloadLoading: false,
    });
    const { AITableChecked, password } = this.state;
    let data;
    data = {
      docId: this.state.docidUpload,
      type: this.state.convertType,
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
          this.setState({
            downloadUrl: response.data.data.url,
          });
        } else {
          if (response.data.code === 406) {
            if (password == "") {
              this.setState({
                passwordVisible: true,
              });
            } else {
              message.error("Password error");
            }
          } else {
            message.error(response.data.msg);
          }
        }
        this.setState({
          convertloadLoading: false,
          isConvertLoading: false,
        });
      })
      .catch(() => {
        message.error("Convert failed");
        this.setState({
          convertloadLoading: false,
          isConvertLoading: false,
        });
      });

    let c = /(.*)\.\w+/;
    let last =
      [11, 200].indexOf(this.state.convertType) !== -1
        ? ".docx"
        : [14, 201].indexOf(this.state.convertType) !== -1
        ? ".xlsx"
        : ".pptx";
    this.setState({
      //isStopConvertProcessTimmerId: false,
      convertedFilename: c.exec(this.state.filename)[1] + last,
    });
  }

  async onDownload() {
    this.setState({
      downloadLoading: true,
    });
    let suffix;
    if (this.state.convertType === 200) {
      suffix = "docx";
    } else if (this.state.convertType === 201) {
      suffix = "xlsx";
    } else if (this.state.convertType === 202) {
      suffix = "pptx";
    }
    let date = getDateDirName();
    let saved_file_path = `fileOutput/${date}/${this.state.downloadUrl}.${suffix}`;
    let url = `${serverUrl}/${saved_file_path}`;
    let c = /(.*)\.\w+/;
    let fileName = c.exec(this.state.filename)[1] + `.${suffix}`;
    await download(url, fileName);
    setTimeout(() => {
      this.setState({
        downloadLoading: false,
      });
    }, 3000);
  }

  getConvertist() {
    return [
      [
        {
          title: "PDF To Word",
          description: "Convert PDF to Word documents",
          convertType: 200,
        },
        {
          title: "PDF To Excel",
          description: "Convert PDF to Excel documents",
          convertType: 201,
        },
        {
          title: "PDF To PowerPoint",
          description: "Convert PDF to PowerPoint",
          convertType: 202,
        },
      ],
    ];
  }

  onChangeAITable = (e) => {
    this.setState({
      AITableChecked: e.target.checked,
      downloadUrl: null,
    });
  };

  onRemoveIcon = () => {
    this.setState({
      isStopConvertProcessTimmerId: true,
      clickedCard: "",
      convertType: 200,
    });
  };
  submitPassword() {
    if (this.state.password === "") {
      message.error("Please enter password");
      return;
    }
    this.onConvert();
    this.setState({
      passwordVisible: false,
      password: "",
    });
  }
  cancel() {
    this.setState({
      passwordVisible: false,
    });
  }
  handleChange(e) {
    this.setState({
      password: e.target.value,
    });
  }
  render() {
    const convertist = this.getConvertist();
    const { clickedCard, AITableChecked, isConvertLoading } = this.state;
    return (
      <>
        <Spin tip="Converting..." spinning={isConvertLoading} size={"large"}>
          <Space direction="vertical">
            {convertist.map((row, rIndex) => {
              return (
                <Row key={rIndex} gutter={16}>
                  {row.map((col, cIndex) => {
                    let cardClassName = "";
                    let currentCard = rIndex + "_" + cIndex;
                    if (clickedCard === currentCard) {
                      cardClassName = "clicked";
                    }
                    return (
                      <Col key={cIndex} span={8}>
                        <Card
                          className={cardClassName}
                          style={{ backgroud: "red" }}
                          size="small"
                          hoverable
                          onClick={() => {
                            this.setState({
                              convertType: col.convertType,
                              taskid: null,
                              percentage: 0,
                              downloadUrl: null,
                              clickedCard: currentCard,
                              isStopConvertProcessTimmerId: true,
                            });
                          }}
                        >
                          <Meta
                            title={col.title}
                            description={col.description}
                          />
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
                <Checkbox
                  checked={AITableChecked}
                  onChange={this.onChangeAITable}
                >
                  Use AI to recognize borderless tables
                </Checkbox>
              </div>
            </div>
            <Space direction="vertical" className="tools-main-content-content">
              <Upload
                listType="picture"
                iconRender={() => <img alt="pdf" src={icon_pdf_48} />}
                action={`${baseUrl}/api/upload`}
                accept=".pdf"
                beforeUpload={(file: RcFile) => {
                const exceededSizeLimit = file.size / 1024 / 1024 > UPLOAD_FILE_SIZE_LIMIT_MB;
                  if (exceededSizeLimit) {
                    message.error(`For this demo, PDF files should be smaller than ${UPLOAD_FILE_SIZE_LIMIT_MB}MB.`);
                    file.status = 'error';
                    return false;
                  }
                    return true;
                }}
                onChange={(info) => {
                  // console.log(info);
                  if (info.file.status === "done") {
                    this.setState({
                      upload: false,
                      filename: info.file.name,
                      convert: true,
                      docidUpload: info.file.response.docId,
                    });
                    if (!clickedCard) {
                      this.setState({
                        clickedCard: "0_0",
                      });
                    }
                  }
                  if (info.fileList.length === 0) {
                    this.setState({
                      upload: true,
                      convert: false,
                      docidUpload: null,
                      taskid: null,
                      downloadUrl: null,
                    });
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
                onRemove={this.onRemoveIcon}
              >
                {this.state.upload ? (
                  <Button
                    size="large"
                    shape="round"
                    icon={<img src={dark_icon_open_26} alt="open" />}
                    type="primary"
                  >
                    Upload
                  </Button>
                ) : null}
              </Upload>
              {this.state.convert && !this.state.downloadUrl ? (
                <Button
                  size="large"
                  shape="round"
                  type="primary"
                  onClick={this.onConvert}
                  loading={this.state.convertloadLoading}
                  disabled={this.state.convertloadLoading}
                >
                  {[11, 200].indexOf(this.state.convertType) !== -1 ? (
                    <>
                      <img alt="word" src={dark_icon_word_26} />
                      Convert to Word
                    </>
                  ) : [14, 201].indexOf(this.state.convertType) !== -1 ? (
                    <>
                      <img alt="excel" src={dark_icon_excel_26} />
                      Convert to Excel
                    </>
                  ) : (
                    <>
                      <img alt="ppt" src={dark_icon_ppt_26} />
                      Convert to PPT
                    </>
                  )}
                </Button>
              ) : null}
              {!this.state.convertloadLoading && this.state.downloadUrl ? (
                <Upload
                  iconRender={() =>
                    this.state.convertType === 11 ? (
                      <img alt="word" src={icon_word_32} />
                    ) : this.state.convertType === 14 ? (
                      <img alt="excel" src={icon_excel_32} />
                    ) : (
                      <img alt="ppt" src={icon_ppt_32} />
                    )
                  }
                  listType="picture"
                  fileList={[{ name: this.state.convertedFilename }]}
                  showUploadList={{ showRemoveIcon: false }}
                />
              ) : null}
              {!this.state.convertloadLoading && this.state.downloadUrl ? (
                <Button
                  size="large"
                  shape="round"
                  type="primary"
                  onClick={this.onDownload}
                  icon={<img alt="save" src={dark_icon_save_26} />}
                  loading={this.state.downloadLoading}
                >
                  Download
                </Button>
              ) : null}
            </Space>
          </Space>
        </Spin>
        <Modal
          zIndex={10000}
          title={"Password"}
          open={this.state.passwordVisible}
          footer={null}
          className={"passwordPopup"}
          width={360}
          onCancel={this.cancel.bind(this)}
          centered
        >
          <div className="login-password-wrap">
            <div className="password-label">Please input password:</div>
            <div className="input-password-wrap">
              <Input
                type="password"
                key={this.state.password}
                defaultValue={this.state.password}
                onBlur={this.handleChange.bind(this)}
              />
            </div>
            <div className="password-footor">
              <div
                className="to-login"
                onClick={this.submitPassword.bind(this)}
              >
                OK
              </div>
              <div className="cancel-btn" onClick={this.cancel.bind(this)}>
                Cancel
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default Uploader;

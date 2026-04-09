import {envConfig} from '../../../common/util.js';

const envList = Object.values(envConfig).map(item=>Object.values(item)).flat();

function getBaseURL(){
    if(envList.includes(window.location.origin)){
        return window.location.origin;
    }
    return envConfig.international.pro;
}

function requestData(type, url, responseType, body){
  return new Promise(function(res, rej){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(type, getBaseURL() + url);

    xmlHttp.responseType = responseType || 'arraybuffer';
    var formData = new FormData();
    if (body) {
      for (var key in body) {
        if (body[key] instanceof Blob) {
          formData.append(key, body[key], key);
        } else {
          formData.append(key, body[key]);
        }
      }
    }
    xmlHttp.onloadend = function(e) {
      var status = xmlHttp.status;
      if ((status >= 200 && status < 300) || status === 304) {
        res(xmlHttp.response);
      }else{
        rej(new Error('Sign server is not available.'));
      }
    };

    xmlHttp.send(body ? formData : null);
  });
};

export function initSignatureHandlers(pdfui) {
  const service = pdfui.getSignatureWorkflowService();
  const engineSignatureService = pdfui.getSignatureService();
  (() => {
      // const service = pdfViewer.getSignatureWorkflowService();
      engineSignatureService.setVerifyHandler(async (signatureField, plainContent, signedData, hasDataOutOfScope) => {
          const filter = await signatureField.getFilter();
          const subfilter = await signatureField.getSubfilter();
          const signer = await signatureField.getSigner();
          const formdata = new FormData();
          formdata.append("filter", filter);
          formdata.append("subfilter", subfilter);
          formdata.append("signer", signer);
          formdata.append("plainContent", new Blob([plainContent]), "plainContent");
          formdata.append("signedData", new Blob([signedData]), "signedData");
          
          const response = await fetch(getBaseURL() + '/signature/verify', {
              method: 'POST',
              body: formdata
          });
          return parseInt(await response.text());
      });
      const sign = async (settings, plainContent) => {
          const formdata = new FormData();
          formdata.append("plain", new Blob([plainContent]), "plain");
          const response = await fetch(getBaseURL() + '/signature/digest_and_sign', {
              method: 'POST',
              body: formdata
          });
          return response.arrayBuffer();
      };
      service.addSignerInfo({
          filter: 'Adobe.PPKLite',
          subfilter: 'adbe.pkcs7.sha1',
          signer: 'web sdk',
          sign
      });
      service.addSignerInfo({
          filter: 'Adobe.PPKLite',
          subfilter: 'adbe.pkcs7.sha1',
          signer: 'web sdk11',
          sign
      });
      service.addSignatureAPInfo({
          title: 'Standard Style',
          distinguishName: 'e=foxitsdk@foxitsoftware.cn',
          location: 'FZ',
          reason: 'Test',
          flag: 0x17F,
          showTime: true,
      });
      service.addSignatureAPInfo({
          title: 'BJ appearance',
          distinguishName: 'e=foxitsdk@foxitsoftware.cn',
          location: 'BJ',
          reason: 'TestBJ',
          flag: 0x17F,
          showTime: true,
      });
  })();
}

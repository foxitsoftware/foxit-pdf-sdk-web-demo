declare var HTTP_BASE_URL: string; // base url of collab server http api, defined by build tool(webpack)
// declare var WS_BASE_URL: string; // base url of collab server websocket api, defined by build tool(webpack)
declare var __webpack_public_path__: string;

export let serverUrl = `http://${window.location.hostname}:19112`;

// config for production deployment
if(window.location.protocol === 'https:'){
  serverUrl = `https://${window.location.hostname}:19112/collab`;
}

export const PUBLIC_PATH = __webpack_public_path__;

// @ts-ignore
export const licenseSN=window.licenseSN

// @ts-ignore
export const licenseKey=window.licenseKey

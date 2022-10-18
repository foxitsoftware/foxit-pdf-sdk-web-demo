import { PUBLIC_PATH } from "../config";

//@ts-nocheck
export function getQueryVariable(variable: string) {
  var query = window.location['search'].substring(1);
  var vars = query.split('&');
  var i, pair, value;
  for (i = 0; i < vars.length; i++) {
    pair = vars[i].split('=');
    if (pair[0] === variable) {
      value = decodeURIComponent(pair[1]);
      return value;
    }
  }
  return null;
}
export let localDocList = [
  {
    name: "FoxitPDFSDKforWeb.pdf",
    path: `${window.origin}/assets/FoxitPDFSDKforWeb_DemoGuide.pdf`
  },
  {
    name: "Foxit One Pager.pdf",
    path: `${window.origin}/assets/Foxit_One_Pager.pdf`
  }
]

export function storageGetItem(storage: any, key: string) {
  if (!storage) return null;
  return storage.getItem(key);
}

export function storageRemoveItem(storage: any, key: string) {
  if (!storage) return null;
  return storage.removeItem(key);
}
export function storageClear(storage:any) {
  storage && storage.clear();
}

export function storageSetItem(storage:any, key: string, value: string) {
  storage && key && storage.setItem(key, value);
}

//Randomly generate hex color
export function randomHexColor(userId) {
  var hex = Math.floor(userId * 123).toString(16);
  while (hex.length < 6) {
    hex = '0' + hex;
  }
  return '#' + hex;
}

//Randomly generate user name (simulated)
export function randomMockName(userName: string) {
  return userName + Math.floor(Math.random() * 100).toString()
}
export const collabAuthorSteps=[
  {
    element: '.more-option',
    popover: {
      className: 'collab-author-more',
      title:"Step1",
      description: 'Upload a file to start collaboration',
      position: 'bottom',
    }
  },
  {
    element: '.share-btn',
    popover: {
      className: 'collab-author-steps-share',
      title: 'Step2',
      description: 'Create a collaboration session',
      position: 'left'
    }
  }
]
export const collabParticipantSteps = [
  {
    element: ".share-popover",
    popover: {
      className: 'collab-Participant-steps',
      title:"Step1",
      description: "Collaboration information",
      position: 'left',
    }
  }
]

export const stepOption={
  allowClose:false,
  closeBtnText: 'Skip',
  nextBtnText: 'Next',
  prevBtnText: 'Previous',
}

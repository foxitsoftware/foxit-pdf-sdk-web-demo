import React, { Component } from 'react';
import collaborationToolbar from './CollabToobar/CollaborationToolbar.art';
// @ts-ignore
import * as UIExtension from "UIExtension";
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import mobileAddons from "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/uix-addons/allInOne.mobile"
import Addons from "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/uix-addons/allInOne"
import { PUBLIC_PATH,licenseSN,licenseKey } from "../../config";
import { message } from 'antd';
import {lang} from '../../locales';

interface IProps {
  onFinishInitPDFUI: Function;
  openFileSuccess:Function;
  showLoading:Function;
}
export default class PDFViewer extends Component<IProps, any> {
  constructor(props: IProps) {
    super(props)
    this.state = {
    }
  }
  componentDidMount() {
    this.props.showLoading(true)
    this.initPDFUI()
  }
  componentWillUnmount() {
    this.state['pdfui'] && this.state['pdfui'].destroy();
  }
  initPDFUI() {
    const libPath = PUBLIC_PATH + "lib/";
    const PDFUI = UIExtension.PDFUI;
    // eventEm
    const pdfui = new PDFUI({
      viewerOptions: {
        libPath,
        jr: {
          workerPath: libPath,
          enginePath: libPath + "jr-engine/gsdk/",
          fontPath: "https://webpdf.foxitsoftware.com/webfonts/",
          licenseSN: licenseSN,
          licenseKey: licenseKey,
        },
        customs: {
          isAttachFileOverSize: (file:any) => {
            if (!file) {
              return
            }
            if (file.size > 1024 * 1024 * 10) {
              message.error(lang.Component.sizeTip)
              return true
            }
          },
        }
      },
      renderTo: '#pdf-ui',
      appearance: UIExtension.appearances.adaptive,
      fragments: [],
      // addons: [
      //   libPath+'uix-addons/thumbnail'
      // ]
      addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile ? [] : Addons,
    });
    pdfui.getRootComponent().then((root: any) => {
      // Hide Default Toolbar
      if(UIExtension.PDFViewCtrl.DeviceInfo.isMobile){
        const mobileHeaderRight=root.getComponentByName('fv--mobile-header-right')
        const peotectToolbar=root.getComponentByName('fv--mobile-header-main')
        const toolbarTabs = root.getComponentByName('fv--mobile-toolbar-tabs');
        const mobileHeader = root.getComponentByName('fv--mobile-header');
        mobileHeader && mobileHeader.hide()
        toolbarTabs && toolbarTabs.hide();
        peotectToolbar&& peotectToolbar.hide();
        mobileHeaderRight&& mobileHeaderRight.hide();
        let collabComponent = root.getComponentByName('collaboration-toolbar');
        if (!collabComponent) {
          root.insert(collaborationToolbar(), 1);
          collabComponent = root.getComponentByName('collaboration-toolbar');
        }
      }else{
        const toolbarTabs = root.getComponentByName('toolbar');
        const thumbnailContextmenu=root.getComponentByName('fv--thumbnail-contextmenu')
        toolbarTabs && toolbarTabs.hide();
        thumbnailContextmenu&&thumbnailContextmenu.destroy();
        let collabComponent = root.getComponentByName('collaboration-toolbar');
        if (!collabComponent) {
          root.insert(collaborationToolbar(), 1);
          collabComponent = root.getComponentByName('collaboration-toolbar');
        }
        root.getComponentByName('sidebar').element.firstChild.childNodes[3].childNodes[5].style.display = "none";
        root.getComponentByName('sidebar').element.firstChild.childNodes[3].childNodes[3].style.display = "none";
      }
      let attachmentToolbar=root.getComponentByName('attachment-toolbar')
      attachmentToolbar && attachmentToolbar.hide()
      let applyAll=root.getComponentByName('fv--contextmenu-item-apply-all')
      let apply=root.getComponentByName('fv--contextmenu-item-apply')
      applyAll && applyAll.doDestroy()
      apply && apply.doDestroy()
    });
    pdfui.addUIEventListener(UIExtension.UIEvents.initializationCompleted, () => {
      this.props.onFinishInitPDFUI(pdfui);
    })
    pdfui.addUIEventListener(UIExtension.UIEvents.openFileSuccess, async () => {
      pdfui.registerDialog('fv--bookmark-contextmenu', undefined)
      this.props.openFileSuccess();
    })
    this.setState({
      pdfui
    })
    window.onresize = function () {
      pdfui.redraw().catch(function () { });
    }
  }
  render() {
    return (<div id="pdf-ui"></div>)
  }
}

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

let appearance = UIExtension.appearances.adaptive
let isMobile = false
if(window.innerWidth <= 900 && UIExtension.PDFViewCtrl.DeviceInfo.isTouchDevice){
  appearance = UIExtension.appearances.MobileAppearance
  isMobile = true
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
      appearance,
      fragments: [
        {
          target:"@layer-sidebar-panel",
          action:"remove"
        },
        {
          target:"@sidebar-field",
          action:"remove"
        },
        {
          target:"@bookmark-sidebar-panel",
          action:"remove"
        },
        {
          target:"@search-sidebar-panel",
          action:"remove"
        },

        {
          target: '@thumbnail:thumbnail-list',
          action: 'replace',
          template: `
            <thumbnail:thumbnail-list
                @thumbnail:centered
                @aria:label="thumbnail:title"
            >
                <thumbnail:thumbnail-item
                    @foreach="thumbnail in thumbnail_list.thumbnails track by id"
                    @setter.thumbnail_id="thumbnail.id"
                    @lazy-content="visible"
                >
                    <div class="fv__ui-thumbnail-viewer-container">
                        <thumbnail:thumbnail-viewer @setter.thumbnail="thumbnail" @thumbnail:visible-rect-control></thumbnail:thumbnail-viewer>
                    </div>
                    <thumbnail:page-number>@{thumbnail.pageIndex+1}</thumbnail:page-number>
                </thumbnail:thumbnail-item>
            </thumbnail:thumbnail-list>`
        }
      ],
      addons: isMobile ? mobileAddons : Addons,
    });
    pdfui.getRootComponent().then(async (root: any) => {
      // Hide Default Toolbar
      if(isMobile){
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
          // root.getComponentByName('selection-dropdown').hide();
        }
        let pdfViewer = await pdfui.getPDFViewer();
        pdfViewer.getAnnotManager().registerMatchRule(function (pdfAnnot, AnnotComponent) {
          return class CustomComponent extends AnnotComponent {
            showReplyDialog() {}
          }
         })
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
      const root=await pdfui.getRootComponent();
      root.querySelector('fv--contextmenu-item-rotate-left').hide()
      root.querySelector('fv--contextmenu-item-rotate-right').hide()
      root.querySelectorAll('fv--text-selection-tooltip > *').forEach(it => {
          if(it.name === 'fv--text-selection-tooltip-create-bookmark') {
            it.hide()
          }
      })
      this.props.openFileSuccess();
    })
    this.setState({
      pdfui
    })

    window.addEventListener(
        isMobile ? "orientationchange" : "resize",
        function (e) {
          pdfui.redraw();
        }
    );
  }
  render() {
    return (<div id="pdf-ui"></div>)
  }
}

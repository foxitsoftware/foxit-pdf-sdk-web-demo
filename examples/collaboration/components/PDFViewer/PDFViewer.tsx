import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
// @ts-ignore
import * as UIExtension from 'UIExtension';
import "@foxitsoftware/foxit-pdf-sdk-for-web-library-full/lib/UIExtension.vw.css";
import { PUBLIC_PATH, licenseSN, licenseKey } from '../../config';
import { message, notification } from 'antd';
import { lang } from '../../locales';
import { useIsLoading } from '../../context/isLoading';
import { initSignatureHandlers } from '../../common/signature';
import {
  collabToolbarConfiguration,
  fragmentsConfiguration,
  onFollowingStatus,
  onFollowingStatusByResize,
} from '../../utils/collab-utils';
interface IProps {
  OnInitializationCompleted: Function;
  getDocumentPermission: Function;
}
export default (props: IProps) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
  const [pdfui, setPdfui] = useState<any>(null);
  const { setIsLoading } = useIsLoading();
  useEffect(() => {
    setIsLoading(true);
    initPDFUI();
    return () => {
      pdfui && pdfui.destroy();
    };
  }, []);
  const addUIEventListener = async (pdfui) => {
    let pdfViewer = await pdfui.getPDFViewer();
    pdfui.addUIEventListener(
      UIExtension.UIEvents.initializationCompleted,
      async () => {
        props.OnInitializationCompleted(pdfui, pdfViewer);
      },
    );
    pdfui.addUIEventListener(UIExtension.UIEvents.openFileSuccess, async () => {
      const root = await pdfui.getRootComponent();
      root.querySelector('fv--contextmenu-item-rotate-left').hide();
      root.querySelector('fv--contextmenu-item-rotate-right').hide();
      root.querySelector('contextmenu-form-designer')?.remove();
      root.querySelectorAll('fv--text-selection-tooltip > *').forEach((it) => {
        if (it.name === 'fv--text-selection-tooltip-create-bookmark') {
          it.hide();
        }
      });
      const docRender = pdfViewer.getPDFDocRender();
      const doc = await pdfViewer.getCurrentPDFDoc();
      const isPortfolio = doc.isPortfolio();
      const hasAnnotFormPermission = docRender
        .getUserPermission()
        .checkAnnotForm();
      props.getDocumentPermission(isPortfolio, hasAnnotFormPermission);
    });
    pdfui.addUIEventListener(UIExtension.UIEvents.willCloseDocument, () => {
      onFollowingStatus(false);
      notification.destroy();
    });
    window.addEventListener(
      UIExtension.PDFViewCtrl.DeviceInfo.isMobile
        ? 'orientationchange'
        : 'resize',
      function (e) {
        onFollowingStatusByResize();
        pdfui.redraw();
      },
    );
  };
  const initPDFUI = async () => {
    const libPath = '/lib/';
    const PDFUI = UIExtension.PDFUI;
    // eventEm
    const pdfui = new PDFUI({
      viewerOptions: {
        libPath,
        jr: {
          workerPath: libPath,
          enginePath: libPath + 'jr-engine/gsdk/',
          fontPath: 'https://webpdf.foxitsoftware.com/webfonts/',
          licenseSN: licenseSN,
          licenseKey: licenseKey,
        },
        customs: {
          isAttachFileOverSize: (file: any) => {
            if (!file) {
              return;
            }
            if (file.size > 1024 * 1024 * 10) {
              message.error(t("Component.sizeTip"));
              return true;
            }
          },
        },
      },
      renderTo: '#pdf-ui',
      appearance: UIExtension.appearances.adaptive,
      fragments: fragmentsConfiguration,
      addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile
        ? libPath + 'uix-addons/allInOne.mobile.js'
        : libPath + 'uix-addons/allInOne.js',
    });
    await collabToolbarConfiguration(pdfui, UIExtension);
    await addUIEventListener(pdfui);
    initSignatureHandlers(pdfui);
    setPdfui(pdfui);
  };
  return <div id="pdf-ui"></div>;
};

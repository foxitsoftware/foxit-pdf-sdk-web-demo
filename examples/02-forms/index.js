import * as UIExtension from 'UIExtension';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import './index.css';
import { hideAll } from '../../src/snippets/snippets'

const { PDFUI, PDFViewCtrl } = UIExtension;
const { DeviceInfo, Events } = PDFViewCtrl;
const File_Type = PDFViewCtrl.PDF.constant.File_Type;

const libPath = '/lib/';
const pdfui = new PDFUI({
    viewerOptions: {
        libPath: libPath,
        jr: {
            workerPath: libPath,
            enginePath: libPath + 'jr-engine/gsdk/',
            fontPath: 'https://webpdf.foxitsoftware.com/webfonts/',
            licenseSN: licenseSN,
            licenseKey: licenseKey,
        },
    },
    renderTo: '#pdf-ui',
    appearance: UIExtension.appearances.adaptive,
    addons: DeviceInfo.isMobile ? '/lib/uix-addons/allInOne.mobile.js' : '/lib/uix-addons/allInOne.js',
});

//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
    hideAll(pdfui, '@viewer,form-tab,home-tab,fv--form-tab-paddle,fv--form-tab-paddle *,fv--home-tab-paddle,fv--home-tab-paddle *');
    //Get 'form' tab
    const formTab = root.getComponentByName('form-tab');
    formTab.active();
    const formTabGroup = root.getComponentByName('form-tab-group-text');
    formTabGroup.setRetainCount(4);
})

window.addEventListener(DeviceInfo.isDesktop ? 'resize' : 'orientationchange', () => {
    pdfui.redraw();
});

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
    console.info('open file success');
});

pdfui
    .openPDFByHttpRangeRequest(
        {
            range: {
                //Default PDF file path
                url: '/assets/FoxitPDFSDKforWeb_DemoGuide.pdf',
            },
        },
        { fileName: 'FoxitPDFSDKforWeb_DemoGuide.pdf' }
    );




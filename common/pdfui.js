import * as U from 'UIExtension';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import './pdfui.less';

function loadScript(src) {
    const script = document.createElement('script');
    return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        script.src = src;
        document.head.appendChild(script);
    });
}

export const UIExtension = U;

const libPath = '/lib/';
const { PDFViewCtrl } = UIExtension;
const { DeviceInfo } = PDFViewCtrl;

export function loadPDFUI(options) {
    return loadScript('https://webviewer-demo.foxitsoftware.cn/examples/license-key.js')
    .then(() => {
        const elm = document.createElement('div');
        elm.classList.add('fv__catalog-pdfui-wrapper');
        const id = Math.floor(Math.random() * 10000000).toString(26);
        elm.id = id;
        document.body.appendChild(elm);
        const defaultOptions = {
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
            renderTo: '#' + id,
            appearance: UIExtension.appearances.adaptive,
            addons: DeviceInfo.isMobile ? '/lib/uix-addons/allInOne.mobile.js' : '/lib/uix-addons/allInOne.js',
        };
        const pdfui = new UIExtension.PDFUI(Object.assign(
            defaultOptions, options || {}
        ));
        
        window.addEventListener(DeviceInfo.isDesktop ? 'resize' : 'orientationchange', () => {
            pdfui.redraw();
        });
        return pdfui;
    })
}
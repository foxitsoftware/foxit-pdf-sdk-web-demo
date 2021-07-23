import * as UIExtension from 'UIExtension';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;

const pdfui = createPDFUI({});

export function markAndRedactAStringOfText(
    options = {
        bottom: 586.2299349240782,
        left: 67.04121475054231,
        right: 170.590021691974,
        top: 597.5140997830804,
    }
) {
    return pdfui
        .getCurrentPDFDoc()
        .then((doc) => {
            return doc.getPageByIndex(0);
        })
        .then((page) => {
            return page.markRedactAnnot([options]);
        })
        .then((annots) => {
            return annots[0];
        })
        .then((redact) => {
            return redact.apply();
        });
}

pdfui.getComponentByName('redaction').then((group) => {
    group.setRetainCount(100);
});

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
    pdfui.getRootComponent().then((root) => {
        const commentTab = root.getComponentByName('protect-tab');
        commentTab.active();
    });
});

pdfui.openPDFByHttpRangeRequest(
    {
        range: {
            url: '/assets/5-feature-example_forms.pdf',
        },
    },
    { fileName: '5-feature-example_forms.pdf' }
);

import * as UIExtension from 'UIExtension';
import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import { createPDFUI } from '../../common/pdfui';

const { PDFViewCtrl } = UIExtension;
const { Events } = PDFViewCtrl;

const pdfui = createPDFUI();

export function openSignDialog() {
    pdfui.getComponentByName('create-signature').then((inkDialog) => {
        inkDialog.show();
    });
}
  

//Toolbar element show/hide control
pdfui.getRootComponent().then((root) => {
    const formTab = root.getComponentByName('form-tab');
    formTab.active();
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
            //Default PDF file path
            url: '/assets/Feature-example_digital-signature.pdf',
        },
    },
    { fileName: 'Feature-example_digital-signature.pdf' }
);

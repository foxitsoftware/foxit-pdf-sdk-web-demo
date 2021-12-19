import '@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css';
import { createPDFUI, initTab } from '../../common/pdfui';

const pdfui = createPDFUI();
initTab(pdfui,{
    menuTabName: "protect-tab",
    mobileTabName: "protect-tab-li"
});

export function openSignDialog() {
    pdfui.getComponentByName('create-signature').then((inkDialog) => {
        inkDialog.show();
    });
}

export function activePasswordProtectDropdown(){
    pdfui.getComponentByName('password-protect-group').then((group) => {
        group.childAt(0).getDropdown().active()
    });
}

pdfui.openPDFByHttpRangeRequest(
    {
        range: {
            //Default PDF file path
            url: '/assets/Feature-example_digital-signature.pdf',
        },
    },
    { fileName: 'Feature-example_digital-signature.pdf' }
);

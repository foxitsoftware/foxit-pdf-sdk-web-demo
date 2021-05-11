import * as UIExtension from 'UIExtension';
import './snippets.css';

const PDF = UIExtension.PDFViewCtrl.PDF;

export function openSidebar(pdfui, sidebarTabName) {
    return pdfui.getRootComponent().then((root) => {
        const sidebarPanel = root.getComponentByName(sidebarTabName);
        if (sidebarPanel) {
            sidebarPanel.active();
        }
    });
}
export function closeSidebar(pdfui) {
    return pdfui.getRootComponent().then((root) => {
        const sidebar = root.getComponentByName('sidebar');
        sidebar.collapse();
    });
}
export function rotatePage(pdfui) {
    return pdfui
        .getCurrentPDFDoc()
        .then((doc) => {
            return doc.getPageByIndex(0);
        })
        .then((page) => {
            return page.setRotation(PDF.constant.Rotation.rotation1);
        });
}

export function movePage(pdfui, fromIndex, toIndex) {
    return pdfui.getCurrentPDFDoc().then((doc) => {
        return doc.movePageTo(fromIndex, toIndex);
    });
}

export function createCalloutAnnotation(pdfui) {
    return pdfui.getRootComponent().then((root) => {
        const commentTab = root.getComponentByName('comment-tab');
        commentTab.active();
        const restore = disableAll(pdfui, 'freetext-callout,@alert @xbutton');
        return pdfui.alert('Click OK to create callout').then(() => {
            restore();
            return pdfui
                .getCurrentPDFDoc()
                .then((doc) => {
                    return doc.getPageByIndex(0);
                })
                .then((page) => {
                    return page.addAnnot({
                        type: 'freetext',
                        intent: 'FreeTextCallout',
                        subject: 'FreeTextCallout',
                        'interior-color': 16777215,
                        rotate: 0,
                        flags: 4,
                        calloutLinePoints: [
                            { x: 77.35922330097088, y: 453.32038834951464 },
                            { x: 238.41456310679615, y: 497.0262135922331 },
                            { x: 253.41456310679615, y: 497.0262135922331 },
                        ],
                        rect: {
                            left: 76.35922330097088,
                            top: 508.1262135922331,
                            right: 354.5145631067962,
                            bottom: 452.32038834951464,
                        },
                        innerRect: {
                            left: 253.51456310679615,
                            top: 507.1262135922331,
                            right: 353.5145631067962,
                            bottom: 487.1262135922331,
                        },
                    });
                });
        });
    });
}

export function createCustomStamp(pdfui, url) {
    const sepIndex = url.lastIndexOf('/');
    const q = url.lastIndexOf('?');
    if (q > -1) {
        url = url.substring(0, q);
    }
    const filename = url.substring(sepIndex);
    const dotIndex = filename.lastIndexOf('.');
    let ext;
    let name = filename;
    if (dotIndex > -1) {
        ext = filename.substring(dotIndex + 1);
        name = filename.substring(0, dotIndex);
    }
    if (!ext) {
        pdfui.alert(`Unknown file type: ${url}`);
        return;
    }
    return pdfui
        .getRootComponent()
        .then((root) => {
            const commentTab = root.getComponentByName('comment-tab');
            commentTab.active();
            return root;
        })
        .then((root) => {
            const stampDropdown = root.getComponentByName('stamp-drop-down-ui');
            stampDropdown.active();
            return loadImage(url).then((size) => {
                return pdfui.addAnnotationIcon({
                    url,
                    name: name,
                    category: 'customStampDemo',
                    fileType: ext,
                    width: size.width,
                    height: size.height,
                });
            });
        });
}

export function markAndRedactAStringOfText(pdfui) {
    return pdfui
        .getCurrentPDFDoc()
        .then((doc) => {
            return doc.getPageByIndex(0);
        })
        .then((page) => {
            return page.markRedactAnnot([
                {
                    left: 89.30400085449219,
                    top: 346.5767822265625,
                    right: 351.5455322265625,
                    bottom: 278.3037109375,
                    rotation: 0,
                    start: 0,
                    end: 3,
                    text: 'Demo',
                },
            ]);
        }).then((annots) => {
            return annots[0];
        }).then((redact) => {
            return redact.apply();
        });
}

export function disableAll(pdfui, excludeQuerySelector) {
    const promise = pdfui.getRootComponent().then((root) => {
        const all = root.querySelectorAll(
            'sidebar,@gtab,@xbutton,@dropdown,@dropdown-button,@file-selector,@input,@viewer'
        );
        const excludes = root.querySelectorAll(excludeQuerySelector);
        const allToDisable = all.filter((it) => excludes.indexOf(it) === -1);
        return allToDisable.map((it) => {
            it.element.classList.add('demo-disabled-ui');
            return it.element;
        });
    });
    return () => {
        return promise.then((allToDisableElement) => {
            allToDisableElement.forEach((it) => {
                it.classList.remove('demo-disabled-ui');
            });
        });
    };
}

export function hideAll(pdfui, excludeQuerySelector) {
    const promise = pdfui.getRootComponent().then(root => {
        const all = root.querySelectorAll(
            'sidebar,@gtab,@xbutton,@dropdown,@dropdown-button,@file-selector,@input,@viewer,@group'
        );
        const excludes = root.querySelectorAll(excludeQuerySelector);
        const allToHidden = all.filter((it) => excludes.indexOf(it) === -1);
        const hiddenElements = allToHidden.map((it) => {
            it.element.classList.add('demo-hidden-ui');
            return it.element;
        });
        excludes.forEach(it => {
            let elm = it.element;
            while(elm && elm.classList) {
                if(elm.classList.contains('demo-hidden-ui')) {
                    elm.classList.remove('demo-hidden-ui')
                }
                elm = elm.parentElement;
            }
        });
        return hiddenElements;
    })
    return () => {
        return promise.then((allHiddenElement) => {
            allHiddenElement.forEach((it) => {
                it.classList.remove('demo-hidden-ui');
            });
        });
    };
}

function loadImage(url) {
    const image = new Image();
    return new Promise((resolve, reject) => {
        image.onerror = () => {
            pdfui.alert(`Cannot load image url: ${url}`);
            reject();
        };
        image.onload = () => {
            resolve({
                width: image.width,
                height: image.height,
            });
        };
        image.src = url;
    });
}

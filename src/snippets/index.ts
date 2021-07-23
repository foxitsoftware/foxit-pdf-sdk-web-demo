
export function openSidebar(pdfui: any, sidebarTabName: any) {
  return pdfui.getRootComponent().then((root: any) => {
    const sidebarPanel = root.getComponentByName(sidebarTabName);
    if (sidebarPanel) {
      sidebarPanel.active();
    }
  });
}

export function closeSidebar(pdfui: any) {
  return pdfui.getRootComponent().then((root: any) => {
    const sidebar = root.getComponentByName("sidebar");
    sidebar.collapse();
  });
}


export function openTab(pdfui: any, tab: string) {
  return pdfui.getRootComponent().then((root: any) => {
    const commentTab = root.getComponentByName(tab);
    commentTab.active();
  });
}


export function hideAll(pdfui: any, excludeQuerySelector: string) {
  const promise = pdfui.getRootComponent().then((root: any) => {
    const all = root.querySelectorAll(
      "sidebar,@gtab,@xbutton,@dropdown,@dropdown-button,@file-selector,@input,@viewer,@group"
    );
    const excludes = root.querySelectorAll(excludeQuerySelector);
    const allToHidden = all.filter((it: any) => excludes.indexOf(it) === -1);
    const hiddenElements = allToHidden.map((it: any) => {
      it.element.classList.add("demo-hidden-ui");
      return it.element;
    });
    excludes.forEach((it: any) => {
      let elm = it.element;
      while (elm && elm.classList) {
        if (elm.classList.contains("demo-hidden-ui")) {
          elm.classList.remove("demo-hidden-ui");
        }
        elm = elm.parentElement;
      }
    });
    return hiddenElements;
  });
  return () => {
    return promise.then((allHiddenElement: any) => {
      allHiddenElement.forEach((it: any) => {
        it.classList.remove("demo-hidden-ui");
      });
    });
  };
}


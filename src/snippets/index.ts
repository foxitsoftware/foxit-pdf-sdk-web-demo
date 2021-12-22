
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

export function openSidebarRightTab(pdfui: any, tabName: string, type?: number){
  return pdfui.getComponentByName('sidebar-right')
  .then((rightPanel: any) => {
    rightPanel.show();
    return pdfui.getComponentByName('sidebar-right-tabs');
  }).then((tabs: any) => {
    tabs.openTab(tabName);
    tabs.setActivetab(tabName);
    if (tabName === 'edit-properties-panel') {
      return pdfui.getComponentByName('edit-properties').then((component: any) => {
          return component.setHost({}, type);
      })
    }else if(tabName === 'right-search-panel'){
      return pdfui.getComponentByName('advanced-search').then((searchComp: any)=>{
        searchComp.setSearchType('normal');
      });
    }
  })
}

export function closeSidebarRightTab(pdfui: any){
  return pdfui.getComponentByName('sidebar-right')
  .then((rightPanel: any) => {
      rightPanel.hide();
  })
}

export function openDropdown(pdfui: any, dropdownName: string){
  return pdfui.getComponentByName(dropdownName)
    .then((dropdownContainer: any)=>{
      dropdownContainer.eRibbonText.click();
      setTimeout(()=>{
        const dropdown = dropdownContainer.getDropdown();
        if(!dropdown.isActive){
          dropdown.active();
        }
      })
    })
}

export function closeDropdown(pdfui: any, dropdownName: string){
  return pdfui.getComponentByName(dropdownName)
    .then((dropdownContainer: any)=>{
      dropdownContainer.getDropdown().deactive()
    })
}

export function openStampDropdown(pdfui: any){
  return pdfui.getComponentByName("stamp-drop-down-ui").then((stampDropdown: any)=>{
    stampDropdown.active();
    setTimeout(()=>{
      if(!stampDropdown.isActive){
        stampDropdown.active();
      }
    })
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


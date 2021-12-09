import * as UIExtension from 'UIExtension';
import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI } from '../../common/pdfui';

const {
  PDFViewCtrl: {
    DeviceInfo,
    Events
  }
} = UIExtension;

const pdfui = createPDFUI({});

if(!DeviceInfo.isMobile){
    pdfui.getRootComponent().then((root) => {
        const commentTab = root.getComponentByName("comment-tab");
        commentTab.active();
    });
}

pdfui.addViewerEventListener(Events.openFileSuccess, () => {
    pdfui.getRootComponent().then((root) => {
      const commentTab = root.getComponentByName("comment-tab");
      commentTab.active();
    });
});

pdfui.getRootComponent().then((root) => {
    if(!DeviceInfo.isMobile){
      const commentTabGroup = root.getComponentByName("comment-tab-group-text");
      commentTabGroup.setRetainCount(4);
    }
});

export function openSidebarRightTab(){
    return pdfui.getComponentByName('sidebar-right')
    .then(rightPanel => {
      this.rightPanel = rightPanel;
      rightPanel.show();
      return pdfui.getComponentByName('sidebar-right-tabs');
    }).then(tabs => {
        tabs.openTab('edit-properties-panel');
        tabs.setActivetab('edit-properties-panel');
        return pdfui.getComponentByName('edit-properties');
    }).then(component => {
        return component.setHost({}, 7);
    })
}

export function closeSidebarRightTab(){
    return pdfui.getComponentByName('sidebar-right')
    .then(rightPanel => {
        this.rightPanel = rightPanel;
        rightPanel.hide();
    })
}

export function showMeasurementDropdown(){
    return pdfui.getComponentByName("create-measurement-button-list")
    .then(measurementList=>{
        measurementList.getDropdown().active()
    })
}

export function hideMeasurementDropdown(){
    return pdfui.getComponentByName("create-measurement-button-list")
    .then(measurementList=>{
        measurementList.getDropdown().deactive()
    })
}

//The following section shows how to create different type of measurements 
export function createMeasurement(){
    return Promise.all([
        createDistance(),
        createPerimeter(),
        createPolygon(),
        createCircle()
    ])
}

// Create distance 
export function createDistance(){
    return pdfui
      .getCurrentPDFDoc()
      .then((doc) => {
        return doc.getPageByIndex(0);
      })
      .then((page) => {
        const {height} = page.getInfo();
        return page.addAnnot({
            "startPoint": {
                "x": 15,
                "y": height - 30
            },
            "endPoint": {
                "x": 115,
                "y": height - 30
            },
            "leaderLineExtend": 5,
            "leaderLineLength": 15,
            "subject": "Distance Measurement",
            "intent": "LineDimension",
            "type": "line",
            "startStyle": 4,
            "endStyle": 4,
            "contents": "0.93 inch",
            "rect": {
                "left": 0,
                "top": height - 30,
                "right": 130,
                "bottom": height - 30
            }
        });
    });
}

// Create perimeter
export function createPerimeter(){
    return pdfui
      .getCurrentPDFDoc()
      .then((doc) => {
        return doc.getPageByIndex(0);
      })
      .then((page) => {
        return page.addAnnot({
            "flags": 4,
            "subject": "Perimeter Measurement",
            "type": "polyline",
            "intent": "PolyLineDimension",
            "startStyle": 4,
            "endStyle": 4,
            "vertexes":[
                {
                    "x": 945.5121971579159,
                    "y": 690.3969647575827
                },
                {
                    "x": 856.5640126845416,
                    "y": 687.5954471363741
                },
                {
                    "x": 937.10764429429,
                    "y": 670.0859620038201
                },
                {
                    "x": 859.3655303057502,
                    "y": 653.9772356818704
                },
                {
                    "x": 944.8118177526137,
                    "y": 657.4791327083813
                }
            ],
            "rect": {
                "left": 854.5640126845416,
                "top": 692.3969647575827,
                "right": 947.5121971579159,
                "bottom": 651.9772356818704
            }
        });
    });
}

// Create rectangle area
export function createPolygon(){
    return pdfui
      .getCurrentPDFDoc()
      .then((doc) => {
        return doc.getPageByIndex(0);
      })
      .then((page) => {
        return page.addAnnot({
            "flags": 4,
            "contents": "2.08 sq inch",
            "subject": "Area Measurement",
            "type": "polygon",
            "intent": "PolygonDimension",
            "vertexes":[
                {
                    "x": 13.478999875626474,
                    "y": 15.7598062767172
                },
                {
                    "x": 14.377599867334906,
                    "y": 108.31560542268573
                },
                {
                    "x": 150.96479860701652,
                    "y": 98.43100551389296
                },
                {
                    "x": 126.70259883088886,
                    "y": 19.354206243550948
                }
            ],
            "rect": {
                "left": 11.478999875626474,
                "top": 110.31560542268573,
                "right": 152.9647986070165,
                "bottom": 13.759806276717313
            }
        });
    });
}

// Create circle area 
export function createCircle(){
    return pdfui
    .getCurrentPDFDoc()
    .then((doc) => {
      return doc.getPageByIndex(0);
    })
    .then((page) => {
      return page.addAnnot({
          "flags": 4,
          "contents": "1.71 sq inch",
          "subject": "Oval",
          "type": "circle",
          "intent": "CircleDimension",
          "rect": {
            "left": 827.6105923634656,
            "top": 107.41700543097727,
            "right": 940.8341913187279,
            "bottom": 7.672406351341351
        }
      });
  }); 
}

pdfui.openPDFByHttpRangeRequest(
  {
    range: {
      url: "/assets/3-feature-example_annotations.pdf",
    },
  },
  { fileName: "3-feature-example_annotations.pdf" }
);

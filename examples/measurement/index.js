import "@foxitsoftware/foxit-pdf-sdk-for-web-library/lib/UIExtension.vw.css";
import { createPDFUI, initTab } from '../../common/pdfui';

const pdfui = createPDFUI({});
initTab(pdfui,{
    menuTabName: "comment-tab",
    group:[
        {
            groupTabName: "comment-tab-group-text",
            retainCount: 4
        }
    ]
});

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
        return page.addAnnot({
            "startPoint": {
                "x": 38.352500915527344,
                "y": 648.3236083984375
            },
            "endPoint": {
                "x": 205.35252380371094,
                "y": 648.3236083984375
            },
            "leaderLineExtend": 5,
            "leaderLineLength": 15,
            "subject": "Distance Measurement",
            "intent": "LineDimension",
            "type": "line",
            "startStyle": 1,
            "endStyle": 4,
            "rect": {
                "top": 680.1986083984375,
                "right": 212.85252380371094,
                "bottom": 640.8236083984375,
                "left": 21.47749900817871
            },
            "borderInfo":{
                "cloudIntensity": 0,
                "dashPhase": 0,
                "dashes": [3,3,3,3],
                "style": 1,
                "width": 7
            },
            "color": 0xeeff00
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
            "startStyle": 1,
            "endStyle": 1,
            "vertexes":[
                {
                    "x": 767.9400024414062,
                    "y": 612.689453125
                },
                {
                    "x": 778.868408203125,
                    "y": 660.9397583007812
                },
                {
                    "x": 805.5060424804688,
                    "y": 613.1439819335938
                },
                {
                    "x": 823.1097412109375,
                    "y": 663.1714477539062
                },
                {
                    "x": 843.0503540039062,
                    "y": 616.8145141601562
                },
                {
                    "x": 825.6480102539062,
                    "y": 606.4150390625
                }
            ],
            "rect": {
                "top": 670.6714477539062,
                "right": 858.8613891601562,
                "bottom": 573.20166015625,
                "left": 738.0113525390625
            },
            "borderInfo":{
                "width": 7
            },
            "color": 0xeeff00,
            "fillColor": 0xffff
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
            "subject": "Area Measurement",
            "type": "polygon",
            "intent": "PolygonDimension",
            "borderInfo":{
                "width":7
            },
            "opacity": 0.5,
            "color": 0xffffff,
            "fillColor": 0xeeff00,
            "vertexes":[
                {
                    "x": 85.14445495605469,
                    "y": 427.69171142578125
                },
                {
                    "x": 95.85563659667969,
                    "y": 462.2686767578125
                },
                {
                    "x": 107.91929626464844,
                    "y": 427.7822265625
                },
                {
                    "x": 138.53587341308594,
                    "y": 426.8723449707031
                },
                {
                    "x": 114.48985290527344,
                    "y": 407.88616943359375
                },
                {
                    "x": 124.11834716796875,
                    "y": 373.4048767089844
                },
                {
                    "x": 97.11754608154297,
                    "y": 391.419677734375
                },
                {
                    "x": 71.46603393554688,
                    "y": 373.6766357421875
                },
                {
                    "x": 78.39796447753906,
                    "y": 407.166748046875
                },
                {
                    "x": 53.45133972167969,
                    "y": 425.6146240234375
                }
            ],
            "rect": {
                "top": 467.5186767578125,
                "right": 143.78587341308594,
                "bottom": 368.1548767089844,
                "left": 48.20133972167969
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
          "subject": "Oval",
          "type": "circle",
          "intent": "CircleDimension",
          "borderInfo":{
              "width":7
          },
          "color": 0xffffff,
          "fillColor": 0xeeff00,
          "rect": {
            "top": 445.5013122558594,
            "right": 928.7749633789062,
            "bottom": 402.8200988769531,
            "left": 814.6636352539062
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
).then(() => {
    createMeasurement()
  });

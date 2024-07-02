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
                "x": 112.98900604248047,
                "y": 649.2960205078125
            },
            "endPoint": {
                "x": 257.31201171875,
                "y": 649.2960205078125
            },
            "captionOffset":{
                "x": -4,
                "y": -12
            },
            "leaderLineExtend": 5,
            "leaderLineLength": 15,
            "subject": "Distance Measurement",
            "intent": "LineDimension",
            "type": "line",
            "startStyle": 2,
            "endStyle": 2,
            "rect": {
                "top": 677.0960083007812,
                "right": 269.125,
                "bottom": 644.0459594726562,
                "left": 101.177001953125
            },
            "borderInfo":{
                "width": 4
            },
            "color": 16044314,
            "fillColor": 4282515711
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
            "vertexes":[
                {
                    "x": 344.4720153808594,
                    "y": 643.5009765625
                },
                {
                    "x": 363.5360107421875,
                    "y": 677.0159912109375
                },
                {
                    "x": 392.13201904296875,
                    "y": 677.0159912109375
                },
                {
                    "x": 408.6080017089844,
                    "y": 645.5390014648438
                },
                {
                    "x": 392.13201904296875,
                    "y": 605.197998046875
                },
                {
                    "x": 363.5360107421875,
                    "y": 605.197998046875
                }
            ],
            "rect": {
                "top": 683.7659912109375,
                "right": 415.35797119140625,
                "bottom": 598.447998046875,
                "left": 337.7220153808594
            },
            "borderInfo":{
                "width": 6
            },
            "color": 10794727
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
            "color": 16777215,
            "fillColor": 4282515711,
            "vertexes":[
                {
                    "x": 547.5689697265625,
                    "y": 656.1729736328125
                },
                {
                    "x": 558.280029296875,
                    "y": 690.75
                },
                {
                    "x": 570.343994140625,
                    "y": 656.2640380859375
                },
                {
                    "x": 600.9609985351562,
                    "y": 655.35400390625
                },
                {
                    "x": 576.9150390625,
                    "y": 636.3679809570312
                },
                {
                    "x": 586.54296875,
                    "y": 601.885986328125
                },
                {
                    "x": 559.5419921875,
                    "y": 619.9010009765625
                },
                {
                    "x": 533.8909912109375,
                    "y": 602.157958984375
                },
                {
                    "x": 540.822998046875,
                    "y": 635.64794921875
                },
                {
                    "x": 515.8759765625,
                    "y": 654.0960083007812
                }
            ],
            "rect": {
                "top": 696,
                "right": 606.2109985351562,
                "bottom": 596.635986328125,
                "left": 510.6260070800781
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
            "cloudIntensity": 1,
            "style": 5,
            "width":7
          },
          "color": 11713014,
          "fillColor": 4278211071,
          "rect": {
            "top": 685.4900512695312,
            "right": 863.4450073242188,
            "bottom": 597.5900268554688,
            "left": 709.0549926757812
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

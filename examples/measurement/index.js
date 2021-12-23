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
                "x": 52.928550720214844,
                "y": 517.3309326171875
            },
            "endPoint": {
                "x": 197.25152587890625,
                "y": 517.3309326171875
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
                "top": 545.1314086914062,
                "right": 209.06402587890625,
                "bottom": 512.0809326171875,
                "left": 41.116050720214844
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
                    "x": 297.9459228515625,
                    "y": 526.7628173828125
                },
                {
                    "x": 317.0099182128906,
                    "y": 560.27783203125
                },
                {
                    "x": 345.6059265136719,
                    "y": 560.27783203125
                },
                {
                    "x": 362.0818786621094,
                    "y": 528.80078125
                },
                {
                    "x": 345.6059265136719,
                    "y": 488.4598083496094
                },
                {
                    "x": 317.0099182128906,
                    "y": 488.4598083496094
                }
            ],
            "rect": {
                "top": 567.02783203125,
                "right": 368.8318786621094,
                "bottom": 481.7098083496094,
                "left": 291.1959228515625
            },
            "borderInfo":{
                "width": 6
            },
            "color": 4278211071
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
                    "x": 475.6650390625,
                    "y": 526.745849609375
                },
                {
                    "x": 486.3760986328125,
                    "y": 561.3228759765625
                },
                {
                    "x": 498.4400634765625,
                    "y": 526.8369140625
                },
                {
                    "x": 529.0570678710938,
                    "y": 525.9268798828125
                },
                {
                    "x": 505.0111083984375,
                    "y": 506.9407958984375
                },
                {
                    "x": 514.6390991210938,
                    "y": 472.4588317871094
                },
                {
                    "x": 487.6380615234375,
                    "y": 490.473876953125
                },
                {
                    "x": 461.987060546875,
                    "y": 472.7308044433594
                },
                {
                    "x": 468.9190673828125,
                    "y": 506.2208251953125
                },
                {
                    "x": 443.97210693359375,
                    "y": 524.6688232421875
                }
            ],
            "rect": {
                "top": 566.5728759765625,
                "right": 534.3070678710938,
                "bottom": 467.2088317871094,
                "left": 438.72210693359375
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
            "top": 561.98486328125,
            "right": 791.5414428710938,
            "bottom": 474.0840148925781,
            "left": 637.1505737304688
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

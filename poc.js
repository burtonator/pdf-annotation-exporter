// script to test exporting PDF text and images...

// page:
//   number
//   images=[] // images of configured sizes of the pages

// image
//
//   data: data URI of the image
//
//
// highlight
// rectangle
// note
//
//


/**
 * Get the annotations from a specific page.
 * @param page
 */
function getHighlights(page) {

    // textAnnotation and highlightAnnotation

    var highlights = page.querySelectorAll(".annotationLayer .highlightAnnotation")
    console.log(highlights);

    var result = [];

    for(var idx = 0; idx < highlights.length; ++idx) {

        var highlightElement = highlights[idx];

        console.log("highlightElement: ", highlightElement)

        var highlightRegion = toElementRegion(highlightElement);
        var highlightBox = regionToBox(highlightRegion);

        var highlightRegionWithScale = getScaledElementRegion(highlightElement);
        var highlightBoxWithScale = regionToBox(highlightRegionWithScale);

        //console.log("FIXME: ", document.defaultView.getComputedStyle(highlightElement));
        //console.log("FIXME2: ", highlightElement.getClientRects());

        console.log("highlightRegion using offsets: ", toElementRegionUsingOffset(highlightElement));
        console.log("highlightElement client rect bounding box: ", highlightElement.getBoundingClientRect());

        console.log("highlightRegion: ", highlightRegion)
        console.log("highlightBox: ", highlightBox)

        var highlight = getHighlight(page, highlightBox, highlightBoxWithScale);

        result.push(highlight);

    }

    return result;

}

function getHighlightImage(page, highlightBox) {

    // FIXME: the transform has a 'scale' that I have to factor into account..

    var canvas = getPageCanvas(page);

    var tmpCanvas = document.createElement("canvas");

    var destCtx = tmpCanvas.getContext('2d');

    var highlightRegion = boxToRegion(highlightBox);

    tmpCanvas.width  = highlightRegion.width;
    tmpCanvas.height = highlightRegion.height;

    // FIXME: the width and height are proper but the x and y are WAY off...

    console.log("FIXME: highlightBox: ", highlightBox);
    console.log("FIXME: highlightRegion: ", highlightRegion);

    // //call its drawImage() function passing it the source canvas directly
    destCtx.drawImage(canvas,
                      highlightRegion.left, highlightRegion.top, highlightRegion.width, highlightRegion.height,
                      0, 0, highlightRegion.width, highlightRegion.height );

    // we could also call context .getImageData with x, y, width and height..

    // FIXME: ok.. this mostly works but I'm not able to properly convert the
    // coordinates to the screenshot coordinates.. not sure why..  I think it might be downsizing the canvas?
    // destCtx.drawImage(canvas,
    //                   553, 339, highlightRegion.width, 150,
    //                   0, 0, highlightRegion.width, 150 );

    // this makes no sense.. the coordinates on teh underlying image are way
    // off... not sure wy.  The FULL image renders properly though.
    //
    //
    // // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData
    // //var imageData = canvas.getContext('2d').getImageData(553, 339, 150, 150);
    // var imageData = canvas.getContext('2d').getImageData(100, 100, 500, 500);
    // destCtx.putImageData(imageData, 0, 0);

    // FIXME: load my coordinates into an image editor like gimp and then see if they work..
    // and that maybe this is a bug with the canvas...

    // destCtx.drawImage(canvas, 0, 0);

    var dataURL = tmpCanvas.toDataURL();
    logImage(dataURL);

    return dataURL;

}

function logImage(src) {
    console.log('%c       ', 'font-size: 100px; background: url(' + src + ') no-repeat;');
}

function getPageCanvas(page) {
    return page.querySelector("canvas");
}

function getImage(page) {
    var canvas = getPageCanvas(page);
    return canvas.toDataURL()
}

// TODO: this could be more efficient by using an index of the offsets so that
// we only have to search within the offsets and dimensions that we're interested
// in.
function getHighlight(page, highlightBox, highlightBoxWithScale) {

    // FIXME: change to highlightBox

    var textElements = page.querySelectorAll(".textLayer div")

    // console.log("Working with textAnnotationBox: ", textAnnotationBox)

    var linesOfText = [];

    for(var idx = 0; idx < textElements.length; ++idx) {
        var textElement = textElements[idx];

        var elementRegion = toElementRegion(textElement);
        var elementBox = regionToBox(elementRegion);

        // console.log("textElement: ", textElement);
        // console.log("elementRegion: ", elementRegion);
        // console.log("elementBox: ", elementBox);

        if (isWithinBox(elementBox, highlightBox)) {
            // console.log("YES!: " + textElement.outerText);
            linesOfText.push(textElement.outerText);
        }

    }

    var image = getHighlightImage(page, highlightBoxWithScale);

    return createHighlight(highlightBox, linesOfText, image, highlightBoxWithScale);

}

/**
 * Create an object with the bounding box of the text plus the text as an actual
 * array of lines.
 */
function createHighlight(box, linesOfText, image, highlightBoxWithScale) {

    return {box: box, linesOfText: linesOfText, image: image, box: highlightBoxWithScale};

}

// A region is like a box but based on left, top, width, height.
function createRegion(left, top, width, height) {
    return {left: left, top: top, width: width, height: height};
}

// Take a region and convert it to a box.
function regionToBox(region) {
    return createBox(createPoint(region.left, region.top),
                     createPoint(region.left + region.width, region.top + region.height));
}

function boxToRegion(box) {
    return createRegion(box[0].x, box[0].y, box[1].x - box[0].x, box[1].y - box[0].y);
}

// create a tuple with two points
function createBox(point0, point1) {
    return [point0, point1];
}

// A euclidian point
function createPoint(x,y) {
    return {x: x, y: y};
}

function getScaledElementRegion(element) {

    // the width and height here are what we want and don't need to be scaled.
    var boundingClientRect = element.getBoundingClientRect();

    //offsetLeft and offsetTop here are correct but DO need scaling.
    // FIXME: read these from the data...

    var scaleX = 2.53333333333333333;
    var scaleY = 2.53333333333333333;

    return {left: element.offsetLeft * scaleX,
            top: element.offsetTop * scaleY,
            width: boundingClientRect.width,
            height: boundingClientRect.height };

}

function toElementRegionUsingOffset(element) {

    // TODO: I could return this just as a box.
    return createRegion(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
}


// Take an element and convert it to a box by using its offsets.
function toElementRegion(element) {

    var clientRect = element.getBoundingClientRect()

    // TODO: I could return this just as a box.
    return createRegion(clientRect.left, clientRect.top, clientRect.right - clientRect.left, clientRect.bottom - clientRect.top);
}

// Return true if the first box is within the second box.
function isWithinBox(box,within) {

    return (box[0].x >= within[0].x &&
            box[0].y >= within[0].y &&
            box[1].x <= within[1].x &&
            box[1].y <= within[1].y);

}

function assertTrue(value) {
    if (!value)
        throw Error();
}

function test() {

    var within = createBox(createPoint(0,0),createPoint(100,100));
    var box0 = createBox(createPoint(0,0),createPoint(100,100));

    assertTrue(isWithinBox(box0, within));

    var box1 = createBox(createPoint(10,10),createPoint(20,20));
    assertTrue(isWithinBox(box1, within));


}

function extractPage(page) {

    var highlights = getHighlights(page);
    var image = getImage(page);

    return createPageExtract(highlights, image)

}

function createPageExtract(highlights, image) {
    return {highlights: highlights, image: image};
}

//
// textAnnotationRegion = {
//     left: 70,
//     top: 226.327,
//     width: 228.995,
//     height: 58.755
// };

/**
 * Get all annotations on the page for the given type and include their popup
 * annotations for extracting text from them.
 *
 * Types:
 *  - highlight   - text that is highlighted on the page. this also includes a form
 *                  of annotation that is a square rectangle that is highlighted.
 *  - square      - a rectangular region that is highlighted
 *  - text        - a small control with embedded text which is mostly hidden.
 *
 * Return an array of objects which have annotation and popup params.  
 */
function getAnnotationElements(page,type) {

    var clazz = type + "Annotation";

    var result = [];

    var annotationElements = page.querySelectorAll(".annotationLayer ." + clazz + ", .annotationLayer .popupAnnotation")

    for (var idx = 0; idx < annotationElements.length; ++idx) {

        var annotationElement = annotationElements[idx];

        if (annotationElement.getAttribute("class") === clazz) {

            var entry = { annotation: null, popup: null};
            entry.annotation = annotationElement;

            // now see if we have an associated popup by looking ahead to the
            // next annotation.

            var nextAnnotationElement = annotationElements[idx+1];

            if (nextAnnotationElement && nextAnnotationElement.getAttribute("class") === "popupAnnotation") {
                entry.popup = nextAnnotationElement;
            }

            result.push(entry);

        }

    }

    return result;

}


function doExtraction() {

    result = {
        pages: []
    };

    var pages = document.querySelectorAll(".page");

    for(var idx = 0; idx < pages.length; ++idx) {
        var page = pages[idx];

        var canvas = getPageCanvas(page);
        if (! canvas)
            continue;

        var pageExtract = extractPage(page);
        result.pages.push(pageExtract);

    }

    return result;
    
}

// FIXME: the popupAnnotation has to be extracted... basically, if a popup annotation
// proceeds a main annotation then the popup annotation is attached to that one.
// I don't think there is such a thing as a main annotation.


// FIXME: I now need to tell the rendered to go through and render all the pages
// and use promises as it doesn't actually do this by itself.

// FIXME: include support for notes and highlights of regions.

var result = doExtraction();

console.log(JSON.stringify(result, null, "  "));



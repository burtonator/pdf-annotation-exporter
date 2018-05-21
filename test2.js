// this just pulls out the element and tries to compute the correct bounding rect

function getHighlightImage(page, highlightBox) {

    // FIXME: the transform has a 'scale' that I have to factor into account..

    var canvas = getPageCanvas(page);

    var tmpCanvas = document.createElement("canvas");

    var destCtx = tmpCanvas.getContext('2d');

    var highlightRegion = boxToRegion(highlightBox);

    tmpCanvas.width  = highlightRegion.width;
    tmpCanvas.height = highlightRegion.height;

    // FIXME: the width and height are proper but the x and y are WAY off...

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

    var dataURL = tmpCanvas.toDataURL("image/webp", 1.0);
    logImage(dataURL);

    console.log("FIXME: data URL ", dataURL);

    return dataURL;

}

function boxToRegion(box) {
    return createRegion(box[0].x, box[0].y, box[1].x - box[0].x, box[1].y - box[0].y);
}


function getScaledElementRegion(element) {

    // the width and height here are what we want and don't need to be scaled.
    var boundingClientRect = highlightElement.getBoundingClientRect();

    //offsetLeft and offsetTop here are correct but DO need scaling.

    var scaleX = 2.666666666666666666666;
    var scaleY = 2.666666666666666666666;

    // FIXME: at 2.x scale the width is now wrong.

    return {left: element.offsetLeft * scaleX,
            top: element.offsetTop * scaleY,
            width: boundingClientRect.width,
            height: boundingClientRect.height };

}

var page0 = document.querySelectorAll(".page")[2];
var highlightElement = page0.querySelector(".highlightAnnotation");


//  ideal dimensions
var correctRect = {left: 95, top: 301, width: 305, height: 78}

var offsetRect = {offsetLeft: highlightElement.offsetLeft, offsetTop: highlightElement.offsetTop};

var scaledRect = getScaledElementRegion(highlightElement);

console.log("Found highlight element: ", highlightElement);

// FIXME: the width and the height here are correct...
console.log("highlightElement client rect bounding box: ", highlightElement.getBoundingClientRect());
console.log("highlightElement scaledRect: ", scaledRect);
console.log("highlightElement offsetRect: ", offsetRect);


console.log("correct should be: ", correctRect);

var image = getHighlightImage(page0,regionToBox(scaledRect));

console.log(image);
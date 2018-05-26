
// status:
//
// TODO : it looks like toDataURL on the FULL image PLUS my binary version are
// the same so I guess toDataURL isn't mangling it... so now my main task is
// going to be to figure out why the tmp canvas is ending up corrupted.  I should
// first figure out why the tmp canvas fails and then take a FULL copy of the main
// canvas, into the tmp canvas, and compare the output of both.

// NOPE... I'm wrong about this.. the canvas backing IS being downsized or something
// is monkeying with it!!!
//
// FIXME: PART of this problem is that I"m using offsetWidth and offsetHeight
// which are returning padding so I think I'm resizing the image when reading
// the data. but I might be wrong there ...

function _arrayBufferToBase64( buffer ) {
    let binary = '';
    let bytes = new Uint8Array( buffer );
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

/**
 * Convert the given canvas to a data URL and return it as a string.
 */
async function toDataURLHD(canvas) {

    // https://developer.mozilla.org/en-US/docs/Web/API/Blob

    return new Promise(function(resolve, reject) {

        console.log("FIXME2");

        canvas.toBlob(function (blob) {

            console.log("FIXME3");

            let reader = new FileReader();
            reader.addEventListener("loadend", function () {

                console.log("FIXME4");

                let encoded = _arrayBufferToBase64(reader.result);

                resolve("data:image/jpeg;base64," + encoded);

            });

            reader.readAsArrayBuffer(blob);

        }, "image/png", 1.0);
    });

}

async function testToDataURLHD() {

    // https://developer.mozilla.org/en-US/docs/Web/API/Blob

    // OK!!! so I think I figured out PART of the problem.  The toDataURL does
    // NOT actually capture the ENTIRE image.. the image is scaled down.

    let canvas = document.querySelector(".page canvas");

    let dataURL = await toDataURLHD(canvas);

    console.log("FIXME:999 " + await );

}

testToDataURLHD();


function testToBlob() {

    // https://developer.mozilla.org/en-US/docs/Web/API/Blob

    // OK!!! so I think I figured out PART of the problem.  The toDataURL does
    // NOT actually capture the ENTIRE image.. the image is scaled down.

    let canvas = document.querySelector(".page canvas");

    canvas.toBlob(function(blob) {
        console.log("got blob!: " + typeof blob);
        console.log(blob);

        let reader = new FileReader();
        reader.addEventListener("loadend", function() {
            // reader.result contains the contents of blob as a typed array

            // this is an ArrayBuffer...


            // ok.. we now hav the bytes in an array.
            console.log("len: " + reader.result.length);
            console.log(reader.result);
            let base64Encoded = _arrayBufferToBase64(reader.result);

            console.log("base64 string len: " + base64Encoded.length);

            let dataURL = "data:image/jpeg;base64," + base64Encoded;
            console.log(dataURL);

        });
        reader.readAsArrayBuffer(blob);

    }, "image/png", 1.0);

    // 1,082,219

}

testToBlob();


function debugCanvasSetup() {

    let canvas = document.querySelector(".page canvas");
    console.log("Canvas width: " + canvas.width);
    console.log("Canvas height: " + canvas.height);

    console.log("Canvas client width: " + canvas.clientWidth);
    console.log("Canvas client height: " + canvas.clientHeight);

    console.log("Canvas scroll width: " + canvas.scrollWidth);
    console.log("Canvas scroll height: " + canvas.scrollHeight);

    console.log(canvas.toDataURL("image/png", 1.0));

    // the image we're getting back is 1050 px wide BUG the source is 2050...
    // so that's going to end up breaking us.

}

debugCanvasSetup();

function createClonedCanvas() {

    // OK!!! so I think I figured out PART of the problem.  The toDataURL does
    // NOT actually capture the ENTIRE image.. the image is scaled down.

    let canvas = document.querySelector(".page canvas");

    let tmpCanvas = document.createElement("canvas");

    //document.body.appendChild(tmpCanvas);

    let tmpCtx = tmpCanvas.getContext('2d');

    //let region = {left: 0, top: 0, width: canvas.width, height: canvas.height};
    let region = {left: 0, top: 0, width: 500, height: 500};

    console.log("Drawing region:", region);

    tmpCanvas.width  = region.width;
    tmpCanvas.height = region.height;

    // //call its drawImage() function passing it the source canvas directly
    tmpCtx.drawImage(canvas,
                     region.left, region.top, region.width, region.height,
                     0, 0, region.width, region.height );

    tmpCanvas.setAttribute("width", region.width);
    tmpCanvas.setAttribute("height", region.height);
    tmpCanvas.setAttribute("style", `width: ${region.width}; height: ${region.height}; display: block;`);

    // FIXME: the problem is that the tmp canvas just is NOT being drawn...

    let link = document.createElement("a");
    link.textContent = 'canvas image';
    link.setAttribute("href", canvas.toDataURL('image/png', 1.0));

    document.body.appendChild(link)

    // console.log("canvas canvas: ", canvas.toDataURL());
    //
    // console.log("tmp canvas: ", tmpCanvas.toDataURL());

}

createClonedCanvas();


function drawOnMainCanvas() {

    // FIXME: this function works so I must be doing something wrong.

    let canvas = document.querySelector(".page canvas");

    //document.body.appendChild(tmpCanvas);

    let destCtx = canvas.getContext('2d');

    //let region = {left: 0, top: 0, width: canvas.width, height: canvas.height};
    let region = {left: 0, top: 0, width: 500, height: 500};

    console.log("Drawing region:", region);

    // FIXME: maybe it's not returning a CANVAS element and so the copy is failing...
    //tmpCtx.drawImage(canvas, 0, 0);

    // //call its drawImage() function passing it the source canvas directly
    destCtx.drawImage(canvas,
                     region.left, region.top, region.width, region.height,
                     10, 10, region.width, region.height );

    // tmpCanvas.setAttribute("width", region.width);
    // tmpCanvas.setAttribute("height", region.height);
    // tmpCanvas.setAttribute("style", `width: ${region.width}; height: ${region.height}; display: block;`);
    //
    // console.log(tmpCanvas.toDataURL());

}

createClonedCanvas();


async function testAsync() {
    return { key: "hello" };
}

testAsync().then(function(myval) {
    console.log("got it: " + myval);
});

const DEFAULT_SCALE = 4;

const CMAP_URL = '../node_modules/pdfjs-dist/cmaps/';
const CMAP_PACKED = true;

// state of the extraction as we move forward.
let state = {

    // the PDF page we loaded
    pdf: null,

    // the annotations we've extracted (one set per page).
    pageAnnotations: {
        pages: []
    }

};

/**
 * Create the promise within chrome, wait for the results, then return the
 * results throw an error to the caller. This allows puppet to push the promise
 * work into chrome as I'm fairly sure the promises won't work across process
 * boundaries.
 */
function waitForResults(src) {
    return waitForResultsFromBuffer(src, null);

}

function waitForResultsFromBuffer(src, buffer) {

    if(buffer) {
        // chromium is messing up the encoding here when using a byte array
        // and not sure why. This is just a workaround to bypass that problem.
        src.data = buffer.data;
    }

    return createExtractPromise(src).then(function(extraction) {
        return JSON.stringify(extraction, null, "  ");
    }, function (reason) {
        throw reason;
    });

}

/**
 * Force image smoothing on the underlying canvas.
 */
function fixCanvasImageSmoothing() {

    // NOTE: this doesn't seem to actually change our output in any way.  The
    // content would change to a different image but it doesn't seem to. It
    // might be an ordering issue as the canvas could already be written to
    // but I don't think that's the issue.  To test whether this works we
    // can just toggle imageSmoothingEnabled and see if the content changes
    // on disk in our tests.

    let canvas = document.querySelector("canvas");

    if (! canvas) {
        return;
    }

    let canvasCtx = canvas.getContext('2d');

    canvasCtx.imageSmoothingEnabled = false;

}

/**
 *
 * @param src The source of the document.  See getDocument in pdf.js as this
 * is a type object with numerous parameters.
 * https://github.com/mozilla/pdf.js/blob/master/src/display/api.js#L112
 *
 * @param options Specify the options for the extraction.
 * @returns {Promise<any>}
 */
async function createExtractPromise(src, options) {

    // FIXME: create a default options object, then copy missing keys from the
    // default options object to the options object.

    if ( ! options) {
        options = {
            noExtraction: false,
            scale: DEFAULT_SCALE,
            maxPages: 9999
        };
    }

    console.log("Running with options: ", options);

    return new Promise(function(resolve, reject) {

        let container = document.getElementById('viewerContainer');

        let pageIdx = 1;

        console.log("Going to render in: ", container);

        let pdfSinglePageViewer = new pdfjsViewer.PDFSinglePageViewer(
            {
                container: container,
                imageResourcesPath: "../node_modules/pdfjs-dist/web/images/",
                enableWebGL: true

            });

        pdfSinglePageViewer.currentScale = options.scale;

        container.addEventListener('pagesinit', function () {
            console.log("Setting current scale view");

            if(options.scale) {}
            pdfSinglePageViewer.currentScale = options.scale;

            fixCanvasImageSmoothing();
        });

        container.addEventListener('pagechanging', function () {
            console.log("Detected page changing.")
            fixCanvasImageSmoothing();
        });

        container.addEventListener('pagechange', function () {
            console.log("Detected page change.")
            fixCanvasImageSmoothing();

        });

        container.addEventListener('pagerendered', function () {
            console.log("Detected pagerendered.")
            fixCanvasImageSmoothing();

        });

        container.addEventListener('pageloaded', function () {
            console.log("Detected pageloaded.")
            fixCanvasImageSmoothing();

        });

        container.addEventListener('DOMContentLoaded', function () {
            console.log("Detected DOMContentLoaded.");
            fixCanvasImageSmoothing();
        });

        container.addEventListener('updateviewarea', function () {
            console.log("Detected updateviewarea.")
            fixCanvasImageSmoothing();

        });

        // FIXME: don't conditially add the eventListener... ALWAYs add the event
        // listener and then do this noExtraction test as a return.
        if (! options.noExtraction) {

            // NOTE: we have to wait for textlayerrendered because pagerendered
            // doesn't give us the text but pagerendered is called before
            // textlayerrendered anyway so this is acceptable.
            container.addEventListener('textlayerrendered', async function () {

                console.log("Received textlayerrendered...")

                console.log(`Page ${pdfSinglePageViewer.currentPageNumber} has been rendered..`);

                let extractionOptions = createExtractionOptions();

                let pageAnnotations = await doExtraction(extractionOptions);

                console.log("Received page annotations...");

                console.log("Found page annotations: ", pageAnnotations);

                state.pageAnnotations.pages.push(...pageAnnotations.pages);

                console.log("textlayerrendered: done.")

                if (pdfSinglePageViewer.currentPageNumber < Math.min(options.maxPages, state.pdf.numPages)) {

                    ++pageIdx;

                    console.log(`Changing to page number ${pageIdx}`)

                    pdfSinglePageViewer.currentPageNumber = pageIdx;

                } else {

                    console.log("Loaded final page (done).");

                    // we're done with our extraction.
                    resolve(state.pageAnnotations);

                }

                console.log("Received page annotations...done");


                console.log("Received textlayerrendered...done")

            });

        }

        console.log("Beginning extraction...")

        if ( src instanceof Object) {
            // enable cmaps support too.
            src.cMapUrl = CMAP_URL;
            src.cMapPacked = CMAP_PACKED;
        } else {
            console.warn("Not using CMAPS");
        }

        pdfjsLib.getDocument(src).then(function(pdf) {

            // Documentation on how to load PDFs into the single page
            // viewer is located here:
            //
            // https://mozilla.github.io/pdf.js/examples/

            state.pdf = pdf;

            let numPages = pdf.numPages;

            console.log(`PDF file loaded with ${numPages} pages`);

            // setDocument kicks off the event processing stream for
            // loading the pages.  It will only load the first one
            // and then we just page through them once we receive
            // the event that the first one has loaded.
            pdfSinglePageViewer.setDocument(pdf);

        }, function (reason) {
            console.error("Unable to load PDF: ", reason);
            reject(reason);
        });

        window.pdfSinglePageViewer = pdfSinglePageViewer;

        //return {container, pdfSinglePageViewer};

    });

}

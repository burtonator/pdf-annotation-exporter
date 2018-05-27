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
 *
 * @param src The source of the document.  See getDocument in pdf.js as this
 * is a type object with numerous parameters.
 * https://github.com/mozilla/pdf.js/blob/master/src/display/api.js#L112
 *
 * @param options Specify the options for the extraction.
 * @returns {Promise<any>}
 */
async function createExtractPromise(src, options) {

    if ( ! options) {
        options = {
            noExtraction: false,
            scale: DEFAULT_SCALE,
            maxPages: 9999
        };
    }

    return new Promise(function(resolve, reject) {

        let container = document.getElementById('viewerContainer');

        console.log("Going to render in: ", container);

        let pdfSinglePageViewer = new pdfjsViewer.PDFSinglePageViewer(
            {
                container: container,

                // TODO: bundle the images properly into the webapp dir.
                // imageResourcesPath: "images/"

                imageResourcesPath: "../node_modules/pdfjs-dist/web/images/"

            });

        container.addEventListener('pagesinit', function () {
            console.log("Setting current scale view");
            //pdfSinglePageViewer.currentScaleValue = 'page-width';
            pdfSinglePageViewer.currentScaleValue = options.scale;
        });

        container.addEventListener('pagechanging', function () {
            console.log("Detected page changing.")
        });

        container.addEventListener('pagechange', function () {
            console.log("Detected page change.")
        });

        container.addEventListener('pagerendered', function () {
            console.log("Detected pagerendered.")
        });

        container.addEventListener('pageloaded', function () {
            console.log("Detected pageloaded.")
        });

        container.addEventListener('DOMContentLoaded', function () {
            console.log("Detected DOMContentLoaded.")
        });



        // FIXME: this isn't the event I want as it doesn't actually work...
        // it will fire BEFORE textlayerrendered so I'm just constantly
        // switching pages.
        container.addEventListener('updateviewarea', function () {
            console.log("Detected updateviewarea.")

            if (pdfSinglePageViewer.currentPageNumber < Math.min(options.maxPages, state.pdf.numPages)) {

                //++pdfSinglePageViewer.currentPageNumber;

            } else {

                console.log("Loaded final page (done).");

                // we're done with our extraction.
                resolve(state.pageAnnotations);

            }

        });

        if (! options.noExtraction) {

            // FIXME: track down the "Warning: Setting up fake worker" message
            // because I could probably borrow this code to load my own blob
            // worker.

            // NOTE: we have to wait for textlayerrendered because pagerendered
            // doesn't give us the text but pagerendered is called before
            // textlayerrendered anyway so this is acceptable.
            container.addEventListener('textlayerrendered', function () {
                console.log("Detected textlayerrendered.")

                console.log(`Page ${pdfSinglePageViewer.currentPageNumber} has been rendered..`);

                let extractionOptions = createExtractionOptions();

                // FIXME: ok.. everything else was sync here.. as soon as
                // I added ONE async call this broke...  so the the way I'm changing
                // pages isn't threadsafe...

                // FIXME: ideally this would be await...
                doExtraction(extractionOptions).then(function (pageAnnotations) {

                    console.log("Found page annotations: ", pageAnnotations);

                    state.pageAnnotations.pages.push(...pageAnnotations.pages);

                    console.log("textlayerrendered: done.")

                })

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

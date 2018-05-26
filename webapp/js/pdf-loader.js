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
function createExtractPromise(src, options) {

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
            });

        container.addEventListener('pagesinit', function () {
            console.log("Setting current scale view");
            //pdfSinglePageViewer.currentScaleValue = 'page-width';
            pdfSinglePageViewer.currentScaleValue = options.scale;
        });

        if (! options.noExtraction) {

            // NOTE: we have to wait for textlayerrendered because pagerendered
            // doesn't give us the text but pagerendered is called before
            // textlayerrendered anyway so this is acceptable.
            container.addEventListener('textlayerrendered', function () {

                console.log("Page has been rendered..");

                let extractionOptions = createExtractionOptions();
                let pageAnnotations = doExtraction(extractionOptions);

                state.pageAnnotations.pages.push(...pageAnnotations.pages);

                console.log("Found page annotations: ", pageAnnotations);

                if (pdfSinglePageViewer.currentPageNumber < Math.min(options.maxPages, state.pdf.numPages)) {
                    ++pdfSinglePageViewer.currentPageNumber;
                } else {

                    // we're done with our extraction.
                    resolve(state.pageAnnotations);

                }

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

    });

}

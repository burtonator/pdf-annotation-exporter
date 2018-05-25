let state = {
    pdf: null,

    // the annotations we've extracted (one set per page).
    pageAnnotations: {
        pages: []
    }
};

extractPromise = createExtractPromise();

function getExtractPromise() {
    return extractPromise;
}

function createExtractPromise() {

    return new Promise(function(resolve, reject) {

        window.onload = function() {

            let container = document.getElementById('viewerContainer');

            console.log("Going to render in: ", container);

            let pdfSinglePageViewer = new pdfjsViewer.PDFSinglePageViewer(
                {
                    container: container,
                });

            container.addEventListener('pagesinit', function () {
                console.log("Setting current scale view");
                pdfSinglePageViewer.currentScaleValue = 'page-width';
            });

            container.addEventListener('pagerendered', function () {

                console.log("Page has been rendered..");

                let extractionOptions = createExtractionOptions();
                let pageAnnotations = doExtraction(extractionOptions);

                state.pageAnnotations.pages.push(...pageAnnotations.pages);

                console.log("Found page annotations: ", pageAnnotations);

                if (pdfSinglePageViewer.currentPageNumber < state.pdf.numPages) {
                    ++pdfSinglePageViewer.currentPageNumber;
                } else {

                    // we're done with our extraction.
                    resolve(state.pageAnnotations);

                }

            });

            console.log("Beginning extraction...")

            // Documentation on how to load PDFs into the single page
            // viewer is located here:
            //
            // https://mozilla.github.io/pdf.js/examples/

            // ok.. test-large WORKS but it might be TOO fast...

            // FIXME: enable cmaps support too.

            // FIXME: take the URL via parameter of some sort...
            let pdfURL = 'test.pdf';

            pdfjsLib.getDocument(pdfURL).then(function(pdf) {

                state.pdf = pdf;

                let numPages = pdf.numPages;

                console.log(`PDF file loaded with ${numPages} pages`);

                // setDocument kicks off the event processing stream for
                // loading the pages.  It will only load the first one
                // and then we just page through them once we receive
                // the event that the first one has loaded.
                pdfSinglePageViewer.setDocument(pdf);

            }, function (reason) {
                reject(reason);
            });
        };

    });

}

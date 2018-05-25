const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
var fileUrl = require('file-url');

// TODO: this will have to be fixed when running within docker.
var options = {executablePath: "/usr/bin/chromium-browser",
               args: ["--disable-web-security", " --allow-file-access-from-files", "--user-data-dir=/tmp"] };

(async() => {

    let pdfURL = "webapp/test.pdf";

    //let pdfURL = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

    // TODO: I could also try using a 'worker' in the future instead of a
    // readFileSync as it might be a bit faster but also more complicated because
    // I'm basically passing a whole object over into chromium.  I might be
    // able to make this work by passing a file URL and having the worker read
    // from it directly and pass it to the fetch() API which is what is complaining.

    let src = {};
    let data = null;

    if (pdfURL.startsWith("http:") || pdfURL.startsWith("https:")) {
        src.url = pdfURL;
    } else {
        data = fs.readFileSync(pdfURL);
    }

    // I will have to read it in as a blob, then send it into chrome.
    //
    // https://github.com/mozilla/pdf.js/blob/master/src/display/api.js#L112

    const browser = await puppeteer.launch(options);

    console.log(await browser.version());

    console.log("Loading extraction webapp");

    const page = await browser.newPage();

    page.on('console', msg => {
        // listen to the log messages in chromium headless.
        console.log(msg);
    });

    // for some reason absolute file URLs are required here.
    let indexPath = path.resolve("webapp/index.html");
    let indexURL = fileUrl(indexPath);

    await page.goto(indexURL, {waitUntil: 'load'});

    console.log("Waiting for results...");

    // the data is getting passed over incorrectly as an 'object' for src.data.
    let extraction = await page.evaluate(async (src,data) => {
        console.log("Loading src: " + src);
        return waitForResultsFromBuffer(src, data);
    }, src, data);

    // now how do we extract the resulting JSON from the page?

    console.log(extraction);

    await browser.close();

})();

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const fileUrl = require('file-url');
const getopt = require('node-getopt')
const process = require('process')

// TODO: this will have to be fixed when running within docker.
let options = {executablePath: "/usr/bin/chromium-browser",
               args: ["--disable-web-security", " --allow-file-access-from-files", "--user-data-dir=/tmp"] };

// TODO: I don't like this command line option handling.
opt = getopt.create([
                        ['v' , 'verbose'      , 'Enable verbose output of progress'],
                        ['h' , 'help'         , 'display this help']
                    ])
            .bindHelp()
            .parseSystem();

function isVerbose() {
    return opt.options.verbose;
}

function trace(msg, ...args) {
    // TODO: we should be using some sort of log framework for this so that
    // we can print to a better log stream.
    if (isVerbose()) {

        console.error(msg, args);
    }
}

(async() => {

    let pdfURL = opt.argv[0];

    // TODO: take an --output path optionally as it might be nice to print
    // progress to stdout as we are extracting pages

    // TODO: it might make sense to register an event listener within chromium
    // so puppeteer gets callbacks for each page so we can just stream annotations
    // to a file one at a time.

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

    trace(await browser.version());
    trace(await browser.userAgent());

    trace("Loading extraction webapp");

    const page = await browser.newPage();

    page.on('console', msg => {

        // listen to the log messages in chromium headless.
        // TODO: this output from chrome isn't the exact same console.log output
        // and we should reformat it so that it's identical.
        // _text and _args should be used here... but we're getting back JSHandle messages,
        // which are weird. TODO: the args should be handled WITHIN the webapp
        // and if we're in chrome headless, they should convert to strings, but
        // if  I'm using the webapp interactively, we should use the objects.

        trace(msg._text, msg._args);
    });

    let scriptPath = process.argv[1];
    let scriptDir = path.dirname(scriptPath);

    // for some reason absolute file URLs are required here.
    let indexPath = path.resolve(`${scriptDir}/../webapp/index.html`);
    let indexURL = fileUrl(indexPath);

    await page.goto(indexURL, {waitUntil: 'load'});

    trace("Waiting for results...");

    // the data is getting passed over incorrectly as an 'object' for src.data.
    let extraction = await page.evaluate(async (src,data) => {
        return waitForResultsFromBuffer(src, data);
    }, src, data);

    // now how do we extract the resulting JSON from the page?

    console.log(extraction);

    await browser.close();

})();

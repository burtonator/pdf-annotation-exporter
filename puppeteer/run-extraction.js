const puppeteer = require('puppeteer');
const fs = require('fs');

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

    let data = fs.readFileSync(pdfURL);

    src = { data };
    // src = pdfURL;

    // FIXME the only other way I can think of getting the data int here is to
    // file upload it... so I would need to figure out how to do that.


    // I will have to read it in as a blob, then send it...
    //
    // https://github.com/mozilla/pdf.js/blob/master/src/display/api.js#L112

    // disable-web-security

    const browser = await puppeteer.launch(options);

    console.log(await browser.version());

    console.log("Loading extraction webapp");

    const page = await browser.newPage();

    page.on('console', msg => {
        //console.log(JSON.stringify(msg));
        console.log(msg);
        //
        // for (let i = 0; i < msg.args.length; ++i)
        //     console.log(`${i}: ${msg.args[i]}`);
    });

    // page.evaluate(() => console.log('hello', 5, {foo: 'bar'}));

    // this never returns...

    // FIXME: we must be able to load from a relative URL here.

    // FIXME: won't wait until networkidle2 I think.. wait for page load is fine.
    await page.goto('file:///home/burton/projects/pdf-annotation-exporter/webapp/index.html', {waitUntil: 'networkidle2'});
    // await page.goto('about:blank', {waitUntil: 'networkidle2'});

    console.log("Waiting for results...");

    //page.evaluate(`waitForResults("${pdfURL}");`)

    // page.evaluate(`console.log('hello');`)
    // console.log("page loaded!");

    // FIXME: the fetch API refuses to work with this URL becuase its a file
    // URL and disabling CORS won't work. Plan B is to setup an HTTP server
    // but that's lame.

    //console.log("About to load: " + src);

    // the data is getting passed over incorrectly as an 'object' for src.data.
    let extraction = await page.evaluate(async (src,data) => {
        console.log("Loading src: " + src);
        return waitForResultsFromBuffer(src, data);
    }, src,data);

    // now how do we extract the resulting JSON from the page?

    console.log(extraction);

    await browser.close();

})();
//
//
//
// puppeteer.launch().then(async browser => {
//     const page = await browser.newPage();
//     page.on('console', msg => console.log(msg.text()));
//     await page.exposeFunction('md5', text =>
//         crypto.createHash('md5').update(text).digest('hex')
//     );
//     await page.evaluate(async () => {
//         // use window.md5 to compute hashes
//         const myString = 'PUPPETEER';
//         const myHash = await window.md5(myString);
//         console.log(`md5 of ${myString} is ${myHash}`);
//     });
//     await browser.close();
// });

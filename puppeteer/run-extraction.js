const puppeteer = require('puppeteer');

// TODO: this will have to be fixed when running within docker.
var options = {executablePath: "/usr/bin/chromium-browser"};

(async() => {
    const browser = await puppeteer.launch(options);
    console.log(await browser.version());

    await page.goto('webapp/index.html', {waitUntil: 'networkidle2'});

    console.log("page loaded!");

    // now how do we extract the resulting JSON from the page?

    //waitForResults("test.pdf");

    await browser.close();

})();

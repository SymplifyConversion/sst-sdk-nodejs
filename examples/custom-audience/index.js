const express = require('express');
const cookieParser = require('cookie-parser')
const sstsdk = require('@symplify-conversion/sst-sdk-nodejs');

const websiteID = process.env['SSTSDK_WEBSITEID'] || "1337";
const cdnHost = process.env['SSTSDK_CDNHOST'] || "fake-cdn.localhost.test";
const cdnPort = process.env['SSTSDK_CDNPORT'] || "3443"

const app = express();
const port = 3000;
app.use(cookieParser())

// When instatiating the SDK we can override the default dependencies,
// for this example we want to use a local fake CDN (see README.md),
// and we want the SDK to log to the console instead of being silent.
const overrides = {
    cdnBaseURL: `https://${cdnHost}:${cdnPort}`,
    log: console,
};

const sst = new sstsdk(websiteID, overrides);

// An express adapter for the CookieJar interface
function cookieJar(req, res) {
    return {
        get: (name) => req.cookies[name],
        set: (name, value) => res.cookie(name, value),
    }
}

function getGreeting(req, res) {

    let greeting = '';
    const language = req.query.lang || 'en';

    switch (language) {
        case 'sv':
            greeting = 'Hej världen';
            break;
        case 'en':
        default:
            greeting = 'Hello, World';
            break;
    }

    // N.B. that the `language` attribute must be present and a string, if the project audience uses it
    switch (sst.findVariation('greeting-enthusiasm', cookieJar(req, res), { language })) {
        case 'high':
            greeting += "!";
            break;
        default:
            greeting += ".";
            break;
    }

    return greeting;
}

app.get('/hello', (req, res) => {
    res.send(`<h2> ${getGreeting(req, res)} </h2>`);
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port} (websiteID: ${websiteID})`);
})

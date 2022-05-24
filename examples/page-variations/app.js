import express from 'express';
import cookieParser from 'cookie-parser';
import sstsdk from '@symplify-conversion/sst-sdk-nodejs';

import { frontPageView } from './frontpage.js';
import { contactView } from './contact.js';

const websiteID = process.env['SSTSDK_WEBSITEID'] || "42";
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

app.get('/', (_, res) => {
    res.send(frontPageView())
})

app.get('/contact', (req, res) => {
    res.send(contactView());
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port} (websiteID: ${websiteID})`);
})

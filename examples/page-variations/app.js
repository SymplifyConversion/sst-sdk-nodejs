import express from 'express';
import cookieParser from 'cookie-parser';
import sstsdk from '@symplify-conversion/sst-sdk-nodejs';

import { frontPageView } from './frontpage.js';
import { contactView } from './contact.js';
import { contactViewNew } from './contactNew.js';

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
        set: (name, value, expiresInDays) => {
            const expiresInMillis = expiresInDays * 24 * 3600 * 1000;
            const expires = new Date(Date.now() + expiresInMillis);
            res.cookie(name, value, { expires });
        },
    }
}

app.get('/', (_, res) => {
    res.send(frontPageView())
})

app.get('/contact', (req, res) => {
    // the contact us view handler is selected based on a server side test
    let contactViewVariant = contactView;
    switch (sst.findVariation('Contact Page Refresh', cookieJar(req, res))) {
        case 'New and Improved':
            contactViewVariant = contactViewNew;
            break;
        case 'Original':
        default:
            // we already selected the default view with the let declaration above
    }
    const html = contactViewVariant();
    res.send(html);
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port} (websiteID: ${websiteID})`);
})

const express = require('express');
const cookieParser = require('cookie-parser')
const sstsdk = require('../../lib');

const websiteID = process.env['SSTSDK_WEBSITEID'];
const cdnHost = process.env['SSTSDK_CDNHOST'] || "fake-cdn.localhost.test";
const cdnPort = process.env['SSTSDK_CDNPORT'] || "3443"

const app = express();
const port = 3000;
app.use(cookieParser())

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

function getDiscounts(req, res) {

    let discounts = [];

    switch (sst.findVariation('discounts', cookieJar(req, res))) {
        case 'large':
            discounts.push(0.25);
            break;
        case 'small':
            discounts.push(0.1);
            break;
    }

    return discounts;
}

app.get('/products/:sku', (req, res) => {

    const discounts = getDiscounts(req, res);

    res.send(`
        <h2> ${req.params.sku} </h2>
        <p> Price: $10${discounts.length == 0 ? '' : discounts.map(d => `, <span class="rebate">${d * 100}% off</span>`)} </p>
    `);
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port} (websiteID: ${websiteID})`);
})
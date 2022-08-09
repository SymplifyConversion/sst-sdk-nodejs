const express = require('express');
const cookieParser = require('cookie-parser')
const sstsdk = require('@symplify-conversion/sst-sdk-nodejs');

const websiteID = process.env['SSTSDK_WEBSITEID'] || "4711";
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
            res.cookie(name, value, { expires, domain: '.localhost.test' });
        },
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

app.get('/', (req, res) => {
    const productCatalog = [1, 2, 3, 4, 5];

    res.send(`
        <h1> Fake Webshop </h1>
        <ul>
            ${productCatalog.map(sku => `<li><a href="/products/${sku}">product ${sku}</a></li>`).join('')}
        </ul>
    `);
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port} (websiteID: ${websiteID})`);
})

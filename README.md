# Symplify Server-Side Testing SDK for Node.js

This is the Node.js implementation of the Symplify Server-Side Testing SDK.

## Changes

See [CHANGELOG.md](./CHANGELOG.md)

## Requirements

* [Node.js](https://nodejs.org/en/) 16.15.0 (LTS) or later

Should be compatible with any web framework, as long as it can get and set
cookies.

## Installing

```shell
npm i @symplify-conversion/sst-sdk-nodejs
```

## Usage

See [the examples directory](./examples/) for full code examples, the snippets
below have been extracted from the surrounding app code for brevity.

```js
// You need to import the SDK, of course.
const sstsdk = require('@symplify-conversion/sst-sdk-nodejs');

// The SDK should be setup once in a long runnning server, e.g. on startup with
// your other dependecies.
const sst = new sstsdk(process.env['SSTSDK_WEBSITEID']);

// To manage persistent allocations, the SDK needs to read and write cookies.
// Each web framework has a different way to get this functionality.
// This function `cookieJar` is one way to make an adapter for using the SDK
// when using the express and cookie-parser modules.
function cookieJar(domain, req, res) {
    return {
        get: (name) => req.cookies[name],
        set: (name, value) => res.cookie(name, value),
        set: (name, value, expiresInDays) => {
            const expires = new Date(Date.now() + expiresInDays * 24 * 3600 * 1000);
            res.cookie(name, value, { expires, domain });
        },
    }
}

// `getDiscounts` is a helper called by handlers in this example
function getDiscounts(req, res) {

    // When you want to select different code paths based on variations in an
    // A/B test, call `findVariation` (which needs the cookies adapter).
    switch (sst.findVariation('Discounts, May 2022', cookieJar('.example.com', req, res))) {
        case 'huge':
            return [0.25];
        case 'small':
            return [0.1];
    }

    // Always have a fall back. `findVariation` returns null if the visitor was
    // not allocated. The example project also has a variation named 'Original'
    // which we let fall through here.
    return [];
}

// In this imagined example, we assume views.productPage renders the HTML for
// a product details page, and shows any available discounts.
app.get('/products/:sku', (req, res) => {
    const discounts = getDiscounts(req, res);
    res.send(views.productPage(sku, discounts));
})
```

## SDK Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) or [RELEASING.md](./RELEASING.md).

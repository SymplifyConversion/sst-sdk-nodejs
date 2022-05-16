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

```js
// ...

// When initializing your server, setup the SDK
const sstsdk = require('@symplify-conversion/sst-sdk-nodejs');
const sst = new sstsdk(process.env['SSTSDK_WEBSITEID']);

// We need a "CookieJar" to manage visitor state,
// this example uses express with the cookie-parser lib.
function cookieJar(req, res) {
    return {
        get: (name) => req.cookies[name],
        set: (name, value) => res.cookie(name, value),
    }
}

// ...

function getDiscounts(req, res) {

    let discounts = [];

    switch (sst.findVariation('discounts', cookieJar(req, res))) {
        case 'huge':
            discounts.push(0.25);
            break;
        case 'small':
            discounts.push(0.1);
            break;
    }

    return discounts;
}

// ...

app.get('/products/:sku', (req, res) => {
    const discounts = getDiscounts(req, res);
    showProductPage(req, res, discounts);
})
```

## SDK Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) or [RELEASING.md](./RELEASING.md).

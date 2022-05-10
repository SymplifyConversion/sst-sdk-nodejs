# Symplify Server-Side Testing SDK for Node.js

This is the Node.js implementation of the Symplify Server-Side Testing SDK.

## Archived

This project was moved to https://github.com/SymplifyConversion/sst-sdk-nodejs

## Changes

See [CHANGELOG.md](./CHANGELOG.md)

## Requirements

* [Node.js](https://nodejs.org/en/) 16.15.0 (LTS) or later

## Installing

Coming soon...

## Usage

```js
// ...

// When initializing your server, setup the SDK
const sstsdk = require('@symplify/sst-sdk-nodejs');
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

### Setup

1. Clone this repository
3. Run npm install
4. Run the test suite to verify things are working

```shell
git clone git@github.com:SymplifyConversion/sst-sdk-nodejs.git
cd sst-sdk-nodejs
npm install
npm run test
```

### Testing with a local site

See [the examples](examples).

### Checklist for Changes

TODO

### Checklist for Releases

We practice [trunk based development](https://trunkbaseddevelopment.com) and
`main` is the branch we release from.

TODO

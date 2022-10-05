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
below have been extracted from their surrounding app code for brevity.

### Initializing

```js
// You need to import the SDK, of course.
const sstsdk = require('@symplify-conversion/sst-sdk-nodejs');

// The SDK should be setup once in a long runnning server process, e.g. on
// startup with your other dependecies.
const sst = new sstsdk(process.env['SSTSDK_WEBSITEID']);
```

### Finding a project variation

When you want to select different code paths based on variations in an
A/B test, call the `findVariation` method of the SDK client.

For example: if you have a webshop, with a function `views.productPage` which
renders HTML for a product details page, and shows any applicable discounts:

```js
app.get('/products/:sku', (req, res) => {
    const discounts = getDiscounts(req, res);
    res.send(views.productPage(sku, discounts));
})
```

`getDiscounts` has some business logic for identifying applicable discounts,
and here you decide to test different variations. You set up a test named
"Discounts, May 2022" with variations "Original", "huge", and "small", and
then use the SDK client to find the variation for each web request.

```js
function getDiscounts(req, res) {

    // `findVariation` needs a cookie adapter, see below in this README for example code.
    const cookies = cookieJar('.example.com', req, res);

    switch (sst.findVariation('Discounts, May 2022', cookies)) {
        case 'huge':
            return [0.25];
        case 'small':
            return [0.1];
    }

    // Always have a fall back. `findVariation` returns null if the visitor was
    // not allocated. This example project also has a variation named 'Original'
    // which we let fall through here.
    return [];
}
```

### Cookie integration

To ensure visitors get the same variation consistently, the SDK needs to
read and write cookies. Each web framework has a different way to get this
functionality. This function `cookieJar` is one way to make an adapter for
using the SDK when using the `express` and `cookie-parser` libraries.

```js
function cookieJar(domain, req, res) {
    return {
        get: (name) => req.cookies[name],
        set: (name, value, expiresInDays) => {
            const expires = new Date(Date.now() + expiresInDays * 24 * 3600 * 1000);
            res.cookie(name, value, { expires, domain });
        },
    }
}
```

### Custom audience

It's possible to limit for which requests/visitors a certain test project
should apply by using "audience" rules. See [Audiences.md](https://github.com/SymplifyConversion/sst-documentation/blob/main/docs/Audicences.md)
for details.

The audience is evaluated when your server calls `findVariation`, and if the
rules you have setup in the audience references "custom attributes" your
server must provide the values of these attributes for each request.

For example, you might want a test project to only apply for visitors from a
certain country. The audience can be configured in your project, using a
custom attribute "country", and then your server provides it when finding the
variation:

```js
function getDiscounts(req, res) {

    // `cookieJar` is an example function explained in this README
    const cookies = cookieJar('.example.com', req, res);
    // this code assumes you have a `lookupGeoIP` helper function in your project 
    const country = lookupGeoIP(req)?.country || "unknown";

    const customAttributes = { country };

    switch (sst.findVariation('Discounts, May 2022', cookies, customAttributes)) {
        case 'huge':
            return [0.25];
        case 'small':
            return [0.1];
    }

    // `findVariation` returns null if the project audience does not match for
    // a given request. We handle that by a fallthrough return here.
    return [];
}
```

## SDK Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) or [RELEASING.md](./RELEASING.md).

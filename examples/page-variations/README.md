# page-variations

This is an example server built with https://expressjs.com.

Using frontend A/B testing SDKs to test different layouts can have some
drawbacks. The variations often depend on modifying an original page, and there
can be flickering when the content is changed after loading.

By using server side testing, these drawbacks can be avoided.

## Dependencies

See [the examples README](../README.md). The code below assumes the suggested
host and ports are used, modify as needed.

## Running

```shell
npm install
export SSTSDK_CDNHOST=fake-cdn.localhost.test
export SSTSDK_CDNPORT=3443
npm run start
```

Visit http://localhost:3000/ in your browser to use the test page.

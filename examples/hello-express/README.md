# hello-express

This is an example server built with https://expressjs.com.

It is a somewhat minimal example using the server side testing SDK.

## Dependencies

See [the examples README](../README.md). The code below assumes the suggested
host and ports are used, modify as needed.

## Running

```shell
export SSTSDK_CDNHOST=fake-cdn.localhost.test
export SSTSDK_CDNPORT=3443
npm run start
```

```shell
watch curl --silent http://localhost:3000/products/1337
```

The curl output will start to vary as soon as the sst configuration has been loaded.

You can test it with cookies as well, to see the consistent variation allocation:

You will need a hostname in the .localhost.test domain for your site, e.g.
hello-express-example.localhost.test in order to use the example code without
changes. Add this to your hosts-file.

```shell
watch curl --silent --cookie cookies.curl.txt --cookie-jar cookies.curl.txt http://hello-express-example.localhost.test:3000/products/1337
```

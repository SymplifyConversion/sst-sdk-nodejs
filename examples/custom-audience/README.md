# custom-audience

This is an example server built with https://expressjs.com.

It is a somewhat minimal example using the server side testing SDK with a custom
audience.

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

```shell
watch curl --silent 'http://localhost:3000/hello?lang=en'
```

The curl output will start to vary as soon as the sst configuration has been loaded.

Passing any `lang` parameter other than "en" makes the custom audience not
match, meaning you should not see any variation.

You can test it with cookies as well, to see the consistent variation allocation:

```shell
watch curl --silent --cookie cookies.curl.txt --cookie-jar cookies.curl.txt 'http://localhost:3000/hello?lang=en'
```

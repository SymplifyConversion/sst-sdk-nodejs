# Server Examples

## Dependencies

The example packages depend on the parent package being built. Before running
the examples you need to run `npm run build` in the repository root.

They also depend on a fake CDN for the configuration JSON, so start that first
as well. You can serve the files however you want (over HTTPS), but a Caddyfile
is included to serve the example configurations using [Caddy] with self-signed
certificates for TLS.

```shell
export SSTSDK_CDNHOST=fake-cdn.localhost.test
export SSTSDK_CDNPORT=3443
echo 127.0.0.1 $SSTSDK_CDNHOST >> /etc/hosts
cd examples/fakeCDN
caddy run
```

[Caddy]: https://caddyserver.com

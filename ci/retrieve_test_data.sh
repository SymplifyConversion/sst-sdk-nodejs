#! /bin/sh

set -xe

# Fetch all the test files from the sst-documentation repo
cd test
curl -sO https://raw.githubusercontent.com/SymplifyConversion/sst-documentation/main/test/audience_attributes_spec.json
curl -sO https://raw.githubusercontent.com/SymplifyConversion/sst-documentation/main/test/audience_spec.json
curl -sO https://raw.githubusercontent.com/SymplifyConversion/sst-documentation/main/test/audience_tracing_spec.json
curl -sO https://raw.githubusercontent.com/SymplifyConversion/sst-documentation/main/test/audience_validation_spec.json
curl -sO https://raw.githubusercontent.com/SymplifyConversion/sst-documentation/main/test/sdk_config.json
curl -sO https://raw.githubusercontent.com/SymplifyConversion/sst-documentation/main/test/sdk_config_privacy2.json
curl -sO https://raw.githubusercontent.com/SymplifyConversion/sst-documentation/main/test/test_cases.json
cd -
exit 0
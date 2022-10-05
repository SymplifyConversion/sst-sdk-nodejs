import fs from "fs";
import { SymplifySDK } from "../src/client";
import { constantHTTP, makeCookieJar } from "./helpers";

describe("SymplifySDK client", () => {
    // The JSON file is being fetched when doing the test by ./ci/retrieve_test_data.sh
    const testData = JSON.parse(fs.readFileSync("test/test_cases.json").toString());

    for (const t of testData) {
        if (t.skip) {
            console.log(`skipping test '${t.test_name}'`);
            continue;
        }
        test(t.test_name, async () => {
            const cookies = makeCookieJar();
            const configJSON = fs.readFileSync("test/" + t.sdk_config).toString();
            const httpGET = constantHTTP(configJSON);
            for (const [name, value] of Object.entries(t.cookies || {})) {
                cookies.set(name, decodeURIComponent("" + value), 90);
            }

            const sdk = new SymplifySDK(t.website_id, { httpGET });
            await sdk.ready;
            const variation = sdk.findVariation(
                t.test_project_name,
                cookies,
                t.audience_attributes,
            );
            sdk.stop();

            const sgCookies = JSON.parse(cookies.get("sg_cookies") || "{}");

            const checkCookieProps = t.expect_sg_cookie_properties_match || {};
            for (const [keypath, expected] of Object.entries(checkCookieProps)) {
                const leaf = keypath.split("/").reduce((acc, p) => (acc || {})[p], sgCookies);
                if (typeof expected == "string") {
                    const reCookie = new RegExp(expected);
                    expect(leaf || "null").toMatch(reCookie);
                } else {
                    // ?? is for undefined
                    expect(leaf ?? null).toStrictEqual(expected);
                }
            }

            const checkExtraCookieValues = t.expect_extra_cookies || {};
            for (const [name, value] of Object.entries(checkExtraCookieValues)) {
                expect(cookies.get(name)).toStrictEqual(value);
            }

            const reVariation = new RegExp(t.expect_variation_match);
            expect(variation || "null").toMatch(reVariation);
        });
    }
});

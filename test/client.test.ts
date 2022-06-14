import fs from "fs";
import { SymplifySDK } from "../src/client";
import { constantHTTP, makeCookieJar } from "./helpers";

describe("SymplifySDK client", () => {
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
                cookies.set(name, "" + value);
            }

            const sdk = new SymplifySDK(t.website_id, { httpGET });
            await sdk.ready;
            const variation = sdk.findVariation(t.test_project_name, cookies);
            sdk.stop();

            const sgCookies = JSON.parse(decodeURIComponent(cookies.get("sg_cookies") || "{}"));

            for (const [keypath, expected] of Object.entries(t.expect_sg_cookie_properties_match)) {
                const leaf = keypath.split("/").reduce((acc, p) => (acc || {})[p], sgCookies);
                if (typeof expected == "string") {
                    const reCookie = new RegExp(expected);
                    expect(leaf || "null").toMatch(reCookie);
                } else {
                    // ?? is for undefined
                    expect(leaf ?? null).toStrictEqual(expected);
                }
            }

            const reVariation = new RegExp(t.expect_variation_match);
            expect(variation || "null").toMatch(reVariation);
        });
    }
});

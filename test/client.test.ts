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
            cookies.set("sg_cookies", t.sg_cookies);

            const sdk = new SymplifySDK(t.website_id, { httpGET });
            await sdk.ready;
            const variation = sdk.findVariation(t.test_project_name, cookies);
            sdk.stop();

            const sgCookies = JSON.parse(decodeURIComponent(cookies.get("sg_cookies") || "{}"));

            for (const [keypath, regex] of Object.entries(t.expect_sg_cookie_properties_match)) {
                const reCookie = new RegExp(regex as string);
                const leaf = keypath.split("/").reduce((acc, p) => (acc || {})[p], sgCookies);
                expect("" + (leaf || "null")).toMatch(reCookie);
            }

            const reVariation = new RegExp(t.expect_variation_match);
            expect(variation || "null").toMatch(reVariation);
        });
    }
});

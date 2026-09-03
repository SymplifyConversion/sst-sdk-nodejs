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

    test("calling findVariation repeatedly in preview does not duplicate aud_p", async () => {
        const cookies = makeCookieJar();
        cookies.set(
            "sg_cookies",
            decodeURIComponent(
                "{%2210001%22:{%22visid%22:%22foobar%22%2C%22pmr%22:1001%2C%22pmv%22:10012}%2C%22_g%22:1}",
            ),
            90,
        );
        const configJSON = fs.readFileSync("test/sdk_config.json").toString();
        const httpGET = constantHTTP(configJSON);

        const sdk = new SymplifySDK("10001", { httpGET });
        await sdk.ready;

        // Simulates a caller invoking findVariation multiple times per page
        // view (e.g. a component re-rendering) while previewing a project.
        sdk.findVariation("test project", cookies, {});
        sdk.findVariation("test project", cookies, {});
        sdk.findVariation("test project", cookies, {});
        sdk.stop();

        const sgCookies = JSON.parse(cookies.get("sg_cookies") || "{}");
        expect(sgCookies["10001"].aud_p).toStrictEqual([1001]);
    });
});

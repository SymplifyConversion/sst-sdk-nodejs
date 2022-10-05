import fs from "fs";

import { Audience, primitives } from "../src/audience";
import { traceEval } from "../src/rules-engine";

describe("Audience validation", () => {
    // The JSON file is being fetched when doing the test by ./ci/retrieve_test_data.sh
    const testData = JSON.parse(fs.readFileSync("test/audience_validation_spec.json").toString());

    for (const s of testData) {
        if (s.skip) {
            console.log(`skipping test '${s.suite_name}' (because ${s.skip})`);
            continue;
        }

        describe(s.suite_name, () => {
            for (const i in s.test_cases) {
                const t = s.test_cases[i];
                const desc = `expression JSON '${t.audience_string}' should error with '${t.expect_error}'`;
                test(desc, () => {
                    expect(() => new Audience(t.audience_string)).toThrow(t.expect_error);
                });
            }
        });
    }
});

/**
 * These test cases are defined in JSON to enable portable repeatable testing for multiple SDKs.
 */
describe("Audience expression compatibility tests", () => {
    // The JSON file is being fetched when doing the test by ./ci/retrieve_test_data.sh
    const testData = JSON.parse(fs.readFileSync("test/audience_spec.json").toString());

    for (const s of testData) {
        if (s.skip) {
            console.log(`skipping test '${s.suite_name}' (because ${s.skip})`);
            continue;
        }

        describe(s.suite_name, () => {
            for (const i in s.test_cases) {
                const t = s.test_cases[i];
                const audienceJSON = JSON.stringify(t.audience_json);
                const desc = t.expect_error
                    ? `expression ${audienceJSON} should error with '${t.expect_error}'`
                    : `expression ${audienceJSON} should be ${t.expect_result}`;
                test(desc, () => {
                    const audience = new Audience(audienceJSON);
                    const actual = audience.eval({ attributes: {} });

                    if (t.expect_error) {
                        if (typeof actual === "boolean") {
                            fail("expected error, got some result");
                        }
                        expect(actual.message).toBe(t.expect_error);
                    } else {
                        expect(actual).toBe(t.expect_result);
                    }
                });
            }
        });
    }
});

/**
 * These test cases are defined in JSON to enable portable repeatable testing for multiple SDKs.
 */
describe("Audience attributes compatibility tests", () => {
    const testData = JSON.parse(fs.readFileSync("test/audience_attributes_spec.json").toString());

    for (const s of testData) {
        if (s.skip) {
            console.log(`skipping test '${s.suite_name}' (because ${s.skip})`);
            continue;
        }

        describe(s.suite_name, () => {
            const audienceJSON = JSON.stringify(s.audience_json);
            const audience = new Audience(audienceJSON);

            for (const i in s.test_cases) {
                const t = s.test_cases[i];
                const attributes = t.attributes;
                const desc = t.expect_error
                    ? `attributes ${JSON.stringify(attributes)} should give err '${t.expect_error}'`
                    : `attributes ${JSON.stringify(attributes)} should give ${t.expect_result}`;
                test(desc, () => {
                    const actual = audience.eval({ attributes });

                    if (t.expect_error) {
                        if (typeof actual === "boolean") {
                            fail("expected error, got some result");
                        }
                        expect(actual.message).toBe(t.expect_error);
                    } else {
                        expect(actual).toBe(t.expect_result);
                    }
                });
            }
        });
    }
});

/**
 * These test cases are defined in JSON to enable portable repeatable testing for multiple SDKs.
 *
 * Part of the audience test suite because of the `primitives` dependency.
 */
describe("Rules expression tracing compatibility tests", () => {
    // The JSON file is being fetched when doing the test by ./ci/retrieve_test_data.sh
    const testData = JSON.parse(fs.readFileSync("test/audience_tracing_spec.json").toString());

    for (const { test_name, skip, rules, attributes, expect_trace } of testData) {
        if (skip) {
            console.log(`skipping test '${test_name}' (because ${skip})`);
            continue;
        }

        test(test_name, () => {
            const actualTrace = traceEval(rules, { attributes }, primitives);
            expect(actualTrace).toStrictEqual(expect_trace);
        });
    }
});

import { findVariationForVisitor, ProjectConfig } from "../src/project";

const TEST_PROJECT: ProjectConfig = {
    id: 4711,
    name: "discount",
    state: "active",
    variations: [
        { id: 42, name: "original", state: "active", weight: 67 },
        { id: 1337, name: "massive", state: "active", weight: 33 },
    ],
};

describe("Variation allocation", () => {
    /** a nonsense variation to help handling nulls in the test code */
    const sentinelVariation = { id: "nope" };

    test("is weighted", () => {
        const variation = findVariationForVisitor(TEST_PROJECT, "foobar") || sentinelVariation;
        expect(variation.id).toBe(42);
    });

    test("is distributed", () => {
        const variation = findVariationForVisitor(TEST_PROJECT, "Fabian") || sentinelVariation;
        expect(variation.id).toBe(1337);
    });

    test("returns no variation for empty visitor ID", () => {
        const originalID = Math.ceil(Math.random() * 1000);
        const variationID = 1000 + Math.ceil(Math.random() * 1000);
        const testProject: ProjectConfig = {
            id: 10000,
            name: "test project",
            state: "active",
            variations: [
                { id: originalID, name: "Original", state: "active", weight: 50 },
                { id: variationID, name: "Variation", state: "active", weight: 50 },
            ],
        };

        const variation = findVariationForVisitor(testProject, "") || sentinelVariation;
        expect(variation).toBe(sentinelVariation);
    });

    test("handles long visitor IDs", () => {
        // eslint-disable-next-line prettier/prettier
        const visid = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
        const variation = findVariationForVisitor(TEST_PROJECT, visid) || sentinelVariation;
        expect(variation.id).toBe(1337);
    });

    test("handles empty allocations", () => {
        const testProject: ProjectConfig = {
            id: 4711,
            name: "discount",
            state: "active",
            variations: [
                { id: 42, name: "original", state: "active", weight: 25 },
                { id: 1337, name: "massive", state: "paused", weight: 25 },
                { id: 11111, name: "extra", state: "active", weight: 25 },
            ],
        };
        function findVariation(visid: string) {
            return findVariationForVisitor(testProject, visid) || sentinelVariation;
        }

        // "aosidb" maps to 01-25, which is active variation 42
        expect(findVariation("aosidb").id).toBe(42);
        // "banana" maps to 26-50, which is paused variation 1337
        expect(findVariation("banana").id).toBe(sentinelVariation.id);
        // "visitor" maps to 51-75, which is active variation 11111
        expect(findVariation("visitor").id).toBe(11111);
        // "asidub" maps to 75-100, which is outside any variation
        expect(findVariation("asidub").id).toBe(sentinelVariation.id);
    });

    test("doesn't allocate in paused projects", () => {
        const testProject: ProjectConfig = {
            id: 4711,
            name: "discount",
            state: "paused",
            variations: [
                { id: 42, name: "original", state: "active", weight: 25 },
                { id: 1337, name: "massive", state: "paused", weight: 25 },
                { id: 11111, name: "extra", state: "active", weight: 25 },
            ],
        };
        expect(findVariationForVisitor(testProject, "anyone")).toBe(null);
    });
});

import { findVariationForVisitor, ProjectConfig } from "../src/project";

const TEST_PROJECT: ProjectConfig = {
    id: 4711,
    name: "discount",
    state: "active",
    variations: [
        {
            id: 42,
            name: "original",
            state: "active",
            weight: 2,
        },
        {
            id: 1337,
            name: "massive",
            state: "active",
            weight: 1,
        },
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
                {
                    id: originalID,
                    name: "Original",
                    state: "active",
                    weight: 1,
                },
                {
                    id: variationID,
                    name: "Variation",
                    state: "active",
                    weight: 1000,
                },
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
});

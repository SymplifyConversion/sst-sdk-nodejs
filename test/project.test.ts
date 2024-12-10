import { NullLogger } from "../src/logger";
import { doesAudienceApply, parseConfigJSON, ProjectConfig, restoreAudience } from "../src/project";
import { List } from "../src/rules-engine";

describe("SymplifyConfig", () => {
    test("can parse plain JSON", () => {
        expect(parseConfigJSON(CONFIG_JSON).updated).toBe(1648466732);
    });

    test("can pasre JSON with a UTF-8 BOM", () => {
        expect(parseConfigJSON(CONFIG_JSON_WITH_UTF8_BOM).updated).toBe(1648466732);
    });

    test("can parse JSON with a UTF-16 BOM", () => {
        expect(parseConfigJSON(CONFIG_JSON_WITH_UTF16_BOM).updated).toBe(1648466732);
    });
});

describe("ProjectConfig", () => {
    test("can restore audience from rules", () => {
        const cfg = testConfig(["all"]);
        expect(cfg.audience).toBeUndefined();
        restoreAudience(cfg);
        expect(cfg.audience).toBeDefined();
    });

    test("can tell if audience is true", () => {
        const cfg = testConfig(["all"]);
        restoreAudience(cfg);
        const result = doesAudienceApply(cfg, {}, new NullLogger());
        expect(result).toBe(true);
    });

    test("can tell if audience is false", () => {
        const cfg = testConfig(["any"]);
        restoreAudience(cfg);
        const result = doesAudienceApply(cfg, {}, new NullLogger());
        expect(result).toBe(false);
    });

    test("treats no audience as true", () => {
        const cfg = testConfig();
        restoreAudience(cfg);
        const result = doesAudienceApply(cfg, {}, new NullLogger());
        expect(result).toBe(true);
    });
});

const CONFIG_JSON = `{
    "updated": 1648466732,
    "projects": [
        {
            "id": 4711,
            "name": "discount",
            "variations": [
                {
                    "id": 42,
                    "name": "original",
                    "weight": 10
                },
                {
                    "id": 1337,
                    "name": "huge",
                    "weight": 2
                },
                {
                    "id": 9999,
                    "name": "small",
                    "weight": 1
                }
            ]
        }
    ]
}`;

const CONFIG_JSON_WITH_UTF8_BOM = "\xEF\xBB\xBF" + CONFIG_JSON;

const CONFIG_JSON_WITH_UTF16_BOM = "\uFEFF" + CONFIG_JSON;

function testConfig(audience_rules?: List): ProjectConfig {
    return {
        id: 9999,
        name: "test project please ignore",
        state: "active",
        audience_rules,
        variations: [
            {
                id: 99991,
                name: "Original",
                state: "active",
                weight: 100,
                distribution: 100,
            },
        ],
    };
}

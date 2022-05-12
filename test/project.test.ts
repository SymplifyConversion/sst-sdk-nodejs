import { parseConfigJSON } from "../src/project";

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

const benny = require("benny");

const { Audience } = require("../lib/audience");

const allAttributesMatch = () => ({
    attributes: {
        bonusPoints: 1000,
        urlPath: "/contact",
        country: "Sweden",
    },
});

function isTruthy(aud, env) {
    return aud.eval(env) == true;
}

const simpleAudience = new Audience(
    JSON.stringify([
        "all",
        [">=", ["number-attribute", "bonusPoints"], 1000],
        ["contains", ["string-attribute", "urlPath"], "contact"],
        ["equals", ["string-attribute", "country"], "Sweden"],
    ]),
);

const complexAudienceAny = new Audience(
    JSON.stringify([
        "any",
        [
            "all",
            [">=", ["number-attribute", "bonusPoints"], 123],
            ["equals", ["string-attribute", "country"], "Sweden"],
        ],
        [
            "all",
            [">=", ["number-attribute", "bonusPoints"], 452],
            ["equals", ["string-attribute", "country"], "Norway"],
        ],
        [
            "all",
            [">=", ["number-attribute", "bonusPoints"], 1000],
            ["contains", ["string-attribute", "urlPath"], "contact"],
            ["equals", ["string-attribute", "country"], "Sweden"],
        ],
    ]),
);

const complexAudienceAll = new Audience(
    JSON.stringify([
        "all",
        [
            "all",
            [">=", ["number-attribute", "bonusPoints"], 1000],
            ["contains", ["string-attribute", "urlPath"], "contact"],
            ["equals", ["string-attribute", "country"], "Sweden"],
        ],
        [
            "all",
            ["equals", ["string-attribute", "country"], "Sweden"],
            [">=", ["number-attribute", "bonusPoints"], 1000],
            ["contains", ["string-attribute", "urlPath"], "contact"],
        ],
        [
            "all",
            ["contains", ["string-attribute", "urlPath"], "contact"],
            [">=", ["number-attribute", "bonusPoints"], 1000],
            ["equals", ["string-attribute", "country"], "Sweden"],
        ],
        [
            "any",
            ["contains", ["string-attribute", "urlPath"], "contact"],
            [">=", ["number-attribute", "bonusPoints"], 100],
            ["equals", ["string-attribute", "country"], "Japan"],
        ],
    ]),
);

const superComplexAudience = new Audience(
    JSON.stringify([
        "all",
        [
            "all",
            [">=", ["number-attribute", "bonusPoints"], 1000],
            ["contains", ["string-attribute", "urlPath"], "contact"],
            ["equals", ["string-attribute", "country"], "Sweden"],
        ],
        [
            "any",
            [
                "all",
                [">=", ["number-attribute", "bonusPoints"], 123],
                ["equals", ["string-attribute", "country"], "Sweden"],
            ],
            [
                "all",
                [">=", ["number-attribute", "bonusPoints"], 452],
                ["equals", ["string-attribute", "country"], "Norway"],
            ],
            [
                "all",
                [">=", ["number-attribute", "bonusPoints"], 1000],
                [
                    "all",
                    ["equals", ["string-attribute", "country"], "Sweden"],
                    [">=", ["number-attribute", "bonusPoints"], 1000],
                    ["contains", ["string-attribute", "urlPath"], "contact"],
                ],
                ["contains", ["string-attribute", "urlPath"], "contact"],
                ["equals", ["string-attribute", "country"], "Sweden"],
            ],
        ],
        [
            "all",
            ["equals", ["string-attribute", "country"], "Sweden"],
            [">=", ["number-attribute", "bonusPoints"], 1000],
            ["contains", ["string-attribute", "urlPath"], "contact"],
        ],
        [
            "all",
            ["contains", ["string-attribute", "urlPath"], "contact"],
            [
                "any",
                [
                    "all",
                    [">=", ["number-attribute", "bonusPoints"], 123],
                    ["equals", ["string-attribute", "country"], "Sweden"],
                ],
                [
                    "all",
                    [">=", ["number-attribute", "bonusPoints"], 452],
                    ["equals", ["string-attribute", "country"], "Norway"],
                ],
            ],
            ["equals", ["string-attribute", "country"], "Sweden"],
        ],
        [
            "any",
            ["contains", ["string-attribute", "urlPath"], "contact"],
            [">=", ["number-attribute", "bonusPoints"], 100],
            ["equals", ["string-attribute", "country"], "Japan"],
        ],
    ]),
);

const attrs = allAttributesMatch();

//
// This is slightly abusing benny, but informative nonetheless
//

function bench(name, variants) {
    const fns = [];
    for (const [name, code] of Object.entries(variants)) {
        fns.push(benny.add(name, code));
    }
    fns.push(
        benny.cycle(),
        benny.complete(),
        benny.save({ file: name, version: "1.0.0" }),
        benny.save({ file: name, format: "chart.html" }),
    );
    benny.suite(name, ...fns);
}

bench("typical-audience-true", {
    "no env alloc": () => {
        return isTruthy(simpleAudience, attrs);
    },
    "env alloc": () => {
        return isTruthy(simpleAudience, allAttributesMatch());
    },
});

bench("complex-audience-true", {
    "complex all, env alloc": () => {
        return isTruthy(complexAudienceAll, allAttributesMatch());
    },
    "complex any, env alloc": () => {
        return isTruthy(complexAudienceAny, allAttributesMatch());
    },
    "super complex, env alloc": () => {
        return isTruthy(superComplexAudience, allAttributesMatch());
    },
});

const noAttributes = () => ({
    attributes: {},
});

const allAttributesNoMatchFirst = () => ({
    attributes: {
        bonusPoints: 999,
        urlPath: "/contact",
        country: "Sweden",
    },
});

const allAttributesNoMatchLast = () => ({
    attributes: {
        bonusPoints: 1000,
        urlPath: "/contact",
        country: "Norway",
    },
});

const empty = noAttributes();
const badFirst = allAttributesNoMatchFirst();
const badLast = allAttributesNoMatchLast();

bench("typical-audience-false", {
    "immediate error, no env alloc": () => {
        return isTruthy(simpleAudience, empty);
    },
    "immediate error, env alloc": () => {
        return isTruthy(simpleAudience, noAttributes());
    },
    "first false, no env alloc": () => {
        return isTruthy(simpleAudience, badFirst);
    },
    "last false, no env alloc": () => {
        return isTruthy(simpleAudience, badLast);
    },
    "first false, env alloc": () => {
        return isTruthy(simpleAudience, allAttributesNoMatchFirst());
    },
    "last false, env alloc": () => {
        return isTruthy(simpleAudience, allAttributesNoMatchLast());
    },
});

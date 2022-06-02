import { Atom, Audience, AudienceError } from "../src/audience";

function evalAudience(json: string): boolean | AudienceError {
    return new Audience(json).eval({ attributes: {} });
}

function error(message: string): AudienceError {
    return { message };
}

function testIs(exprJSON: string, expected: Atom | AudienceError) {
    const desc = `${exprJSON} should be ${JSON.stringify(expected)}`;
    test(desc, () => {
        expect(evalAudience(exprJSON)).toStrictEqual(expected);
    });
}

describe("Audience string primitives", () => {
    testIs('["equals", "", ""]', true);
    testIs('["equals", "foo", ""]', false);
    testIs('["equals", "", "bar"]', false);
    testIs('["equals", "foo", "foo"]', true);
    testIs('["equals", "foo", "bar"]', false);

    testIs('["contains", "foo", ""]', true);
    testIs('["contains", "", "foo"]', false);
    testIs('["contains", "foo", "o"]', true);
    testIs('["contains", "foo", "a"]', false);

    testIs('["matches", "foo", ""]', true);
    testIs('["matches", "", "foo"]', false);
    testIs('["matches", "foo", "(bar|foo)"]', true);
    testIs('["matches", "foo", "aa*"]', false);

    testIs('["matches", 2, "2"]', error("expected string arguments"));
    testIs('["equals", "", false]', error("expected string arguments"));
    testIs('["contains", 4711, 1]', error("expected string arguments"));
});

describe("Audience number primitives", () => {
    testIs('["==", 4711, 1337]', false);
    testIs('["==", 1337, 1337]', true);
    testIs('["==", 42, 1337]', false);

    testIs('["<", 4711, 1337]', false);
    testIs('["<", 1337, 1337]', false);
    testIs('["<", 42, 1337]', true);

    testIs('["<=", 4711, 1337]', false);
    testIs('["<=", 1337, 1337]', true);
    testIs('["<=", 42, 1337]', true);

    testIs('[">", 4711, 1337]', true);
    testIs('[">", 1337, 1337]', false);
    testIs('[">", 42, 1337]', false);

    testIs('[">=", 4711, 1337]', true);
    testIs('[">=", 1337, 1337]', true);
    testIs('[">=", 42, 1337]', false);

    testIs('["==", 2, "2"]', error("expected number arguments"));
    testIs('["<", "", false]', error("expected number arguments"));
    testIs('["<=", 1, false]', error("expected number arguments"));
    testIs('[">", "fo", "ba"]', error("expected number arguments"));
    testIs('[">=", true, 1]', error("expected number arguments"));
});

describe("Audience boolean primitives", () => {
    testIs('["all", true]', true);
    testIs('["all", true, true, true]', true);
    testIs('["all"]', true);
    testIs('["all", false, true, true]', false);
    testIs('["all", true, false, true]', false);
    testIs('["all", true, true, false]', false);

    testIs('["any", true, true, true]', true);
    testIs('["any", true, false, false]', true);
    testIs('["any", false, true, false]', true);
    testIs('["any", false, false, true]', true);

    testIs('["any", false, false, false]', false);
    testIs('["any", false]', false);
    testIs('["any"]', false);

    testIs('["not", false]', true);
    testIs('["not", true]', false);
    testIs('["all", 2, "2"]', error("2 is not a boolean"));
    testIs('["any", false, "foo"]', error("foo is not a boolean"));
    testIs('["not", 1]', error("1 is not a boolean"));
});

describe("Audience nested expressions", () => {
    testIs('["all", ["all"]]', true);
    testIs('["all", ["any"]]', false);
    testIs('["any", ["any"], ["any"], ["all"]]', true);
    testIs('["any", ["any", ["any", ["all"]]]]', true);

    testIs('["any", ["not", true], ["equals", "foo", "bar"], ["==", 1, 1]]', true);
    testIs('["any", ["not", false], ["equals", "foo", "bar"], ["==", 1, 2]]', true);
    testIs('["any", ["not", true], ["equals", "foo", "foo"], ["==", 1, 2]]', true);
});

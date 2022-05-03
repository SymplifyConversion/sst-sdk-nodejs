/* eslint-disable @typescript-eslint/no-var-requires */

const { hello } = require("../lib").default;

describe("Hello, World", () => {
    test("can say the thing", () => {
        expect(hello()).toBe("Hello, world!");
    });
});

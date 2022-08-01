import { djb2, hashInWindow } from "../src/hash";

describe("hash is compatible", () => {
    test("djb2 empty string works", () => {
        expect(djb2("")).toBe(5381);
    });

    test("djb2 short string works", () => {
        expect(djb2("Fabian")).toBe(2515910790);
    });

    test("djb2 UUID string 1 works", () => {
        expect(djb2("9e66a7fa-984a-4681-9319-80c2be2ffe8a")).toBe(913699141);
    });

    test("djb2 UUID string 2 works", () => {
        expect(djb2("72784e9c-f5ae-4aed-8ae7-baa9c6e31d3c")).toBe(1619464113);
    });

    test("djb2 UUID string 3 works", () => {
        expect(djb2("cc615f71-1ab8-4322-b7d7-e10294a8d483")).toBe(3367636261);
    });

    test("hashInWindow is distributed 1", () => {
        expect(hashInWindow("9e66a7fa-984a-4681-9319-80c2be2ffe8a", 3)).toBe(1);
    });

    test("hashInWindow is distributed 2", () => {
        expect(hashInWindow("72784e9c-f5ae-4aed-8ae7-baa9c6e31d3c", 3)).toBe(2);
    });

    test("hashInWindow is distributed 3", () => {
        expect(hashInWindow("cc615f71-1ab8-4322-b7d7-e10294a8d483", 3)).toBe(3);
    });

    test("hashInWindow is compatible", () => {
        expect(hashInWindow("b7850777-f581-4f66-ad3e-4e54963661df", 100)).toBe(57);
    });
});

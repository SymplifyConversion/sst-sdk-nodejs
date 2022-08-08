import crypto from "crypto";
import { WebsiteData } from "../src/cookies";
import { ensureVisitorID } from "../src/visitor";
import { generateConstantID, makeCookieJar } from "./helpers";

const JSON_COOKIE_NAME = "sg_cookies";

describe("ensureVisitorID", () => {
    test("can use the given ID generator", () => {
        const cookies = makeCookieJar();
        const testWebsiteID = "4711";
        const siteData = new WebsiteData(testWebsiteID, cookies);

        const returnedID = ensureVisitorID(siteData, generateConstantID("goober"));

        expect(returnedID).toBe("goober");
    });

    test("can update sitedata", () => {
        const cookies = makeCookieJar();
        const testWebsiteID = "4711";
        const siteData = new WebsiteData(testWebsiteID, cookies);

        const returnedID = ensureVisitorID(siteData, generateConstantID("goober"));

        expect(returnedID).toBe("goober");
        expect(siteData.getVisitorID()).toBe("goober");
    });

    test("reuses values from sitedata", () => {
        const cookies = makeCookieJar();
        const testWebsiteID = "10001";

        // eslint-disable-next-line prettier/prettier
        const rawCookie = "{%2210001%22:{%22100000002%22:[300001]%2C%22100000001%22:[300002]%2C%22100000002_ch%22:1%2C%22100000001_ch%22:1%2C%22lv%22:1650967549303%2C%22rf%22:%22%22%2C%22pv%22:2%2C%22pv_p%22:{%22100000002%22:2%2C%22100000001%22:2}%2C%22tv%22:2%2C%22tv_p%22:{%22100000002%22:2%2C%22100000001%22:2}%2C%22aud_p%22:[100000002%2C100000001]%2C%22visid%22:%2278ac2972-de5f-4262-bfdb-7296eb132a94%22%2C%22commid%22:%221be9f08d-c36c-4bce-b157-e057e050027c%22}%2C%22_g%22:1}";
        // The web server/framework should do this decoding, but this test code
        // is not running there and we wanted to keep `rawCookie` an actual copy
        // paste from production in this test.
        const cookie = decodeURIComponent(rawCookie);
        cookies.set(JSON_COOKIE_NAME, cookie, 90);
        const siteData = new WebsiteData(testWebsiteID, cookies);

        const returnedID = ensureVisitorID(siteData, generateConstantID("don't use this"));

        expect(returnedID).toBe("78ac2972-de5f-4262-bfdb-7296eb132a94");
    });

    test("generates UUIDs by default", () => {
        const testWebsiteID = "websiteID";

        const siteDataA = new WebsiteData(testWebsiteID, makeCookieJar());
        const siteDataB = new WebsiteData(testWebsiteID, makeCookieJar());

        const sentinel = "this is not a UUID!";

        const returnedIDA = ensureVisitorID(siteDataA) || sentinel;
        const returnedIDB = ensureVisitorID(siteDataB) || sentinel;

        expect(looksLikeUUID(returnedIDA)).toBe(true);
        expect(looksLikeUUID(returnedIDB)).toBe(true);
        expect(returnedIDA == returnedIDB).toBe(false);
    });
});

describe("(test code) looksLikeUUID", () => {
    test("looksLikeUUID can identify UUIDs", () => {
        expect(looksLikeUUID(crypto.randomUUID())).toBe(true);
        expect(looksLikeUUID("")).toBe(false);
        expect(looksLikeUUID("goober")).toBe(false);
        expect(looksLikeUUID("123456789012345678901234567890123456")).toBe(false);
    });
});

function looksLikeUUID(s: string): boolean {
    return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(s);
}

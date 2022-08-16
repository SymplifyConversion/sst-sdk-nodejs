import { WebsiteData } from "../src/cookies";
import { ProjectConfig, ProjectState, VariationConfig } from "../src/project";
import { makeCookieJar } from "./helpers";

describe("WebsiteData", () => {
    test("can create fresh cookie data", () => {
        const data = new WebsiteData("4711", makeCookieJar());
        expect(data.isCompatible()).toBe(true);
    });

    test("can set and get visitor ID", () => {
        const data = new WebsiteData("4711", makeCookieJar());
        data.setVisitorID("foobar");
        expect(data.getVisitorID()).toBe("foobar");
    });

    test("can set and get allocation info", () => {
        const active: ProjectState = "active";
        const testVar = { id: 42, name: "a variation", state: active, weight: 100 };
        const testProject = { id: 1337, name: "project", variations: [testVar], state: active };
        const data = new WebsiteData("4711", makeCookieJar());
        data.rememberAllocation(testProject, testVar);
        expect(data.getAllocation(testProject)).toStrictEqual(testVar);
    });

    test("can remember null allocations", () => {
        const active: ProjectState = "active";
        const testProject = { id: 1337, name: "project", variations: [], state: active };
        const data = new WebsiteData("4711", makeCookieJar());
        data.rememberNullAllocation(testProject);
        expect(data.getAllocation(testProject)).toBe(null);
    });

    test("can save by setting cookie", () => {
        const active: ProjectState = "active";
        const testVar = { id: 42, name: "a variation", state: active, weight: 100 };
        const testProject = { id: 1337, name: "project", variations: [testVar], state: active };
        const cookies = makeCookieJar();
        const data = new WebsiteData("4711", cookies);
        data.setVisitorID("goober");
        data.rememberAllocation(testProject, testVar);
        data.save(cookies);
        expect(JSON.parse(cookies.get("sg_cookies"))).toStrictEqual({
            "4711": {
                "1337": [42],
                "1337_ch": 1,
                aud_p: [1337],
                visid: "goober",
            },
            _g: 1,
        });
    });

    test("can set expires attribute", () => {
        const cookies = makeCookieJar();
        const data = new WebsiteData("4711", cookies);
        data.save(cookies);
        expect(cookies.getExpiresIn("sg_cookies")).toBe(90);
    });

    test("assumes the cookie is already decoded when reading it", () => {
        const cookieData = {
            "4711": {
                "1337": [42],
                "1337_ch": 1,
                aud_p: [1337],
                visid: "goober%22",
            },
            _g: 1,
        };
        const testVar: VariationConfig = {
            id: 42,
            name: "a variation",
            state: "active",
            weight: 100,
        };
        const testProject: ProjectConfig = {
            id: 1337,
            name: "project",
            variations: [testVar],
            state: "active",
        };

        const cookies = makeCookieJar();
        cookies.set("sg_cookies", JSON.stringify(cookieData), 1);
        const data = new WebsiteData("4711", cookies);

        expect(data.getVisitorID()).toBe("goober%22");
        expect(data.getAllocation(testProject)).toStrictEqual(testVar);
    });

    test("handles nonexistent preview data", () => {
        const testSiteID = "4711";
        const cookieData = {
            [testSiteID]: {
                "1337": [42],
                "1337_ch": 1,
                aud_p: [1337],
                visid: "goober%22",
            },
            _g: 1,
        };

        const cookies = makeCookieJar();
        cookies.set("sg_cookies", JSON.stringify(cookieData), 1);
        const data = new WebsiteData(testSiteID, cookies);

        expect(data.getPreviewData()).toBe(null);
    });

    test("handles legacy preview data", () => {
        const testSiteID = "4711";
        const cookieData = {
            [testSiteID]: {
                pmr: 9999, // legacy data, for sst we need the pmv property as well
            },
            _g: 1,
        };

        const cookies = makeCookieJar();
        cookies.set("sg_cookies", JSON.stringify(cookieData), 1);
        const data = new WebsiteData(testSiteID, cookies);

        expect(data.getPreviewData()).toBe(null);
    });

    test("can get preview data", () => {
        const testSiteID = "4711";
        const cookieData = {
            [testSiteID]: {
                pmr: 9999,
                pmv: 99991,
            },
            _g: 1,
        };

        const cookies = makeCookieJar();
        cookies.set("sg_cookies", JSON.stringify(cookieData), 1);
        const data = new WebsiteData(testSiteID, cookies);

        expect(data.getPreviewData()).toStrictEqual({
            projectID: 9999,
            variationID: 99991,
        });
    });
});

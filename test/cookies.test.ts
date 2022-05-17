import { WebsiteData } from "../src/cookies";
import { ProjectState } from "../src/project";
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

    test("can save by setting cookie", () => {
        const active: ProjectState = "active";
        const testVar = { id: 42, name: "a variation", state: active, weight: 100 };
        const testProject = { id: 1337, name: "project", variations: [testVar], state: active };
        const cookies = makeCookieJar();
        const data = new WebsiteData("4711", cookies);
        data.setVisitorID("goober");
        data.rememberAllocation(testProject, testVar);
        data.save(cookies);
        expect(JSON.parse(decodeURIComponent(cookies.get("sg_cookies")))).toStrictEqual({
            "4711": {
                "1337": [42],
                "1337_ch": 1,
                aud_p: [1337],
                visid: "goober",
            },
            _g: 1,
        });
    });
});

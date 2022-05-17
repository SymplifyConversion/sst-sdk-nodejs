import { ProjectConfig, VariationConfig } from "./project";

export type CookieJar = {
    get: (name: string) => string;
    set: (name: string, value: string) => void;
};

export class JSONCookieCodec {
    underlying: CookieJar;

    constructor(wrap: CookieJar) {
        this.underlying = wrap;
    }

    get(name: string) {
        const rawCookie = this.underlying.get(name);
        if (!rawCookie) {
            return null;
        }
        return JSON.parse(decodeURIComponent(rawCookie));
    }

    set(name: string, value: unknown) {
        this.underlying.set(name, encodeURIComponent(JSON.stringify(value)));
    }
}

const JSON_COOKIE_NAME = "sg_cookies";
const JSON_COOKIE_VERSION_KEY = "_g";
const JSON_COOKIE_VISITOR_ID_KEY = "visid";
const SUPPORTED_JSON_COOKIE_VERSION = 1;

/**
 * WebsiteData is a cookie persistence layer compatible with the frontend js-sdk.
 * It helps us keep the visitor ID stable, and remember variation allocations when
 * project configs change.
 */
export class WebsiteData {
    websiteID: string;
    // the underlying value is an object with quite dynamic attributes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jsonCookie: any;

    constructor(websiteID: string, cookies: CookieJar) {
        const existing = new JSONCookieCodec(cookies).get(JSON_COOKIE_NAME);
        const jsonCookie = existing || { [JSON_COOKIE_VERSION_KEY]: SUPPORTED_JSON_COOKIE_VERSION };

        if (!jsonCookie[websiteID]) {
            jsonCookie[websiteID] = {};
        }
        this.websiteID = websiteID;
        this.jsonCookie = jsonCookie;
    }

    save(cookies: CookieJar): void {
        new JSONCookieCodec(cookies).set(JSON_COOKIE_NAME, this.jsonCookie);
    }

    isCompatible(): boolean {
        return this.jsonCookie[JSON_COOKIE_VERSION_KEY] === SUPPORTED_JSON_COOKIE_VERSION;
    }

    getVisitorID(): string | null {
        const val = this.get(JSON_COOKIE_VISITOR_ID_KEY);
        return typeof val == "string" ? val : null;
    }

    setVisitorID(visitorID: string): void {
        this.set(JSON_COOKIE_VISITOR_ID_KEY, visitorID);
    }

    rememberAllocation(project: ProjectConfig, variation: VariationConfig): void {
        const prevAudP = this.get("aud_p");
        this.set("aud_p", (Array.isArray(prevAudP) ? prevAudP : []).concat(project.id));
        this.set(project.id + "_ch", 1);
        this.set(project.id + "", [variation.id]);
    }

    rememberNullAllocation(project: ProjectConfig): void {
        this.set(project.id + "_ch", -1);
    }

    getAllocation(project: ProjectConfig): VariationConfig | null {
        if (this.get(project.id + "_ch") != 1) {
            return null;
        }

        const allocatedVariations = this.get(project.id + "");
        if (!Array.isArray(allocatedVariations)) {
            return null;
        }

        for (const variation of project.variations) {
            if (variation.id == allocatedVariations[0]) {
                return variation;
            }
        }

        return null;
    }

    private get(key: string): unknown {
        if (!this.isCompatible()) {
            return null;
        }
        return this.jsonCookie[this.websiteID][key];
    }

    private set(key: string, value: unknown): void {
        if (!this.isCompatible()) {
            return;
        }
        this.jsonCookie[this.websiteID][key] = value;
    }
}

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
        if (!this.isCompatible()) {
            return null;
        }
        return this.jsonCookie[this.websiteID][JSON_COOKIE_VISITOR_ID_KEY];
    }

    setVisitorID(visitorID: string): void {
        if (!this.isCompatible()) {
            return;
        }
        this.jsonCookie[this.websiteID][JSON_COOKIE_VISITOR_ID_KEY] = visitorID;
    }
}

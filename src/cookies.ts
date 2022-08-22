import { ProjectConfig, VariationConfig } from "./project";

export type CookieReader = {
    /**
     * Get the HTTP cookie from the current request with the given name.
     * The result should be URL decoded from the browser request.
     */
    get: (name: string) => string;
};

export type CookieWriter = {
    /**
     * Set the HTTP cookie for the current response, with the given name, the given value.
     * The expires field of the cookie must be `expireInDays` days from now.
     * The domain field of the cookie should be the domain you run your test projects on.
     * The cookie value should be URL encoded before reaching the browser.
     */
    set: (name: string, value: string, expireInDays: number) => void;
};

export type CookieJar = CookieReader & CookieWriter;

/**
 * PreviewData is used by the SDK when users are previewing tests without activating them.
 */
export type PreviewData = {
    projectID: number;
    variationID: number;
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
        return JSON.parse(rawCookie);
    }

    set(name: string, value: unknown) {
        this.underlying.set(name, JSON.stringify(value), 90);
    }
}

const JSON_COOKIE_NAME = "sg_cookies";
const JSON_COOKIE_VERSION_KEY = "_g";
const JSON_COOKIE_VISITOR_ID_KEY = "visid";
const JSON_COOKIE_PREVIEW_PROJECT_KEY = "pmr";
const JSON_COOKIE_PREVIEW_VARIATION_KEY = "pmv";
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

    constructor(websiteID: string, cookies: CookieReader) {
        const codec = new JSONCookieCodec({ get: cookies.get, set: () => undefined });
        const existing = codec.get(JSON_COOKIE_NAME);
        const jsonCookie = existing || { [JSON_COOKIE_VERSION_KEY]: SUPPORTED_JSON_COOKIE_VERSION };

        if (!jsonCookie[websiteID]) {
            jsonCookie[websiteID] = {};
        }
        this.websiteID = websiteID;
        this.jsonCookie = jsonCookie;
    }

    save(cookies: CookieWriter): void {
        const codec = new JSONCookieCodec({ get: () => "", set: cookies.set });
        codec.set(JSON_COOKIE_NAME, this.jsonCookie);
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

    /**
     * Get current allocation info from the website data.
     *
     * @param project check existing allocation for this project
     * @returns the allocated variation if it exists, null if a null allocation exists, undefined if there is no info
     */
    getAllocation(project: ProjectConfig): VariationConfig | undefined | null {
        if (this.get(project.id + "_ch") == -1) {
            return null;
        }

        const allocatedVariations = this.get(project.id + "");
        if (!Array.isArray(allocatedVariations)) {
            return undefined;
        }

        for (const variation of project.variations) {
            if (variation.id == allocatedVariations[0]) {
                return variation;
            }
        }

        return undefined;
    }

    /**
     * Get current preview config from the website data.
     *
     * @returns the current preview config if it exists, null otherwise
     */
    getPreviewData(): PreviewData | null {
        const projectID = this.get(JSON_COOKIE_PREVIEW_PROJECT_KEY);
        const variationID = this.get(JSON_COOKIE_PREVIEW_VARIATION_KEY);

        if (typeof projectID !== "number") {
            return null;
        }

        if (typeof variationID !== "number") {
            return null;
        }

        return { projectID, variationID };
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

const OPTIN_COOKIE_NAME = "sg_optin";

export function visitorHasOptedIn(cookies: CookieReader) {
    return cookies.get(OPTIN_COOKIE_NAME) === "1";
}

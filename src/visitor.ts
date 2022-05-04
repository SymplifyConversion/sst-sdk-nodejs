import { randomUUID } from "crypto";

const JSON_COOKIE_NAME = "sg_cookies";
const JSON_COOKIE_VERSION_KEY = "_g";
const JSON_COOKIE_VISITOR_ID_KEY = "visid";
const SUPPORTED_JSON_COOKIE_VERSION = 1;

/**
 * Gets the visitor ID from our cookie, if uninitialized, create one and update
 * the cookie. This keeps visitor IDs in sync with frontend logic.
 *
 * @param getCookie get a cookie by name from the current request
 * @param setCookie set a cookie by name in the current response
 * @param websiteID the ID of the website (needed for cookie compatibility)
 * @param idGenerator used to generate a new ID if needed (in a uniformly random distribution)
 * @returns null if no visitor ID could be assigned, otherwise the assigned visitor ID
 */
export function ensureVisitorID(
    getCookie: (name: string) => string,
    setCookie: (name: string, value: string) => void,
    websiteID: string,
    idGenerator: () => string = randomUUID
): string | null {
    const existingCookie = getCookie(JSON_COOKIE_NAME);
    const sgCookies = existingCookie
        ? JSON.parse(decodeURIComponent(existingCookie))
        : { [JSON_COOKIE_VERSION_KEY]: SUPPORTED_JSON_COOKIE_VERSION };

    if (sgCookies[JSON_COOKIE_VERSION_KEY] != SUPPORTED_JSON_COOKIE_VERSION) {
        return null;
    }

    if (!sgCookies[websiteID]) {
        sgCookies[websiteID] = {};
    }

    let vid = sgCookies[websiteID][JSON_COOKIE_VISITOR_ID_KEY];
    if (!vid) {
        vid = idGenerator();
        sgCookies[websiteID][JSON_COOKIE_VISITOR_ID_KEY] = vid;
        setCookie(JSON_COOKIE_NAME, encodeURIComponent(JSON.stringify(sgCookies)));
    }

    return vid;
}

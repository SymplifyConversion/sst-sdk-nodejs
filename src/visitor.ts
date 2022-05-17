import { randomUUID } from "crypto";
import { WebsiteData } from "./cookies";

/**
 * Gets the visitor ID from our cookie, if uninitialized, create one and update
 * the cookie. This keeps visitor IDs in sync with frontend logic.
 *
 * @param websiteData manages persistence
 * @param idGenerator used to generate a new ID if needed (in a uniformly random distribution)
 * @returns null if no visitor ID could be assigned, otherwise the assigned visitor ID
 */
export function ensureVisitorID(
    websiteData: WebsiteData,
    idGenerator: () => string = randomUUID,
): string | null {
    let vid = websiteData.getVisitorID();
    if (!vid) {
        vid = idGenerator();
        websiteData.setVisitorID(vid);
    }

    return vid;
}

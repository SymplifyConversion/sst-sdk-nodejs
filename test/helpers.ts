import { randomUUID } from "crypto";
import { CookieJar } from "../src/cookies";
import { findVariationForVisitor, ProjectConfig } from "../src/project";

type TestCookieJar = CookieJar & { getExpiresIn: (key: string) => number };

export function makeCookieJar(): TestCookieJar {
    const cookies: Record<string, string> = {};
    const expiresIn: Record<string, number> = {};

    return {
        get: (key: string) => cookies[key],
        set: (key: string, val: string, expireInDays: number) => {
            cookies[key] = val;
            expiresIn[key] = expireInDays;
        },
        getExpiresIn: (key: string) => expiresIn[key],
    };
}

export function generateConstantID(id: string) {
    return () => id;
}

export function constantHTTP(response: string): (url: string) => Promise<string> {
    return () => Promise.resolve(response);
}

export function findMatchingVisitors(project: ProjectConfig): Record<string, string> {
    const matches: Record<string, string> = {};

    while (Object.keys(matches).length < project.variations.length) {
        const visitorID = randomUUID();
        const variationName = findVariationForVisitor(project, visitorID)?.name ?? "null";
        if (!matches[variationName]) {
            matches[variationName] = visitorID;
        }
    }

    return matches;
}

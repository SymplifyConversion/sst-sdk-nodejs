import { Audience } from "./audience";
import { hashInWindow } from "./hash";
import { Logger } from "./logger";
import { List, isError } from "./rules-engine";

export type ProjectState = "paused" | "active";

export type AudienceAttributes = Record<string, boolean | number | string>;

export enum PrivacyMode {
    DEFAULT = 0,
    OPTIN_TRACKING = 1,
    OPTIN_EVERYTHING = 2,
}

export type SymplifyConfig = {
    /** in seconds from epoch */
    updated: number;
    privacy_mode: PrivacyMode;
    projects: ProjectConfig[];
};

export type ProjectConfig = {
    id: number;
    name: string;
    variations: VariationConfig[];
    state: ProjectState;
    audience_rules?: List;
    audience?: Audience;
};

export type VariationConfig = {
    id: number;
    name: string;
    weight: number;
    state: ProjectState;
    distribution: number;
};

/**
 * Look up the variation with the given ID in the given project.
 */
export function findVariationWithID(
    project: ProjectConfig,
    variationID: number,
): VariationConfig | null {
    for (const variation of project.variations) {
        if (variation.id === variationID) {
            return variation;
        }
    }

    return null;
}

/**
 * Look up the project with the given name, regardless of ID or active state.
 */
export function findProjectWithName(
    config: SymplifyConfig,
    projectName: string,
): ProjectConfig | null {
    for (const project of config.projects) {
        if (project.name === projectName) {
            return project;
        }
    }

    return null;
}

/**
 * Allocate an active variation for the visitor in the given project.
 *
 * @returns null if the visitor ID is empty or the project or variation is not active
 */
export function findVariationForVisitor(
    project: ProjectConfig,
    visitorID: string,
): VariationConfig | null {
    if (!visitorID || project.state !== "active") {
        return null;
    }

    const hashKey = `${visitorID}:${project.id}`;
    const hash = hashInWindow(hashKey, 100);

    let pointer = 0;
    for (const variation of project.variations) {
        variation.distribution
            ? (pointer += variation.distribution) 
            : (pointer += variation.weight);
        if (hash <= pointer) {
            return variation.state === "active" ? variation : null;
        }
    }

    return null;
}

export function doesAudienceApply(
    project: ProjectConfig,
    attributes: AudienceAttributes,
    logger: Logger,
): boolean {
    if (!project.audience) {
        // no audience setup means always true
        return true;
    }

    const result = project.audience.eval({ attributes });

    if (isError(result)) {
        logger.warn(`audience check failed: ${result.message}`);
        return false;
    }

    return result;
}

export function restoreAudience(cfg: ProjectConfig): void {
    if (cfg.audience_rules) {
        // If we refactor the Audience constructor we can avoid this extra stringify, but
        // since we only construct Project instances on config load it's not performance sensitive.
        const audienceJSON = JSON.stringify(cfg.audience_rules);
        cfg.audience = new Audience(audienceJSON);
    }
}

export function parseConfigJSON(json: string): SymplifyConfig {
    const BOM = /^\xEF\xBB\xBF/;
    const cleanJSON = json.trimStart().replace(BOM, "");
    const config: SymplifyConfig = JSON.parse(cleanJSON);

    for (const project of config.projects) {
        restoreAudience(project);
    }

    return config;
}

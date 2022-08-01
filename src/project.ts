import { hashInWindow } from "./hash";

export type ProjectState = "paused" | "active";

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
};

export type VariationConfig = {
    id: number;
    name: string;
    weight: number;
    state: ProjectState;
};

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
        pointer += variation.weight;
        if (hash <= pointer) {
            return variation.state === "active" ? variation : null;
        }
    }

    return null;
}

export function parseConfigJSON(json: string): SymplifyConfig {
    const BOM = /^\xEF\xBB\xBF/;
    return JSON.parse(json.trimStart().replace(BOM, ""));
}

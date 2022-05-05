import { djb2 } from "./hash";

export type ProjectState = "paused" | "active";

export type SymplifyConfig = {
    /** in seconds from epoch */
    updated: number;
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
    projectName: string
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
    visitorID: string
): VariationConfig | null {
    if (!visitorID) {
        return project.variations[0];
    }

    let totalWeight = 0;
    for (const variation of project.variations) {
        totalWeight += variation.weight;
    }

    const hashKey = `${visitorID}:${project.id}`;
    let hash = djb2(hashKey);
    hash /= 4_294_967_295; // unsigned max
    hash *= totalWeight; // fit window

    let pointer = 0;
    for (const variation of project.variations) {
        pointer += variation.weight;
        if (hash <= pointer) {
            return variation;
        }
    }

    return null;
}

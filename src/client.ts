import { randomUUID } from "crypto";
import { CookieJar, CookieWriter, visitorHasOptedIn, WebsiteData } from "./cookies";
import { httpsGET } from "./http";
import { Logger, NullLogger } from "./logger";
import {
    AudienceAttributes,
    doesAudienceApply,
    findProjectWithName,
    findVariationForVisitor,
    findVariationWithID,
    parseConfigJSON,
    PrivacyMode,
    ProjectConfig,
    SymplifyConfig,
    VariationConfig,
} from "./project";
import { ensureVisitorID } from "./visitor";

const DEFAULT_CONFIG_UPDATE_INTERVAL = 60;
const DEFAULT_CDN_BASEURL = "https://cdn-sitegainer.com";

export type IDGenerator = () => string;

export type ClientDependencies = {
    httpGET?: (url: string) => Promise<string>;
    log?: Logger;
    idGenerator?: IDGenerator;
    cdnBaseURL?: string;
};

export class SymplifySDK {
    websiteID: string;
    httpGET: (url: string) => Promise<string>;
    log: Logger;
    idGenerator: IDGenerator;
    running: boolean;
    ready: Promise<void>;
    cdnBaseURL: string;

    config: {
        latest: SymplifyConfig | null;
        loading: boolean;
    };

    /**
     * Create an SDK instance. Each instance maintains its configuration in sync with our backend.
     *
     * @param websiteID your website ID
     * @param deps (optional) override default dependencies
     * @param configUpdateInterval (optional) seconds between configuration update checks, MUST be at least 1
     */
    constructor(
        websiteID: string,
        deps: ClientDependencies = {},
        configUpdateInterval = DEFAULT_CONFIG_UPDATE_INTERVAL,
    ) {
        if (configUpdateInterval < 1) {
            throw new Error("configUpdateInterval < 1");
        }

        this.websiteID = websiteID;
        this.httpGET = deps.httpGET || httpsGET;
        this.log = deps.log || new NullLogger();
        this.idGenerator = deps.idGenerator || randomUUID;
        this.cdnBaseURL = deps.cdnBaseURL || DEFAULT_CDN_BASEURL;

        this.running = true;

        this.config = {
            latest: null,
            loading: false,
        };

        this.ready = this.loadConfig();

        // setTimeout in 0 ms means next event loop
        setTimeout(configPollerLoop, 0, this, configUpdateInterval);
    }

    /**
     * Stop the config polling loop.
     */
    stop() {
        this.running = false;
    }

    /**
     * Returns the name of the allocated variation in the project called
     * `projectName` for the current visitor. The current visitor is identified
     * by our cookie, if they are unknown, a new ID is created and set in the
     * cookie.
     *
     * @param projectName the name of the project to allocate in
     * @param cookies a delegate for reading and writing request cookies
     * @param audienceAttributes custom attributes for audience evaluation
     * @returns the name of the allocated variation, or null if none was
     * allocated
     */
    public findVariation(
        projectName: string,
        cookies: CookieJar,
        audienceAttributes: AudienceAttributes = {},
    ): string | null {
        if (this.config.latest === null) {
            this.log.warn("findVariation before config was ready");
            return null;
        }

        // bail out as early as possible if visitor has not opted in
        if (
            this.config.latest.privacy_mode === PrivacyMode.OPTIN_EVERYTHING &&
            !visitorHasOptedIn(cookies)
        ) {
            return null;
        }

        const siteData = new WebsiteData(this.websiteID, cookies);
        if (!siteData.isCompatible()) {
            this.log.warn("findVariation: unsupported cookie generation");
            return null;
        }

        const visitorID = ensureVisitorID(siteData, this.idGenerator);
        if (!visitorID) {
            this.log.error("could not get or generate a visitor ID");
            return null;
        }

        const project = findProjectWithName(this.config.latest, projectName);
        if (!project) {
            this.log.error(`findVariation: unknown project: ${projectName}`);
            return null;
        }

        // 1. if previewing a project, handle and return early

        if (siteData.getPreviewData() !== null) {
            return handlePreview(siteData, project, cookies, audienceAttributes, this.log);
        }

        if (project.state !== "active") {
            return null;
        }

        // 2. if we already have an allocation from a previous visit, use that and return early

        if (siteData.getAllocation(project) !== undefined) {
            const cookieAllocation = siteData.getAllocation(project);
            return cookieAllocation ? cookieAllocation.name : null;
        }

        // 3. no preview or variation from before: let's make a decision about the visitor's allocation

        if (!doesAudienceApply(project, audienceAttributes, this.log)) {
            // if the audience does not apply, we will not persist any variation so don't need to do anything else here
            return null;
        }

        const variation = allocateVariation(siteData, project, visitorID);

        siteData.save(cookies);

        return variation?.name || null;
    }

    configURL(): string {
        return `${this.cdnBaseURL}/${this.websiteID}/sstConfig.json`;
    }

    loadConfig(): Promise<void> {
        this.log.debug("polling for config change...");

        this.config.loading = true;
        return this.fetchConfig()
            .then((newCfg) => {
                if (newCfg.updated <= (this.config.latest?.updated || 0)) {
                    this.log.debug("config is up to date");
                    return;
                }
                this.log.info(
                    `config update received with ${newCfg.projects.length} projects, updated: ${newCfg.updated}`,
                );
                this.config.latest = newCfg;
            })
            .catch((reason) => {
                this.log.error("config update failed: " + JSON.stringify(reason));
            })
            .finally(() => {
                this.config.loading = false;
            });
    }

    async fetchConfig(): Promise<SymplifyConfig> {
        return await this.httpGET(this.configURL()).then(parseConfigJSON);
    }
}

/**
 * Calculate the variation allocation for the given visitor ID,
 * save the allocation in the site data.
 */
function allocateVariation(
    siteData: WebsiteData,
    project: ProjectConfig,
    visitorID: string,
): VariationConfig | null {
    const variation = findVariationForVisitor(project, visitorID);

    if (variation) {
        siteData.rememberAllocation(project, variation);
    } else {
        siteData.rememberNullAllocation(project);
    }

    return variation;
}

/**
 * Get the preview variation name for the given visitor ID,
 * update cookies if needed.
 */
function handlePreview(
    siteData: WebsiteData,
    project: ProjectConfig,
    cookies: CookieWriter,
    audienceAttributes: AudienceAttributes,
    log: Logger,
): string | null {
    // While this function looks quite similar to allocating a variation
    // normally, there are other things we handle here, such as tracing the
    // audience evaluation.

    const audienceTrace = project.audience?.trace({ attributes: audienceAttributes });
    if (audienceTrace) {
        cookies.set("sg_audience_trace", JSON.stringify(audienceTrace), 0);
    }

    if (!doesAudienceApply(project, audienceAttributes, log)) {
        return null;
    }

    const variationID = siteData.getPreviewData()?.variationID;
    const variation = variationID ? findVariationWithID(project, variationID) : null;

    if (variation) {
        siteData.rememberAllocation(project, variation);
    }

    siteData.save(cookies);

    return variation?.name || null;
}

/**
 * Poll periodically for the SDK to load the remote config.
 *
 * @param sdk the SDK instance to reconfigure
 * @param freqSeconds how often to poll for configuration updates
 */
function configPollerLoop(sdk: SymplifySDK, freqSeconds: number): void {
    if (!sdk.running) {
        sdk.log.info("config poller loop shutting down");
        return;
    }

    if (sdk.config.loading) {
        sdk.log.warn("listener loop saw pending load");
    } else {
        sdk.loadConfig();
    }

    setTimeout(configPollerLoop, 1000 * freqSeconds, sdk, freqSeconds);
}

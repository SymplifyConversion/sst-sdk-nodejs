import { randomUUID } from "crypto";
import { CookieJar, WebsiteData } from "./cookies";
import { httpsGET } from "./http";
import { Logger, NullLogger } from "./logger";
import {
    findProjectWithName,
    findVariationForVisitor,
    parseConfigJSON,
    SymplifyConfig,
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
     * Returns the id of the allocated variation in `projectID` for the given visitor.
     *
     * @param projectName the name of the project to allocate in
     * @param cookies a delegate for reading and writing request cookies
     * @returns the name of the allocated variation, or null if none was allocated
     */
    public findVariation(projectName: string, cookies: CookieJar): string | null {
        if (this.config.latest === null) {
            this.log.warn("findVariation before config was ready");
            return null;
        }

        const siteData = new WebsiteData(this.websiteID, cookies);
        if (!siteData.isCompatible()) {
            this.log.warn("findVariation: unsupported cookie generation");
            return null;
        }

        const project = findProjectWithName(this.config.latest, projectName);
        if (!project) {
            this.log.error(`findVariation: unknown project: ${projectName}`);
            return null;
        }

        const currAllocation = siteData.getAllocation(project);

        switch (currAllocation) {
            case undefined:
                // no allocation data
                break;
            case null:
                // explicit null allocation
                return null;
            default:
                // variation allocation
                return currAllocation.name;
        }

        const visID = ensureVisitorID(siteData, this.idGenerator);
        if (!visID) {
            this.log.error("could not get or generate a visitor ID");
            return null;
        }

        const variation = findVariationForVisitor(project, visID);

        if (variation) {
            siteData.rememberAllocation(project, variation);
        } else {
            siteData.rememberNullAllocation(project);
        }

        siteData.save(cookies);

        return variation ? variation.name : null;
    }

    configURL(): string {
        return `${this.cdnBaseURL}/${this.websiteID}/sstConfig.json`;
    }

    loadConfig(): Promise<void> {
        this.log.debug("polling for config change...");

        this.config.loading = true;
        return this.fetchConfig()
            .then((newCfg) => {
                this.log.info(
                    `config received: ${newCfg.projects.length} projects, updated: ${newCfg.updated}`,
                );
                this.config.latest = newCfg;
            })
            .catch((reason) => {
                this.log.error("config update failed: " + reason);
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

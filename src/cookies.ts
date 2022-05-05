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

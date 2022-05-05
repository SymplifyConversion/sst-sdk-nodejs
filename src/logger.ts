/* eslint-disable @typescript-eslint/no-empty-function */

export type Logger = {
    error: (message: string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
};

export class NullLogger implements Logger {
    error() {}
    warn() {}
    info() {}
    debug() {}
}

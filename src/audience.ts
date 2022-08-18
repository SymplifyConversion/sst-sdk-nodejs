//
// See Audience.md in docs/
//

import {
    Atom,
    Environment,
    evaluate,
    isError,
    isList,
    List,
    parse,
    PrimitiveFn,
    RulesEngineError,
} from "./rules-engine";

type AudienceError = RulesEngineError;

/**
 * Audience contains rules to be evaluated for activating projects.
 */
export class Audience {
    rules: List;

    /**
     * Create a new Audience with the given rules.
     *
     * @throws AudienceError if the rules are invalid
     * @param rules JSON string describing the audience rules, see docs/Audience.md
     */
    constructor(rules: string) {
        const result = parse(rules, Object.keys(primitives));

        if (isError(result)) {
            throw result;
        }

        if (!isList(result)) {
            throw { message: "AST root must be a list" };
        }

        this.rules = result;
    }

    /**
     * eval interprets the rules in the given environment, and returns true if
     * the audience matches.
     */
    eval(env: Environment): boolean | AudienceError {
        const result = evaluate(this.rules, env, primitives);

        if (isError(result)) {
            return result;
        }

        if (!(typeof result == "boolean")) {
            return { message: `audience result was not boolean (${result})` };
        }

        return result;
    }
}

function stringFun(a: Atom, b: Atom, op: (x: string, y: string) => Atom): AudienceError | Atom {
    if (typeof a != "string" || typeof b != "string") {
        return { message: "expected string arguments" };
    }
    return op(a, b);
}

function numberFun(a: Atom, b: Atom, op: (x: number, y: number) => Atom): AudienceError | Atom {
    if (typeof a != "number" || typeof b != "number") {
        return { message: "expected number arguments" };
    }
    return op(a, b);
}

export const primitives: Record<string, PrimitiveFn> = {
    // boolean operations
    not: (args: Atom[]) => {
        const [arg] = args;
        if (typeof arg == "boolean") {
            return !arg;
        }
        return { message: `${arg} is not a boolean` };
    },
    all: (args: Atom[]) => {
        for (const arg of args) {
            if (!(typeof arg == "boolean")) {
                return { message: `${arg} is not a boolean` };
            }
            if (!arg) {
                return false;
            }
        }
        return true;
    },
    any: (args: Atom[]) => {
        for (const arg of args) {
            if (!(typeof arg == "boolean")) {
                return { message: `${arg} is not a boolean` };
            }
            if (arg) {
                return true;
            }
        }
        return false;
    },

    // string comparisons
    equals: (args: Atom[]) => stringFun(args[0], args[1], (a, b) => a == b),
    contains: (args: Atom[]) => stringFun(args[0], args[1], (a, b) => a.includes(b)),
    matches: (args: Atom[]) => stringFun(args[0], args[1], (a, b) => new RegExp(b).test(a)),

    // number comparisons
    "==": (args: Atom[]) => numberFun(args[0], args[1], (a, b) => a == b),
    "!=": (args: Atom[]) => numberFun(args[0], args[1], (a, b) => a != b),
    "<": (args: Atom[]) => numberFun(args[0], args[1], (a, b) => a < b),
    "<=": (args: Atom[]) => numberFun(args[0], args[1], (a, b) => a <= b),
    ">": (args: Atom[]) => numberFun(args[0], args[1], (a, b) => a > b),
    ">=": (args: Atom[]) => numberFun(args[0], args[1], (a, b) => a >= b),

    // custom attribute getters
    "number-attribute": (args: Atom[], env: Environment) => getInEnvNumber(args[0], env),
    "string-attribute": (args: Atom[], env: Environment) => getInEnvString(args[0], env),
    "bool-attribute": (args: Atom[], env: Environment) => getInEnvBool(args[0], env),
};

function getInEnvNumber(name: Atom, env: Environment): number | AudienceError {
    if (typeof name != "string") {
        return { message: "can only look up string names" };
    }
    const val = env.attributes[name];
    if (typeof val != "number") {
        return { message: `'${name}' is not a number` };
    }
    return val;
}

function getInEnvString(name: Atom, env: Environment): string | AudienceError {
    if (typeof name != "string") {
        return { message: "can only look up string names" };
    }
    const val = env.attributes[name];
    if (typeof val != "string") {
        return { message: `'${name}' is not a string` };
    }
    return val;
}

function getInEnvBool(name: Atom, env: Environment): boolean | AudienceError {
    if (typeof name != "string") {
        return { message: "can only look up string names" };
    }
    const val = env.attributes[name];
    if (typeof val != "boolean") {
        return { message: `'${name}' is not a boolean` };
    }
    return val;
}

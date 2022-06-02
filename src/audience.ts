//
// See Audience.md in docs/
//

/**
 * Evaluating an audience can yield a runtime error.
 */
export type AudienceError = {
    message: string;
};

/**
 * The rules syntax is a subset of JSON.
 */
export type AST = Atom | List;
export type Atom = string | number | boolean;
export type List = Array<List | Atom>;

/**
 * The environment is passed in from the outside when evaluating rules
 */
export type Environment = {
    attributes: Record<string, Atom>;
};

/**
 * Audience contains rules to be evaluated for activating projects.
 */
export class Audience {
    ast: AST;

    constructor(json: string) {
        this.ast = JSON.parse(json);
    }

    /**
     * eval interprets the rules in the given environment, and returns true if
     * the audience matches.
     */
    eval(env: Environment): boolean | AudienceError {
        const result = this.evalAst(this.ast, env);

        if (isError(result)) {
            return result;
        }

        if (!(typeof result == "boolean")) {
            return { message: `audience result was not boolean (${result})` };
        }

        return result;
    }

    private evalAst(ast: AST, env: Environment): Atom | AudienceError {
        switch (typeof ast) {
            case "number":
                return ast;
            case "string":
                return ast;
            case "boolean":
                return ast;
            case "object":
                if (ast instanceof Array && typeof ast[0] == "string") {
                    return this.evalApply(ast[0], ast.slice(1), env);
                }
        }
        return { message: `cannot evaluate ${ast}` };
    }

    private evalApply(head: string, args: List, env: Environment): Atom | AudienceError {
        const prim = primitives[head];
        if (!prim) {
            return { message: `${head} is not a primitive` };
        }
        try {
            const evaledArgs: Atom[] = [];
            for (const arg of args) {
                const a = this.evalAst(arg, env);
                if (isError(a)) {
                    return a;
                }
                evaledArgs.push(a);
            }
            return prim.apply(prim, evaledArgs);
        } catch {
            return { message: `error applying primitive ${head}` };
        }
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

// eslint-disable-next-line @typescript-eslint/ban-types
const primitives: Record<string, Function> = {
    // boolean operations
    not: (arg: Atom) => {
        if (typeof arg == "boolean") {
            return !arg;
        }
        return { message: `${arg} is not a boolean` };
    },
    all: (...args: List) => {
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
    any: (...args: List) => {
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
    equals: (a: Atom, b: Atom) => stringFun(a, b, (a, b) => a == b),
    contains: (a: Atom, b: Atom) => stringFun(a, b, (a, b) => a.includes(b)),
    matches: (a: Atom, b: Atom) => stringFun(a, b, (a, b) => new RegExp(b).test(a)),

    // number comparisons
    "==": (a: Atom, b: Atom) => numberFun(a, b, (a, b) => a == b),
    "!=": (a: Atom, b: Atom) => numberFun(a, b, (a, b) => a != b),
    "<": (a: Atom, b: Atom) => numberFun(a, b, (a, b) => a < b),
    "<=": (a: Atom, b: Atom) => numberFun(a, b, (a, b) => a <= b),
    ">": (a: Atom, b: Atom) => numberFun(a, b, (a, b) => a > b),
    ">=": (a: Atom, b: Atom) => numberFun(a, b, (a, b) => a >= b),
};

function isError(x: Atom | AudienceError): x is AudienceError {
    return (x as AudienceError).message !== undefined;
}

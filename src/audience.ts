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

    /**
     * Create a new Audience with the given rules.
     *
     * @throws AudienceError if the rules are invalid
     * @param rules JSON string describing the audience rules, see docs/Audience.md
     */
    constructor(rules: string) {
        let ast: AST;
        try {
            ast = JSON.parse(rules);
        } catch (x) {
            throw { message: "rules syntax error" };
        }
        checkSyntax(ast);
        this.ast = ast;
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
            return prim(evaledArgs, env);
        } catch {
            return { message: `error applying primitive ${head}` };
        }
    }
}

function checkSyntax(ast: AST): void {
    switch (typeof ast) {
        case "object":
            if (ast instanceof Array) {
                checkSyntaxInner(ast);
            }
            return;
    }
    throw { message: "AST root must be a list" };
}

function checkSyntaxInner(ast: AST): void {
    switch (typeof ast) {
        case "number":
            return;
        case "string":
            return;
        case "boolean":
            return;
        case "object":
            if (ast instanceof Array) {
                const car = ast[0];
                if (typeof car != "string") {
                    throw { message: `can only apply strings, ${car} is not a string` };
                }
                if (!primitives[car]) {
                    throw { message: `${car} is not a primitive` };
                }
                const cdr = ast.slice(1);
                for (const elem of cdr) {
                    checkSyntaxInner(elem);
                }
                return;
            }
    }
    throw { message: `rules syntax error at ${JSON.stringify(ast)}` };
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

function isError(x: Atom | AudienceError): x is AudienceError {
    return (x as AudienceError).message !== undefined;
}

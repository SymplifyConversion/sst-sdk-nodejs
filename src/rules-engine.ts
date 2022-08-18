//
// The rules syntax is a subset of JSON.
//
export type Expr = Atom | List;
export type Atom = string | number | boolean;
export type List = Array<Expr>;

/**
 * Evaluating rules can yield a runtime error.
 */
export type RulesEngineError = {
    message: string;
};

/**
 * The environment is passed in from the outside when evaluating rules.
 */
export type Environment = {
    attributes: Record<string, Atom>;
};

/**
 * Primitive functions can be applied when evaluating, they can have arguemnts
 * and have access to the environment.
 */
export type PrimitiveFn = (args: Atom[], env: Environment) => Atom | RulesEngineError;

export function parse(rules: string, primitives: string[]): Expr | RulesEngineError {
    let ast;
    try {
        ast = JSON.parse(rules);
    } catch (x) {
        return { message: "rules syntax error" };
    }

    try {
        if (checkSyntax(ast, primitives)) {
            return ast;
        }
        // we should never get a false result, but this satisfies the compiler
        return { message: "error in syntax checker" };
    } catch (e) {
        if (isError(e)) {
            return e;
        }
        return { message: `unexpected error checking AST: ${JSON.stringify(e)}` };
    }
}

export function isList(ast: Expr): ast is List {
    return Array.isArray(ast);
}

export function checkSyntax(ast: unknown, primitives: string[]): ast is Expr {
    checkSyntaxInner(ast, primitives);

    // Since there can be different reasons for the AST being invalid we use
    // exceptions instead of proper true | false branches. This lets us capture
    // messages in the caller.
    return true;
}

function checkSyntaxInner(ast: unknown, primitives: string[]): void {
    switch (typeof ast) {
        case "number":
            return;
        case "string":
            return;
        case "boolean":
            return;
    }

    if (Array.isArray(ast)) {
        const car = ast[0];
        if (typeof car != "string") {
            throw { message: `can only apply strings, ${car} is not a string` };
        }
        if (primitives.indexOf(car) < 0) {
            throw { message: `${car} is not a primitive` };
        }
        const cdr = ast.slice(1);
        for (const elem of cdr) {
            checkSyntaxInner(elem, primitives);
        }
        return;
    }

    throw { message: `rules syntax error at ${JSON.stringify(ast)}` };
}

export function evaluate(
    ast: Expr,
    env: Environment,
    primitives: Record<string, PrimitiveFn>,
): Atom | RulesEngineError {
    switch (typeof ast) {
        case "number":
            return ast;
        case "string":
            return ast;
        case "boolean":
            return ast;
        case "object":
            if (ast instanceof Array && typeof ast[0] == "string") {
                return evalApply(ast[0], ast.slice(1), env, primitives);
            }
    }
    return { message: `cannot evaluate ${ast}` };
}

function evalApply(
    head: string,
    args: List,
    env: Environment,
    primitives: Record<string, PrimitiveFn>,
): Atom | RulesEngineError {
    const prim = primitives[head];
    if (!prim) {
        return { message: `${head} is not a primitive` };
    }
    try {
        const evaledArgs: Atom[] = [];
        for (const arg of args) {
            const a = evaluate(arg, env, primitives);
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

export function isError(x: unknown): x is RulesEngineError {
    return (x as RulesEngineError).message !== undefined;
}

//
// A rules expression can be "traced", which means the syntax tree is evaluated
// node by node, and function calls get annotated in-place with their result.
// This can be used for debugging or testing expressions in development.
//

export type TracedExpr = TracedAtom | TracedList;
export type TracedAtom = TracedApply | RulesEngineError | Atom;
export type TracedApply = { call: string; result: TracedAtom };
export type TracedList = Array<TracedExpr>;

/**
 * Trace the evaluation of the given rules expression.
 *
 * @param ast the expression to evaluate
 * @param env the environment to evaluate in
 * @param primitives implementations of functions that can be called, can refer to the environment
 * @returns the given ast, each node annotated with their partial result
 */
export function traceEval(
    ast: Expr,
    env: Environment,
    primitives: Record<string, PrimitiveFn>,
): TracedExpr | RulesEngineError {
    if (Array.isArray(ast) && typeof ast[0] == "string") {
        const symbol = ast[0];
        const args = ast.slice(1);
        const value = evalApply(symbol, args, env, primitives);

        // this is not very efficient, but the tracing is for previews/debugging only
        // and this implementation is simple
        const tracedArgs = args.map((arg) => traceEval(arg, env, primitives));

        // returns the same ast with partial results injected
        return [{ call: symbol, result: value }, ...tracedArgs];
    }

    return evaluate(ast, env, primitives);
}

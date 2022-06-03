# Audiences

## Purpose

The purpose of this docuemnt is to specify how all SDK implementations should
interpret audience rules.

## Overview

A project can have custom audience rules applied for segmentation.

The project audience is defined by an expression of rules which when applied to
the request context can be true or false.

A project with no custom audience defined behaves the same as one which has an
audience that is always true.

When finding a variation, the first thing the SDK does (after finding the
project) is to apply the audience rules. If the request is not within the
audience, no allocation is attempted and the result is not persisted. If the
audience is fulfilled, variation allocation proceeds as if no audience was
configured.

The expressions in the data come from the server side testing config in our
backend, and is built by users creating the test projects. As such there should
be no errors in the given expressions but this document nonetheless describes
how to handle them.

The audience evaluation never throws exceptions, when we say an error is raised
below, we mean the evaluation is aborted and the result is false.

## Syntax

Rules are defined in JSON s-expressions.

There are some general operations for comparing numbers and strings, and for
combining booleans.

There are also functions for getting custom request or visitor attributes. Note
that these attributes are all provided by the SDK user in the call to find a
project variation.

Here are some examples to illustrate.

This audience is true if the string attribute `urlPath` contains the string
"contact" and also the string attribute `country` is "Sweden" and the
`bonusPoints` number attribute is at least 1000:

```JSON
["all",
  [">=", ["number-attribute", "bonusPoints"], 1000],
  ["contains", ["string-attribute", "urlPath"], "contact"],
  ["equals", ["string-attribute", "country"], "Sweden"]]
```

This audience is true if the bool attribute `preview` is true, or else if the
string attribute `environment` is "staging":

```JSON
["any",
  ["bool-attribute", "preview"],
  ["equals", ["string-attribute", "environment"], "staging"]]
```

The JSON s-expressions are either atoms or lists of s-expressions.

An atom is a JSON string, boolean or number.

A list is a JSON array.

## Evaluating

The value of an atom is its value in JSON.

(pseudo meta syntax)
```
"foo" => "foo"
true  => true
4711  => 4711
```

The value of a list is the result of applying the primitive named by the first
element on the arguments in the rest of the list.

(pseudo meta syntax)
```
["foo", "bar", "baz"] => lookupPrimitive("foo").apply("bar", "baz")
["quux"]              => lookupPrimitive("quux").apply()
```

If a primitive lookup fails, an error is raised.

## Primitives

The audience expressions are built by combining the following primitives.

The arity of each operation is listed by its name.

Passing the wrong number or type of arguments yields an error. An audience with
an error behaves like one which has a false result.

### Facts

Facts contain information related to a request, they can return numbers, strings
or booleans.

#### string-attribute (unary)

returns the string attribute named by the first argument, from the request
environment

if none is found, the whole audience is false

#### number-attribute (unary)

returns the number attribute named by the first argument, from the request
environment

if none is found, the whole audience is false

#### bool-attribute (unary)

returns the boolean attribute named by the first argument, from the request
environment

if none is found, the whole audience is false

### Boolean operations

#### all (variadic)
returns true if all arguments are true (true for an empty argument list)

#### any (variadic)
returns true if any arguments is true (false for empty arg list)

#### not (unary)
returns the inverse of its boolean argument

### Binary number comparisons

These primitives take exactly two number arguments, otherwise raise an error.

#### == (binary)
returns true if the arguments are equal

#### < (binary)
returns true if the first argument is less than the second

#### <= (binary)
returns true if the first argument is less than or equal to the second

#### > (binary)
returns true if the first argument is greater than the second

#### >= (binary)
returns true if the first argument is greater than or equal to the second

### Binary string comparisons

These primitives take exactly two string arguments, otherwise raise an error.
They are all case insensitive.

#### equals (binary)
returns true if arguments are equal

#### contains (binary)
returns true if the first argument contains the second

#### matches (binary)
returns true it the first argument matches the second (second interpreted as regex)

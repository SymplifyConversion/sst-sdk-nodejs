## Overview

We practice [trunk based development](https://trunkbaseddevelopment.com) and
`main` is the branch we release from.

Create a release branch, update the following files with proper version info:
* [CHANGELOG.md]
* [package.json]

Create pull request, review, publish package, git tag and push, prepare
[package.json] with next dev version, merge, create GitHub release.

## Step by step

1. pull latest `main`
1. review "Unreleased" in [CHANGELOG.md] to double-check if the
   release should be a major, minor, or patch release `vX.Y.Z`
1. create a new branch `release/vX.Y.Z` matching the version number you identified
1. update links and headings in [CHANGELOG.md] to reflect the new version
1. update [package.json] if needed to match the version, and remove any prelease suffix (ensure package-lock.json is up to date)
1. commit your changes
1. open a pull request with your new release branch
1. get the pull request reviewed and approved
1. run `./pre-publish.sh vX.Y.Z` (it will run tests and ensure a clean build, and remind you of the steps below)
1. tag the approved commit `vX.Y.Z`
1. publish the NPM package
1. bump the version in package.json up to the next patch version, with a "-dev" suffix
1. push the branch, then squash merge your changes to `main`
1. *DO NOT* delete the release branch
1. [create a matching GitHub release](https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/new)

[CHANGELOG.md]: ./CHANGELOG.md
[package.json]: ./package.json

## Checklist for Releases

We practice [trunk based development](https://trunkbaseddevelopment.com) and
`main` is the branch we release from.

1. pull latest `main`
1. review "Unreleased" in [the changelog](./CHANGELOG.md) to decide if
   the release is a major, minor, or patch release `vX.Y.Z`
1. create a new branch `release/vX.Y.Z` matching the version
1. update links and headings in [the changelog](./CHANGELOG.md) to reflect the new version
1. update [package.json](./package.json) if needed to match the version, and remove any prelease suffix
1. open a pull request with your release branch
1. get the pull request reviewed and approved
1. tag the approved commit `vX.Y.Z`
1. publish the NPM package
1. bump the version in package.json up to the next patch version, with a "-dev" suffix
1. squash merge the changes to `main`
1. *DO NOT* delete the release branch
1. [create a matching GitHub release](https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/new)

## Setup

1. Clone this repository
3. Run npm install
4. Run the test suite to verify things are working

```shell
git clone git@github.com:SymplifyConversion/sst-sdk-nodejs.git
cd sst-sdk-nodejs
npm install
npm run test
```

## Testing with a local site

See [the examples](examples).

## Running CI locally

You can use [act](https://github.com/nektos/act) to execute the GitHub workflow
locally. It requires Docker.

```shell
act -P ubuntu-latest=shivammathur/node:latest
```

## Checklist for Changes

1. pull latest `main`
1. create a new branch for your changes
1. write code and tests
1. add the change to [the changelog](./CHANGELOG.md) under "Unreleased"
1. get the pull request reviewed and approved
1. squash merge the changes to `main`
1. delete the branch that was merged

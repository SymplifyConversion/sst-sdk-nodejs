# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Added
- A first version of the SDK
  - can generate visitor IDs and store in a cookie
  - can allocate project variations for visitors
  - allocation is based on the djb2 hash function
  - injectable log delegate
  - injectable http fetch delegate

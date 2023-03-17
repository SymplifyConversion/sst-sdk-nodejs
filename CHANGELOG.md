# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed
- add reference in documentation to [SST-documentation](https://github.com/SymplifyConversion/sst-documentation/) 
repository regarding cookie usage and setup

## [0.5.1] - 2022-10-04

### Changed
- changed location from where test data are fetched. 
It now uses the [SST-documentation](https://github.com/SymplifyConversion/sst-documentation/) repository
- changed location of the documentation for Audience and Previewing.
It now uses the [SST-documentations doc folder](https://github.com/SymplifyConversion/sst-documentation/tree/main/docs)

### Removed
- removed all test data from this repository. 
It is now located in [SST-documentations data folder](https://github.com/SymplifyConversion/sst-documentation/tree/main/test)
- removed all documentation in `docs` from this repository.
It is now located in [SST-documentations docs folder](https://github.com/SymplifyConversion/sst-documentation/tree/main/docs)

## [0.5.0] - 2022-08-24
### Added
- project preview support (see docs)

## [0.4.0] - 2022-08-12
### Added
- custom audience support (see docs)

## [0.3.0] - 2022-08-09
### Fixed
- removed URI codec from cookie jar (should be handled outside SDK)
- windowed hash function was not rounding correctly, add `ceil` call for compatibility
### Changed
- add cookie expiry support
- improved compatibility test suite
- improved documentation

## [0.2.0] - 2022-05-18
### Added
- handle optin cookie
- persist allocations in cookie, we want it stable even if config changes
- improve the data driven SDK compatibility test suite
### Changed
- move cookie handling out from visitor module, needed for allocations as well
- total weight is always 100, allows for projects without full allocation
- don't allocate if project is inactive

## [0.1.0] - 2022-05-12
### Added
- A first version of the SDK
  - can generate visitor IDs and store in a cookie
  - can allocate project variations for visitors
  - allocation is based on the djb2 hash function
  - injectable log delegate
  - injectable http fetch delegate

[Unreleased]: https://github.com/SymplifyConversion/sst-sdk-nodejs/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/tag/v0.5.1
[0.5.0]: https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/tag/v0.5.0
[0.4.0]: https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/tag/v0.4.0
[0.3.0]: https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/tag/v0.3.0
[0.2.0]: https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/tag/v0.2.0
[0.1.0]: https://github.com/SymplifyConversion/sst-sdk-nodejs/releases/tag/v0.1.0

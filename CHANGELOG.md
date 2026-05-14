# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0](https://github.com/arthur-nesterenko/vendure-plugin-banner/compare/v2.0.0...v2.1.0) (2026-05-14)


### Features

* add banner position ([54b3e0a](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/54b3e0a57f918491248932208596ff1aebd388bf))
* add collapse section & sync enable checkbox with server ([6f06d09](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/6f06d0905fba73c63d9b59666c4710a5de1bd740))
* add dev server ([f419476](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/f4194765908863fb2454aac6c9967599611f29cd))
* add drag and drop functionality for banner sections ([001450c](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/001450cb1c4f0f4d5e5f5c2f8307a20eb5f5518a))
* add ui & translations ([6d8f280](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/6d8f2805945b583b9fe248715ffb4ec9abc119b3))
* **i18n:** load translation dynamically ([b43f6f0](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/b43f6f0e2ea2a0daa98960c50f14077523ce9b4d))
* implement backend and database entities ([4b86958](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/4b8695847380cd72a9705a629a21d33808738fb5))
* sort banner sections by position ([bd83a31](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/bd83a31e7b9dec8f1e2d88fa762d41b1e63b4143))


### Bug Fixes

* add missing relations & fix upsert section ([5b4ae7d](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/5b4ae7d551bab19cc304dfd65c3e822e9a54f24c))
* **dashboard:** align with Vendure 3.6 SDK and prepare for Hub publish ([#2](https://github.com/arthur-nesterenko/vendure-plugin-banner/issues/2)) ([abaf224](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/abaf224b79839f55f755da124e438c733b2d5ff9))
* handle null value in "name" column of "banner" relation violating not-null constraint ([806974d](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/806974d6d4120a14bf3512896f95df728439b559))
* saving new translations ([50e77ca](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/50e77cae652c14a2447799a04cdba078674a4e71))
* unable to delete banner ([bd5b0f1](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/bd5b0f10bf6a61c1e9873c3dc16e075f78958934))


### Documentation

* add readme ([c99280b](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/c99280bb30341c37ee214d935f589f43f8399d8c))
* revamp README with comprehensive plugin documentation ([6daae5d](https://github.com/arthur-nesterenko/vendure-plugin-banner/commit/6daae5d15ee543054f1e87a7ed288455c129b5ce))

## [Unreleased]

## [2.0.0] - 2026-04-08

v2 is a major rewrite that replaces the Angular-based admin UI with a native React extension for the new Vendure Dashboard. The backend API and database schema are unchanged, so no data migration is required — see the [migration guide](./README.md#migrating-from-v1-to-v2) in the README.

### Added

- Native React-based Vendure Dashboard extension auto-registered via the plugin's `dashboard` hook — no `compileUiExtensions` or `AdminUiPlugin` setup required
- Drag-and-drop reordering of banner sections in the dashboard, powered by `@dnd-kit`
- `BannerEvent` published on Vendure's `EventBus` whenever a banner is created, updated, or deleted — useful for cache invalidation, audit logs, and other side effects
- Polish (`pl`) translation alongside English and Ukrainian
- Lingui-based i18n with `.po` files for dashboard strings
- Comprehensive unit and end-to-end test coverage for the dashboard components and the banner service
- Beta release workflow that publishes preview versions from pull requests

### Changed

- **BREAKING:** Vendure compatibility narrowed to `^3.0.0` (was `^2.0.0 || ^3.0.0`)
- **BREAKING:** Node.js minimum bumped to `>=22`
- Bumped all `@vendure/*` packages to `3.6.0`
- Migrated CI tooling from Yarn to npm
- Replaced JSON translation files with Lingui `.po` format

### Fixed

- Updating non-translatable fields on existing banner sections previously left them unchanged
- Section ordering is now persisted reliably after drag-and-drop save

### Removed

- **BREAKING:** Angular admin UI extension. `BannerPlugin.ui` no longer exists — projects on the Angular Admin UI must stay on `vendure-banner-plugin@^1.0.0`

## [1.x]

See the [v1 branch](https://github.com/arthur-nesterenko/vendure-plugin-banner/tree/v1) for the v1 release history. v1 is in maintenance mode and only receives security fixes.

[Unreleased]: https://github.com/arthur-nesterenko/vendure-plugin-banner/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/arthur-nesterenko/vendure-plugin-banner/releases/tag/v2.0.0

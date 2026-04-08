# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

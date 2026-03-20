# Vendure Banner Plugin

[![npm version](https://img.shields.io/npm/v/vendure-banner-plugin.svg)](https://www.npmjs.com/package/vendure-banner-plugin)
[![npm downloads](https://img.shields.io/npm/dm/vendure-banner-plugin.svg)](https://www.npmjs.com/package/vendure-banner-plugin)
[![license](https://img.shields.io/npm/l/vendure-banner-plugin.svg)](https://github.com/arthur-nesterenko/vendure-plugin-banner/blob/main/LICENSE)
[![Code Quality](https://github.com/arthur-nesterenko/vendure-plugin-banner/actions/workflows/code-quality.yml/badge.svg)](https://github.com/arthur-nesterenko/vendure-plugin-banner/actions/workflows/code-quality.yml)

A plugin for [Vendure](https://www.vendure.io/) that adds dynamic promotional banners to your e-commerce store. Create banners with multiple sections, each featuring translatable content, cover images, and links to products, collections, or external URLs.

## Version Compatibility

| Plugin version | Vendure version | Admin UI | Status |
|---|---|---|---|
| **2.x** (current) | 3.x | React Dashboard | Active development |
| [**1.x**](https://github.com/arthur-nesterenko/vendure-plugin-banner/tree/v1) | 2.x – 3.x | Angular (`compileUiExtensions`) | Maintenance only |

> **Important:** v2 completely removes Angular UI support. If your project relies on the Angular-based admin UI or `compileUiExtensions`, use the [`v1` branch](https://github.com/arthur-nesterenko/vendure-plugin-banner/tree/v1) and install with `npm install vendure-banner-plugin@^1.0.0`.

## Features

- **Multi-section banners** — each banner supports multiple sections with independent content and ordering
- **Translatable content** — title, description, and call-to-action text per language (English, Ukrainian, Polish)
- **Flexible linking** — link each section to a product, collection, or external URL
- **Cover images** — attach images from the Vendure asset system
- **Shop API** — query banners by ID or name for your storefront
- **Access control** — dedicated permission for banner management in the admin

## Requirements

- Vendure `^3.0.0`
- Node.js `>=22`

## Getting Started

### 1. Install the plugin

```bash
npm install vendure-banner-plugin
```

### 2. Add it to your Vendure config

```typescript
import { BannerPlugin } from 'vendure-banner-plugin';

export const config: VendureConfig = {
    plugins: [
        BannerPlugin,
        // ...other plugins
    ],
};
```

The dashboard UI registers automatically. No `compileUiExtensions`, `AdminUiPlugin`, or additional build configuration is required.

### 3. Run a database migration

The plugin adds new tables for banners, sections, and translations. Generate and apply a migration:

```bash
npx vendure migrate
```

### 4. Manage banners

Open the Vendure dashboard. You'll find a **Banners** section in the navigation where you can create, edit, and organize your banners.

## Querying Banners (Shop API)

Use the Shop API to fetch banners on your storefront.

**Get a banner by name:**

```graphql
query {
    bannerByName(name: "homepage-hero") {
        id
        name
        enabled
        sections {
            title
            description
            callToAction
            externalLink
            position
            asset {
                preview
            }
            product {
                id
                slug
            }
            collection {
                id
                slug
            }
        }
    }
}
```

**Get a banner by ID:**

```graphql
query {
    banner(id: "1") {
        id
        name
        sections {
            title
            callToAction
            asset {
                preview
            }
        }
    }
}
```

## Migrating from v1 to v2

v2 is a major update that replaces the Angular admin UI with a native React-based Vendure Dashboard extension. **The backend API and database schema are unchanged** — no data migration is needed.

### What changed

| | v1 | v2 |
|---|---|---|
| **Admin UI** | Angular with `compileUiExtensions` | React Dashboard (auto-registered) |
| **UI setup** | Manual `AdminUiPlugin` configuration | Zero-config — just add `BannerPlugin` |
| **Vendure** | 2.x – 3.x | 3.x only |
| **i18n format** | JSON translation files | Lingui `.po` files |
| **Languages** | English, Ukrainian | English, Ukrainian, Polish |
| **Node.js** | >=18 | >=22 |

### Step-by-step migration

1. **Update the plugin:**

    ```bash
    npm install vendure-banner-plugin@latest
    ```

2. **Remove the old UI extension setup.** In your Vendure config, delete the `BannerPlugin.ui` reference and any related `compileUiExtensions` configuration:

    ```diff
    - import { compileUiExtensions } from '@vendure/ui-devkit/compiler';

      export const config: VendureConfig = {
          plugins: [
              BannerPlugin,
    -         AdminUiPlugin.init({
    -             port: 3002,
    -             route: 'admin',
    -             app: compileUiExtensions({
    -                 outputPath: path.join(__dirname, '../admin-ui'),
    -                 extensions: [BannerPlugin.ui],
    -             }),
    -         }),
          ],
      };
    ```

3. **Verify.** Start your Vendure server and open the dashboard. The Banners section should appear automatically.

### Staying on v1

If you're not ready to migrate or need the Angular UI, pin your dependency to v1:

```bash
npm install vendure-banner-plugin@^1.0.0
```

The v1 branch receives security fixes only. New features are developed exclusively on v2.

## Development

```bash
npm install          # Install dependencies
npm run start        # Start dev server
npm run e2e          # Run e2e tests
npm run test:unit    # Run unit tests
npm run lint         # Lint
npm run prettify     # Format
npm run build        # Production build
```

## License

MIT

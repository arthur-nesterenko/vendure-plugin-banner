# Vendure Banner Plugin

A plugin for [Vendure](https://www.vendure.io/) that adds dynamic promotional banners to your e-commerce store. Create banners with multiple sections, each with translatable content, cover images, and links to products or collections.

> **v1 users:** The v1.x branch with the legacy Angular UI is maintained at [`v1`](https://github.com/arthur-nesterenko/vendure-plugin-banner/tree/v1).

## Features

- Multi-section banners with drag-and-drop ordering
- Translatable content (title, description, call-to-action)
- Link sections to products, collections, or external URLs
- Cover images via Vendure asset system
- Shop API for storefront queries (by ID or name)
- Custom permission for admin access control
- React-based dashboard UI (Vendure 3.x Dashboard)

## Requirements

- Vendure `^3.0.0`
- Node.js `>=22`

## Installation

```bash
npm install vendure-banner-plugin
```

For the v2 prerelease with the new React dashboard:

```bash
npm install vendure-banner-plugin@next
```

## Configuration

```typescript
import { BannerPlugin } from 'vendure-banner-plugin';

export const config: VendureConfig = {
    plugins: [
        BannerPlugin,
        // ...other plugins
    ],
};
```

That's it — the dashboard UI registers automatically via the `dashboard` entry point. No `compileUiExtensions` or `AdminUiPlugin` setup needed.

## GraphQL API

### Shop API

```graphql
# Get a banner by name
query GetBanner {
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

### Admin API

```graphql
# List all banners
query ListBanners {
    banners {
        items {
            id
            name
            enabled
        }
        totalItems
    }
}

# Create a banner
mutation CreateBanner {
    createBanner(input: {
        name: "homepage-hero"
        enabled: true
        sections: [{
            position: 0
            assetId: "1"
            productId: "42"
            translations: [{
                languageCode: en
                title: "Summer Sale"
                description: "Up to 50% off"
                callToAction: "Shop Now"
            }]
        }]
    }) {
        id
    }
}
```

## Migrating from v1

v2 replaces the Angular admin UI with a React-based dashboard. The backend API is unchanged.

| | v1 | v2 |
|---|---|---|
| Admin UI | Angular (`compileUiExtensions`) | React Dashboard (automatic) |
| Vendure | 2.x – 3.x | 3.x |
| i18n | JSON files | Lingui (`.po` files) |
| Languages | English, Ukrainian | English, Ukrainian, Polish |

To migrate, update the plugin and remove the `AdminUiPlugin` / `compileUiExtensions` setup — the dashboard UI is now registered automatically.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run start

# Run e2e tests
npm run e2e

# Run unit tests
npm run test:unit

# Lint & format
npm run lint
npm run prettify

# Build for production
npm run build
```

## License

MIT

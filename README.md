# Vendure Banner Plugin

This is a plugin for the [Vendure e-commerce framework](https://www.vendure.io/) designed to enhance the visual appeal and interactivity of your e-commerce site. The Vendure Banner Plugin allows for the creation of dynamic banners that can be added to any page.

## Getting Started

### Installation

Install the plugin using npm or yarn:

```bash
npm install vendure-banner-plugin
```

or

```bash
yarn add vendure-banner-plugin
```

### Configuration

Import and configure the plugin in your Vendure configuration:

```typescript
import { BannerPlugin } from 'vendure-banner-plugin';

export const config: VendureConfig = {
    plugins: [
        BannerPlugin,
        AdminUiPlugin.init({
            port: 3002,
            route: 'admin',
            app: compileUiExtensions({
                outputPath: path.join(__dirname, '../admin-ui'),
                extensions: [BannerPlugin.ui],
            }),
        }),
    ],
};
```

### Usage

Once installed and configured, you can manage banners through the Vendure admin interface.

### GraphQL API

Query banners using the following GraphQL query:

```graphql
query GetBanners {
    banners {
        id
        name
        enabled
        sections {
            id
            imageUrl
            link
            callToActionText
        }
    }
}
```

## Development

### Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start development server:

```bash
npm run start
# or
yarn start
```

The development server will watch for changes and automatically recompile as needed.

### Building for Production

Build the plugin for production use:

```bash
npm run build
# or
yarn build
```

This will create an optimized build ready for deployment.

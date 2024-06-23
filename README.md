This is a plugin for the [Vendure e-commerce framework](https://www.vendure.io/) designed to enhance the visual appeal and interactivity of your e-commerce site. The Vendure Banner Plugin allows for the creation of dynamic banners that can be added to any page.

## Getting Started

To integrate the Vendure Banner Plugin into your Vendure project, follow these steps:

1. **Installation**: Begin by adding the plugin to your project:

    ```shell
    npm install vendure-banner-plugin
    ```

    or

    ```shell
    yarn add vendure-banner-plugin
    ```

2. **Configuration**: Next, import and configure the plugin within your Vendure configuration:

    ```typescript
    import { BannerPlugin } from 'vendure-banner-plugin';

    export const config: VendureConfig = {
        // Other configuration options...
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

3. **Usage**: Once installed and configured, you can start creating and managing banners through the Vendure admin interface.

#### **GRAPHQL**

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

#### **Install Dependencies**: Install the necessary dependencies using npm or yarn:

    ```shell
    npm install
    ```
    or
    ```shell
    yarn install
    ```

#### **Start Development Server**: To start the development server and test your changes in real-time, run:

    ```shell
    npm run start
    ```
    or
    ```shell
    yarn start
    ```
    This command will compile the plugin and watch for any changes, automatically recompiling as needed.

#### **Building**: Once you are satisfied with your changes, build the plugin for production:

    ```shell
    npm run build
    ```
    or
    ```shell
    yarn build
    ```
    This command will compile the plugin into an optimized version ready for deployment.

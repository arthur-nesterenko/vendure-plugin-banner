import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { BannerService } from './service/banner.service';
import { BannerShopResolver } from './api/banner-shop.resolver';
import { BannerAdminResolver } from './api/banner-admin.resolver';
import { shopApiExtensions, adminApiExtensions } from './api/api-extensions';
import { Banner } from './entities/banner.entity';
import { BannerSection } from './entities/banner-section.entity';
import { BannerSectionTranslation } from './entities/banner-section-translation.entity';
import { BannerPermission } from './banner-permissions';

/**
 * @description
 * The `BannerPlugin` adds dynamic promotional banners to a Vendure store.
 * Each banner is composed of one or more sections that can hold a cover
 * image, translatable content, and a link to a product, collection, or
 * external URL. Sections can be reordered via drag-and-drop in the
 * dashboard.
 *
 * The plugin auto-registers a React-based extension for the Vendure
 * Dashboard — no `compileUiExtensions` or `AdminUiPlugin` setup is
 * required.
 *
 * @example
 * ```ts
 * import { BannerPlugin } from 'vendure-banner-plugin';
 *
 * export const config: VendureConfig = {
 *     plugins: [
 *         BannerPlugin,
 *         // ...other plugins
 *     ],
 * };
 * ```
 *
 * @category Plugin
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [Banner, BannerSection, BannerSectionTranslation],
    providers: [BannerService],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [BannerShopResolver],
    },
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [BannerAdminResolver],
    },
    configuration: config => {
        config.authOptions.customPermissions.push(BannerPermission);
        return config;
    },
    compatibility: '^3.0.0',
    dashboard: './dashboard/index.tsx',
})
export class BannerPlugin {}

import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { BannerService } from './service/banner.service';
import { BannerShopResolver } from './api/banner-shop.resolver';
import { BannerAdminResolver } from './api/banner-admin.resolver';
import { shopApiExtensions, adminApiExtensions } from './api/api-extensions';
import { Banner } from './entities/banner.entity';
import { BannerSection } from './entities/banner-section.entity';
import { BannerSectionTranslation } from './entities/banner-section-translation.entity';
import { BannerPermission } from './banner-permissions';

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

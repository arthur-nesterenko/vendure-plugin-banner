import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { BannerService } from './service/banner.service';
import { BannerShopResolver } from './api/banner-shop.resolver';
import { BannerAdminResolver } from './api/banner-admin.resolver';
import { shopApiExtensions, adminApiExtensions } from './api/api-extensions';
import { Banner } from './entities/banner.entity';
import { BannerSection } from './entities/banner-section.entity';
import { BannerSectionTranslation } from './entities/banner-section-translation.entity';
import { BannerPermission } from './banner-permissions';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import * as path from 'path';
import fs from 'fs';

const translationsDir = path.join(__dirname, 'translations');
const availableLanguages = fs
    .readdirSync(translationsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'));

const translations: Record<string, string> = {};
availableLanguages.forEach(lang => {
    translations[lang] = path.join(translationsDir, `${lang}.json`);
});

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
})
export class BannerPlugin {
    static ui: AdminUiExtension = {
        translations,
        extensionPath: path.join(__dirname, 'ui'),
        providers: ['providers.ts'],
        routes: [{ route: 'banner', filePath: 'routes.ts' }],
    };
}

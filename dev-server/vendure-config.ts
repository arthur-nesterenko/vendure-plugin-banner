import {
    dummyPaymentHandler,
    VendureConfig,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
} from '@vendure/core';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';
import { BannerPlugin } from '../src';
import { compileUiExtensions } from '@vendure/ui-devkit/compiler';

export const headlessConfig: VendureConfig = {
    apiOptions: {
        port: 4000,
        adminApiPath: 'admin-api',
        adminApiPlayground: {
            settings: {
                'request.credentials': 'include',
            } as any,
        },
        adminApiDebug: true,
        shopApiPath: 'shop-api',
        shopApiPlayground: {
            settings: {
                'request.credentials': 'include',
            } as any,
        },
        shopApiDebug: true,
    },
    authOptions: {
        superadminCredentials: {
            identifier: 'superadmin',
            password: 'superadmin',
        },
        cookieOptions: {
            secret: 'secret',
        },
    },
    dbConnectionOptions: {
        type: 'better-sqlite3',
        synchronize: true,
        logging: false,
        migrations: [path.join(__dirname, '../migrations/*.ts')],
        database: path.join(__dirname, '../banner-vendure.sqlite'),
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {},
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, './static/assets'),
        }),
        DefaultJobQueuePlugin,
        DefaultSearchPlugin,
        BannerPlugin,
    ],
};

export const config: VendureConfig = {
    ...headlessConfig,
    plugins: [
        ...(headlessConfig.plugins || []),
        AdminUiPlugin.init({
            route: 'admin',
            port: 4002,
            app: compileUiExtensions({
                outputPath: path.join(__dirname, 'admin-ui'),
                devMode: true,
                extensions: [BannerPlugin.ui],
            }),
        }),
    ],
};

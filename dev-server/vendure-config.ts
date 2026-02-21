import {
    dummyPaymentHandler,
    VendureConfig,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    DefaultSchedulerPlugin,
} from '@vendure/core';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import path from 'path';
import { BannerPlugin } from '../src';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';

export const headlessConfig: Partial<VendureConfig> = {
    customFields: {},
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, './static/assets'),
        }),
        DefaultJobQueuePlugin,
        DefaultSearchPlugin,
        BannerPlugin,
        DefaultSchedulerPlugin.init(),
        GraphiqlPlugin.init(),
    ],
};

export const config: VendureConfig = {
    ...headlessConfig,
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
    plugins: [
        ...(headlessConfig.plugins || []),
        DashboardPlugin.init({
            // The route should correspond to the `base` setting
            // in the vite.config.mts file
            route: 'dashboard',
            // This appDir should correspond to the `build.outDir`
            // setting in the vite.config.mts file
            appDir: './dist/dashboard',
        }),
    ],
};

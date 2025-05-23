import { bootstrap, mergeConfig, VendureConfig } from '@vendure/core';
import path from 'node:path';
import { generate } from '@graphql-codegen/cli';

export const config: VendureConfig = {
    apiOptions: {
        port: 3123,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: 'superadmin',
            password: 'superadmin',
        },
    },
    dbConnectionOptions: {
        type: 'sqljs',
        synchronize: true,
        logging: false,
    },
    paymentOptions: {
        paymentMethodHandlers: [],
    },
    plugins: [],
};

/**
 * A helper function that will generate GraphQL types for a plugin.
 * @param pluginConfig
 * @param options
 */
export async function generateTypes(
    pluginConfig: Partial<VendureConfig>,
    options: {
        /**
         * The directory of the plugin.
         */
        pluginDir: string;
        ui: boolean;
        common: boolean;
    },
) {
    const mergedConfig = mergeConfig(config, pluginConfig);
    const app = await bootstrap(mergedConfig);
    const generateCommonConfig = {
        strict: true,
        maybeValue: 'T',
        deprecatedFieldsWithReason: true,
        inputValueDeprecation: true,
        namingConvention: {
            enumValues: 'keep',
        },
        scalars: {
            ID: 'string | number',
            Money: 'number',
        },
    };

    async function generateTypes(api: 'shop' | 'admin', outputFile: string, documents?: string | string[]) {
        await generate({
            config: generateCommonConfig,
            schema: `http://localhost:${config.apiOptions.port}/${api}-api`,
            documents,
            generates: {
                [path.join(options.pluginDir, outputFile)]: {
                    plugins: [
                        'typescript',
                        ...(documents ? ['typescript-operations', 'typed-document-node'] : []),
                    ],
                },
            },
        });
    }

    const tasks: Promise<void>[] = [];

    if (options.common) {
        tasks.push(
            generateTypes('shop', 'src/generated-shop-types.ts'),
            generateTypes('admin', 'src/generated-admin-types.ts'),
        );
    }

    if (options.ui) {
        tasks.push(
            generateTypes(
                'admin',
                'src/ui/generated-types.ts',
                path.join(options.pluginDir, 'src/ui/**/*.ts'),
            ),
        );
    }

    await Promise.allSettled(tasks);
    await app.close();
}

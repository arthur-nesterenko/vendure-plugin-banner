import { vendureDashboardPlugin } from '@vendure/dashboard/vite';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/dashboard',
    build: {
        outDir: join(__dirname, 'dist/dashboard'),
    },
    plugins: [
        vendureDashboardPlugin({
            // The vendureDashboardPlugin will scan your configuration in order
            // to find any plugins which have dashboard extensions, as well as
            // to introspect the GraphQL schema based on any API extensions
            // and custom fields that are configured.
            vendureConfigPath: pathToFileURL('./dev-server/vendure-config.ts'),
            // Points to the location of your Vendure server.
            api: { host: 'http://localhost', port: 4000 },
            // When you start the Vite server, your Admin API schema will
            // be introspected and the types will be generated in this location.
            // These types can be used in your dashboard extensions to provide
            // type safety when writing queries and mutations.
            gqlOutputPath: './src/gql',
            pathAdapter: {
                getCompiledConfigPath: ({ inputRootDir, outputPath, configFileName }) => {
                    // Preserve the directory structure relative to project root
                    // If config is in dev-server/, preserve that in the output path
                    const projectRoot = __dirname;
                    const relativePath = inputRootDir.replace(projectRoot, '').replace(/^[/\\]/, '');
                    const jsFileName = configFileName.replace('.ts', '.js');

                    if (relativePath) {
                        return join(outputPath, relativePath, jsFileName);
                    }
                    return join(outputPath, jsFileName);
                },
            },
        }),
    ],
    resolve: {
        alias: {
            // This allows all plugins to reference a shared set of
            // GraphQL types.
            '@/gql': resolve(__dirname, './src/gql/graphql.ts'),
        },
    },
});

import { vendureDashboardPlugin } from '@vendure/dashboard/vite';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';

// The dashboard config lives in dev-server/ but imports from ../src/.
// We need the compiler's sourceRoot to be the project root so that both
// dev-server/ and src/ are mirrored into the temp output directory and
// the relative require("../src") in the compiled config resolves
// correctly back into our plugin sources.
const projectRoot = __dirname;
const configRelativePath = 'dev-server/vendure-config.ts';
const configDirRelativeToRoot = 'dev-server';

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
            vendureConfigPath: pathToFileURL(configRelativePath),
            // Points to the location of your Vendure server.
            api: { host: 'http://localhost', port: 4000 },
            // When you start the Vite server, your Admin API schema will
            // be introspected and the types will be generated in this location.
            // These types can be used in your dashboard extensions to provide
            // type safety when writing queries and mutations.
            gqlOutputPath: './src/gql',
            pathAdapter: {
                sourceRoot: projectRoot,
                getCompiledConfigPath: ({ outputPath, configFileName }) =>
                    join(outputPath, configDirRelativeToRoot, configFileName.replace(/\.ts$/, '.js')),
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

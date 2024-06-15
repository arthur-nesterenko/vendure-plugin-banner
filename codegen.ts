import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    config: {
        strict: true,
        namingConvention: {
            typeNames: 'change-case-all#pascalCase',
            enumValues: 'keep',
        },
        scalars: {
            ID: 'string',
            Money: 'number',
            DateTime: { input: 'Date', output: 'string' },
        },
        maybeValue: 'T',
    },
    generates: {
        'src/ui/generated/generated-admin-types.ts': {
            schema: 'http://localhost:4000/admin-api',
            plugins: ['typescript'],
        },
        'src/ui/generated/generated-shop-types.ts': {
            schema: 'http://localhost:4000/shop-api',
            plugins: ['typescript'],
        },
        'src/ui/generated/ui.ts': {
            schema: 'http://localhost:4000/admin-api',
            documents: 'src/ui/**/*.graphql.ts',
            plugins: ['typescript', 'typescript-operations', 'typescript-document-nodes'],
        },
    },
};
export default config;

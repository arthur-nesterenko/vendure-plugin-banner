import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'unit',
        include: ['src/dashboard/**/*.spec.{ts,tsx}'],
        environment: 'jsdom',
        setupFiles: [path.join(__dirname, 'src/dashboard/test/setup.ts')],
        globals: false,
    },
    resolve: {
        alias: {
            '@/gql': path.resolve(__dirname, 'src/gql/graphql.ts'),
        },
    },
});

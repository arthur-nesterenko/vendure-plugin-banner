import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'e2e',
        include: ['./e2e/**/*.e2e.spec.ts'],
        typecheck: {
            tsconfig: path.join(__dirname, 'tsconfig.e2e.json'),
        },
    },
    plugins: [
        swc.vite({
            jsc: {
                transform: {
                    useDefineForClassFields: false,
                },
            },
        }),
    ],
});

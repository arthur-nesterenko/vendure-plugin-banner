import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: ['./vitest.e2e.config.ts', './vitest.unit.config.ts'],
    },
});

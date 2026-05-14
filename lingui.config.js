import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
    sourceLocale: 'en',
    locales: ['en', 'uk', 'pl'],
    catalogs: [
        {
            path: '<rootDir>/src/dashboard/i18n/{locale}',
            include: ['<rootDir>/src/dashboard'],
        },
    ],
    format: formatter({ lineNumbers: false }),
});

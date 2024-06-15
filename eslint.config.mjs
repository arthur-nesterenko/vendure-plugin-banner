import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-plugin-prettier/recommended';

export default [
    {
        ignores: [
            'node_modules',
            'dist',
            'build',
            '**/generated/',
            '**/admin-ui/',
            '**/static/',
            '*.config.js',
        ],
    },
    ...tseslint.configs.recommended,
    eslint.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                __dirname: true,
                console: true,
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
];

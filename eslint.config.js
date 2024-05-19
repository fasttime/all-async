import { createConfig } from '@origin-1/eslint-config';
import globals          from 'globals';

const config =
await createConfig
(
    { ignores: ['.*', 'coverage', 'dist'] },
    {
        files:              ['eslint.config.js', 'dev/*.js'],
        languageOptions:    { globals: globals.node },
        jsVersion:          2024,
    },
    {
        files:              ['src/*.js', 'test/**/*.js'],
        jsVersion:          2022,
    },
    {
        files:              ['src/*.ts'],
        tsVersion:          '5.0.0',
        languageOptions:    { parserOptions: { project: 'tsconfig.json' } },
    },
    {
        files:              ['test/*.js'],
        languageOptions:    { globals: globals['shared-node-browser'] },
    },
    {
        files:              ['test/browser-spec-runner-files/*.js'],
        languageOptions:    { globals: globals.browser },
    },
);

export default config;

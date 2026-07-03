// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const oneDeclarationPerFile = require('./eslint-rules/one-declaration-per-file');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'public/**', 'eslint-rules/**'],
  },
  {
    // Repo standard (CLAUDE.md §Mandatory coding standards #1): one top-level
    // class / interface / type alias / enum per file.
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      recipely: {
        rules: { 'one-declaration-per-file': oneDeclarationPerFile },
      },
    },
    rules: {
      'recipely/one-declaration-per-file': 'error',
    },
  },
  {
    // Test scaffolding (local stub configs, harness option interfaces) is not
    // part of the layered architecture; declaration files carry no runtime code.
    files: [
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.d.ts',
    ],
    rules: {
      'recipely/one-declaration-per-file': 'off',
    },
  },
]);

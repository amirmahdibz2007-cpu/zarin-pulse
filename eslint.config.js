import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/coverage/**',
      'data/**',
      'docs/**',
      'v2/**',
      '**/*_files/**',
      '**/*.html',
      'apps/web/public/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['packages/contracts/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@zarinpulse/*'],
              message: 'contracts has no package dependencies',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/etl/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@zarinpulse/web', message: 'etl cannot import web' }],
        },
      ],
    },
  },
  {
    files: ['apps/web/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@zarinpulse/etl', message: 'web cannot import etl' },
            { name: '@zarinpulse/analytics', message: 'web cannot import analytics' },
            { name: '@zarinpulse/calendar', message: 'web cannot import calendar' },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
  },
);

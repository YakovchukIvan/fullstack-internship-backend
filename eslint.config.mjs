import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', '**/*.d.ts', '**/migrations/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // ==================== Prettier ====================
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],

      // ==================== TypeScript rules ====================
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/return-await': ['error', 'never'],
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // ==================== Unused imports ====================
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ==================== General rules ====================
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn'] }],
      'no-debugger': 'error',
      curly: ['error', 'all'],
      'guard-for-in': 'error',
      eqeqeq: 'off',
      'default-case': 'error',
      'no-fallthrough': 'error',
      'arrow-body-style': ['error', 'as-needed'],

      // ==================== Code quality ====================
      'no-duplicate-case': 'error',
      'no-template-curly-in-string': 'error',
      'no-this-before-super': 'error',
      'no-cond-assign': 'error',

      // ==================== Code style ====================
      'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
    },
  },
);

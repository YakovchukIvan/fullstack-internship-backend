import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', '**/*.d.ts'],
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
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Prettier
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],

      // TypeScript rules (адаптовані з TSLint)
      '@typescript-eslint/no-explicit-any': 'error', // no-any
      '@typescript-eslint/no-var-requires': 'error', // no-var-requires
      '@typescript-eslint/no-floating-promises': 'error', // await-promise
      '@typescript-eslint/require-await': 'error', // promise-function-async
      '@typescript-eslint/await-thenable': 'error', // await-promise
      '@typescript-eslint/no-unused-vars': 'off', // вимкнено, використовується unused-imports/no-unused-vars
      '@typescript-eslint/no-shadow': 'error', // no-shadowed-variable
      '@typescript-eslint/no-misused-new': 'error', // no-misused-new
      '@typescript-eslint/return-await': ['error', 'never'], // no-return-await
      '@typescript-eslint/prefer-for-of': 'error', // prefer-for-of
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Unused imports (автоматичне видалення)
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

      // General rules
      'no-var': 'error', // no-var-keyword
      'prefer-const': 'error', // prefer-const
      'no-console': ['error', { allow: ['warn'] }], // no-console (дозволяємо warn)
      'no-debugger': 'error', // no-debugger
      curly: ['error', 'all'], // curly
      'guard-for-in': 'error', // forin
      eqeqeq: 'off', // triple-equals: false
      'default-case': 'error', // switch-default
      'no-fallthrough': 'error', // no-switch-case-fall-through
      'arrow-body-style': ['error', 'as-needed'], // arrow-return-shorthand

      // Code quality
      'no-duplicate-case': 'error', // no-duplicate-switch-case
      'no-template-curly-in-string': 'error', // no-invalid-template-strings
      'no-this-before-super': 'error', // no-duplicate-super
      'no-cond-assign': 'error', // no-tautology-expression

      // Style rules
      'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true }], // max-line-length
      quotes: ['error', 'single', { avoidEscape: true }], // quotemark
      semi: ['error', 'always'], // semicolon
    },
  },
);

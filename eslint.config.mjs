// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import stylisticTs from '@stylistic/eslint-plugin-ts';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettierConfig,
  ],
  plugins: {
    '@stylistic/ts': stylisticTs,
  },
  rules: {
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@stylistic/ts/indent': ['error', 2],
    '@stylistic/ts/space-before-function-paren': ['error', 'always'],
    '@stylistic/ts/semi': ['error', 'never'],
    '@stylistic/ts/quotes': ['error', 'single'],
  },
});

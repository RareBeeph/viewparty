import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import tseslint from 'typescript-eslint';
import { join } from 'node:path';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx,tsx}'] },
  {
    files: ['**/*.{js,mjs,cjs,jsx,tsx}'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-arrow-functions/prefer-arrow-functions': [
        'warn',
        {
          allowedNames: [],
          allowNamedFunctions: false,
          allowObjectProperties: false,
          classPropertiesAllowed: false,
          disallowPrototype: false,
          returnStyle: 'unchanged',
          singleReturnOnly: false,
        },
      ],

      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    },
    plugins: {
      'prefer-arrow-functions': pluginPreferArrowFunctions,
    },
  },

  pluginPrettierRecommended,

  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],

  {
    files: ['**/*.{js,mjs,cjs,jsx,tsx}'],
    plugins: { 'react-hooks': pluginReactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  { ignores: ['**/*.{js,jsx}'] },
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    settings: { react: { version: 'detect' } },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: join(import.meta.dirname, 'client'),
      },
    },
  },

  { ignores: ['./wailsjs'] },
];

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: ["dist/**", "node_modules/**"], // 👈 ignore here
  },
  
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      '@typescript-eslint/no-explicit-any': 'off',
      "no-unused-vars": "off",
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
];
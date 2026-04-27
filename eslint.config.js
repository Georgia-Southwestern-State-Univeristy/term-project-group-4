import globals from 'globals';

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
  // DOM-using tests run under Vitest's jsdom environment (set per-file via
  // `// @vitest-environment jsdom`). Add browser globals so ESLint recognizes
  // `document`, `window`, etc. at static-analysis time.
  {
    files: ['tests/checklistRenderer.test.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];

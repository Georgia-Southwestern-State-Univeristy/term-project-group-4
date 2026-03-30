import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Include only unit tests, exclude E2E tests
    include: ['tests/**/*.test.js', 'app.test.js'],
    exclude: ['tests/e2e/**', 'node_modules', 'dist'],
    globals: true,
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/**/*.test.ts',
      'scripts/**/*.test.ts',
      'apps/**/*.test.ts',
    ],
    exclude: ['v2/**', '**/node_modules/**', '**/.next/**'],
    reporters: ['default'],
  },
});

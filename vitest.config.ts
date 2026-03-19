import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Exclude Playwright E2E tests from Vitest
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      // Exclude Playwright tests (using .spec.ts pattern)
      '**/tests/cross-browser/**',
      '**/tests/**/*.spec.ts',
      '**/*.spec.ts',
    ],
    // Only include Vitest unit tests (using .test.ts pattern)
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
});

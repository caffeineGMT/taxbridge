module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 60000,
      url: ['http://localhost:3000', 'http://localhost:3000/tax-calculator', 'http://localhost:3000/pricing'],
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: ['uses-http2'],
        chromeFlags: '--no-sandbox --disable-gpu --headless',
        budgets: require('./budgets.json')
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.90 }],

        // Core Web Vitals thresholds (as required)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'first-input-delay': ['error', { maxNumericValue: 100 }], // < 100ms (Note: FID deprecated, using TBT as proxy)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1
        'total-blocking-time': ['error', { maxNumericValue: 200 }], // < 200ms (proxy for FID)
        'speed-index': ['error', { maxNumericValue: 3400 }], // < 3.4s
        'interactive': ['error', { maxNumericValue: 3800 }], // < 3.8s
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }], // < 1.8s
        'max-potential-fid': ['error', { maxNumericValue: 130 }], // < 130ms

        // Performance budgets - Bundle size enforcement (< 200KB total)
        'performance-budget': ['error', { maxLength: 0 }], // Fail if any budget exceeded
        'resource-summary:script:size': ['error', { maxNumericValue: 153600 }], // 150KB in bytes
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 30720 }], // 30KB in bytes
        'resource-summary:total:size': ['error', { maxNumericValue: 204800 }], // 200KB in bytes
        'resource-summary:image:size': ['error', { maxNumericValue: 102400 }], // 100KB in bytes
        'resource-summary:font:size': ['error', { maxNumericValue: 51200 }], // 50KB in bytes

        // Resource optimizations
        'unused-javascript': ['warn', { maxLength: 0 }],
        'unused-css-rules': ['warn', { maxLength: 0 }],
        'modern-image-formats': ['warn', { maxLength: 0 }],
        'uses-responsive-images': ['warn', { maxLength: 0 }],
        'efficient-animated-content': ['warn', { maxLength: 0 }],
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        'uses-text-compression': ['error', { maxLength: 0 }],
        'uses-rel-preconnect': ['warn', { maxLength: 0 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

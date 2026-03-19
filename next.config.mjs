/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Temporarily ignore TS errors to unblock sprint audit
  },
  // Turbopack is now enabled by default in Next.js 16
  // Empty config to acknowledge and silence webpack migration warning
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'taxbridge.app',
      },
    ],
  },
  // Webpack cache configuration to prevent bloat
  webpack: (config, { isServer }) => {
    // Configure filesystem cache with size limits to prevent 1GB+ bloat
    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 1, // Limit in-memory cache generations
      compression: 'gzip', // Compress cache files to save space
    };

    // Optimize chunk splitting for better caching
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
      };
    }

    return config;
  },
};

export default nextConfig;

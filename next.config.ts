import type { NextConfig } from 'next';

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TS errors during build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'george-fx.github.io',
      },
      {
        protocol: 'https',
        hostname: 'admin.thomsonscasastore.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'shopadmin.inygo.in',
      },
      {
        protocol: 'https',
        hostname: 'shopadmin.inygo.in',
      },
    ],
  },

};

module.exports = withPWA(nextConfig);

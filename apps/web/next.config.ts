import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zarinpulse/contracts'],
};

export default nextConfig;

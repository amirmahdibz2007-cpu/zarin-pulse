import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zarinpulse/contracts'],
  // Phone / LAN access to `next dev` (HMR + chunks) — otherwise mobile loads a blank shell.
  allowedDevOrigins: ['192.168.1.103', '127.0.0.1', 'localhost'],
};

export default nextConfig;

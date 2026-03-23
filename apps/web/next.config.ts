import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['esbuild'],
  },
  serverExternalPackages: ['esbuild'],
};

export default nextConfig;

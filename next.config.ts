import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for Railway deployment (server-side rendering)
  // For static export to OnHyper, add back: output: 'export'
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
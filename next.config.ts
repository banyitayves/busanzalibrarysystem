import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
  // Enable incremental static regeneration for better performance
  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pdf-parse'],
  // Note: File size limits are handled by web server config (Vercel/nginx)
  // Next.js 16 doesn't use the api.bodyParser configuration
};

export default nextConfig;

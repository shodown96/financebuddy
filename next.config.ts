import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Room for scanned PDFs and screenshots sent to the stock analysis action
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;

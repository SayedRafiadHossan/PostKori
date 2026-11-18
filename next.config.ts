import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product photos can be a few MB — allow larger request bodies for server actions later.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;

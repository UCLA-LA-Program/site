import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.laprogramucla.com",
        pathname: "/avatars/**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;

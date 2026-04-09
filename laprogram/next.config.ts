import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL(process.env.NEXT_PUBLIC_BUCKET_URL + "/avatars/**"),
      { protocol: "https", hostname: "storage.laprogramucla.com", pathname: "/avatars/**" },
    ],
  },
};

export default nextConfig;

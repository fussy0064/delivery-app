import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Helps with Leaflet and some packages on Vercel
  transpilePackages: ["react-leaflet", "leaflet"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unpkg.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const apiUrl = process.env.API_URL;
    return [
      {
        source: "/api-internal/:path*",
        destination: `${apiUrl}/:path*`,
      },
      {
        source: "/socket/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const apiUrl = process.env.API_URL;
if (!apiUrl) {
  throw new Error(
    "API_URL nao definida. Copie .env.example para .env e preencha API_URL (ex: http://localhost:8000).",
  );
}

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/api-internal/:path*", destination: `${apiUrl}/:path*` },
      { source: "/socket/:path*", destination: `${apiUrl}/:path*` },
    ];
  },
};

export default nextConfig;

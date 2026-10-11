import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal server bundle for the production Docker image.
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;

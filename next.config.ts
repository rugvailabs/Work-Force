import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle a self-contained server into .next/standalone for the Docker image.
  output: "standalone",
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

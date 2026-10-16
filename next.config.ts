import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Prisma-klienten skal lastes direkte fra node_modules (ikke bakes inn i bundlen),
  // slik at `prisma generate`/`db:push` gjenspeiles uten å måtte tømme cache.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;

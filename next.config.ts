import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/posts/:id',
        destination: '/insight/:id',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

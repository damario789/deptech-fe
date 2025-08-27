import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', // Proxy ke backend API
      },
    ];
  },
  server: {
    port: 3001,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://skillswap-server-wgm3.onrender.com/api/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
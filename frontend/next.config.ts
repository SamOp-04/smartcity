import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['www.svgrepo.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

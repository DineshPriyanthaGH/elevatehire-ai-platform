/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PRODUCTION_MODE: process.env.PRODUCTION_MODE || 'false',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000/api',
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  typescript: {
    // Temporarily ignore build errors during development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig

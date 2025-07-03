/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // ...existing domains...
      'images.unsplash.com',
      'images.pexels.com',
    ],
  },
}

module.exports = nextConfig
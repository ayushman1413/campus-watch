/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
     remotePatterns: [
      {
        protocol: "https",
        hostname: "jgiiyeapmnekatxyhsyq.supabase.co",
      },
    ],
  },
}

module.exports = nextConfig

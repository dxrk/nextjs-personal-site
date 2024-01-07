/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: "/",
      destination: "/Home/index.htm",
    },
  ],
  experimental: {
    serverMinification: false,
  },
};

module.exports = nextConfig;

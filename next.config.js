/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: "/",
      destination: "/Home/index.htm",
    },
  ],
};

module.exports = nextConfig;

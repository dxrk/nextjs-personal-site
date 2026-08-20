/** @type {import('next').NextConfig} */
const nextConfig = {
  // rewrites: async () => [
  //   {
  //     source: "/",
  //     destination: "/Home/index.htm",
  //   },
  // ],
  // experimental: {
  //   serverMinification: false,
  // },
  images: {
    remotePatterns: [
      {
        hostname: "*.freetls.fastly.net",
      },
    ],
    unoptimized: false,
  },
};

module.exports = nextConfig;

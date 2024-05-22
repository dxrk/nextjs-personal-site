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
        hostname: "lastfm.freetls.fastly.net",
      },
    ],
  },
};

module.exports = nextConfig;

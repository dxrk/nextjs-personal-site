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
  env: {
    LASTFM_API_KEY: process.env.LASTFM_API_KEY,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  },
};

module.exports = nextConfig;

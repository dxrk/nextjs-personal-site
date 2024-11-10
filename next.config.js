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
    PROJECT_ID: process.env.PROJECT_ID,
    PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    CLIENT_EMAIL: process.env.CLIENT_EMAIL,
    STRAVA_ACCESS_TOKEN: process.env.STRAVA_ACCESS_TOKEN,
  },
};

module.exports = nextConfig;

const { withAxiom } = require("next-axiom");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  outputFileTracing: false,
  redirects() {
    return [
      {
        source: "/null",
        destination: "/",
        permanent: true,
      },
      {
        source: "/repl",
        destination: "/",
        permanent: true,
      },
      {
        source: "/new",
        destination:
          "/?modules=true&cp_code=JYWwDg9gTgLgBAbzgFQKYA8YBo4AUCGA5qjgGrCoDuOAIhAMYCuIqAdtnAGITtwC-cAGZQIIOACIAAlFT56MALRgAJoID0M1stQyo4gNwAoQ93YA6GYWABnGDoAUCQ3CH4QwADYBPAFwSA8mBscADK-KzW4ljOcNZQ9H7iABYwMGDWPmpqgjww1maEtvgwwPRm9KJq1moQQRHh1QBuAIwA7GosIAAcAJr4AOLWzQBMAGwAssAAWmAAQgCCCgCqnKRTAAyoZqmCUYZ8AJRGhhiQsHDagviMHvD2B3AAvAB8cPYxADx0TCy8tl4eVCPBBIHLsThuTy-AJ1UINcT8PjPGIuD4EYixYAALyB4nmo3EyJcxLgH3IVBRJNiMABQJBlKpcCSqGAhBSiWa63WAFI9oySWB8MplMBWIQ_MN1tF-YiGXAifyPmhMM8AHJUPA0TgfNTKmAKkk68mUA2ktTo1AKnXfZhsfWGI6GIA",
        permanent: false,
      },
    ];
  },
  webpack: (config) => {
    // load worker files as a urls by using Asset Modules
    // https://webpack.js.org/guides/asset-modules/
    config.module.rules.unshift({
      test: /pdf\.worker\.(min\.)?js/,
      type: "asset/resource",
      generator: {
        filename: "static/worker/[hash][ext][query]",
      },
    });

    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.unshift({
          test: /app\/sandpack\/example/,
          resourceQuery: /raw/,
          type: "asset/source",
        });
      }
    });

    config.resolve.alias["encoding"] = false;
    config.resolve.alias["iconv-lite"] = false;
    config.resolve.alias["whatwg-fetch"] = false;
    config.resolve.alias["canvas"] = false;

    return config;
  },
};

module.exports = withAxiom(nextConfig);

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
          "/?modules=1&cp_code=JYWwDg9gTgLgBAbzgFQKYA8YBo4AUCGA5qjgGrCoDuOAIhAMYCuIqAdvAL5wBmUEIcAEQABKKnz0YAWjAATbgHoxrWajFRBAbgBQ2jJFhxV3fIwA28ABQBKOAF4AfHEva4cADx0mLdg9duPAmI4AGdgAC9UO0EAQQA2QT8AgPdyKn9ktxCYAE8zKIQEDMy3AAtUYEJSmAAuIQBGAAZGgFJBLGKSgCtGbOBuHIBhCHY2WqF6MbV2zsz8M0rWAEkYVBAQusFJ0Y0OkrcODlmk_fc0TAdWKiMGZjH3BXOYE-SHtMoXjwUg1BOHrzuvm01h0QA",
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

    config.resolve.alias["iconv-lite"] = false;
    config.resolve.alias["whatwg-fetch"] = false;
    config.resolve.alias["canvas"] = false;

    return config;
  },
};

module.exports = withAxiom(nextConfig);

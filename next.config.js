const { withAxiom } = require("next-axiom");

module.exports = withAxiom({
  reactStrictMode: true,
  outputFileTracing: false,
  async redirects() {
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

    config.resolve.alias["iconv-lite"] = false;

    return config;
  },
});

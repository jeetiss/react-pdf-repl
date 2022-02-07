const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  outputFileTracing: false,
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

    const rule = config.module.rules
      .find((rule) => rule.oneOf)
      .oneOf.find(
        (r) =>
          r.test &&
          r.test.test &&
          r.test.test("global.css") &&
          r.issuer &&
          r.issuer.not
      );

    if (rule) {
      // Allow `monaco-editor` to import global CSS:
      delete rule.issuer.not;
    }

    config.module.rules.push({
      test: /\.d.ts$/i,
      use: "raw-loader",
    });

    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ["typescript", "javascript"],
        filename: "static/[name].worker.js",
      })
    );

    return config;
  },
});

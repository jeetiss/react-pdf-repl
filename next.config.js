const { withAxiom } = require("next-axiom");

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
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
          "/?modules=true&gz_code=eJxlkcFqwkAQhu95iiFQUIjZ6MEWG0Mtkp7aCm2FeluSSVxwk7A7Vm3Iu3fWGnvonmY_Zuaff0bppjYELbzjkQJYyRIDWCs8BLCss73GimlaVwQdFKbW4D8YlBmNmrwQBqscDRr_3vNcTmiwVJbQDFoPoJBa7U4z8F8brOBNVtYPGFuTMdsSNXYmRMFlNiwtSVJZmNVaWFFzvuV08TW-FRr13ad8suPJ9FltmsfF6CNdbyIMiQru1w1ZG49nEzkWcr8jGAxhnsCAteLeA1g67XDetuAE0_-TQdclXMAlbgVg1TfO_cXU_4WM3U4uMVy7XQHAFlW5Je45jqKbs9H-NTLPVVXOYBL94a67hMkVxe4EyQseYLVMY3H-9erCyV8GFG5CF8eit5d4vIYfveSD-g",
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

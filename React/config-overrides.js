const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
module.exports = {
  webpack: function (config, env) {
    config.output.filename = "static/js/[name].[hash:8].js";
    config.output.chunkFilename = "static/js/[name].[hash:8].chunk.js";
    config.plugins = [
      ...config.plugins,
      process.env.REACT_APP_ANALYZE === "true" &&
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: "bundle-report.html",
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: "bundle-stats.json",
          excludeAssets: [/node_modules/],
        }),
    ];
    if (process.env.REACT_APP_BUILD)
      config.optimization = {
        ...(config.optimization || {}),
        minimize: true,
        minimizer: [
          new CssMinimizerPlugin(),
          new TerserPlugin({
            extractComments: false,
            terserOptions: {
              format: {
                comments: false,
              },
            },
          }),
        ],
      };
    return config;
  },
};

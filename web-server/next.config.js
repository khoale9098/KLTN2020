const {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_BUILD,
} = require('next/constants');
const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: false,
});

module.exports = (phase) => {
    const distDir = '../dist/web/.next';
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;
    const isProd = phase === PHASE_PRODUCTION_BUILD;
    console.log(`🚀 Mode: ${isDev ? `Development` : 'Production'}`);
    const env = {
        API_URI: (() => {
            if (isDev) {
                return 'http://localhost:3000';
            }

            if (isProd) {
                return 'http://pk2020.tk:3000';
            }
            return 'API_URL is invalid!';
        })(),
    };

    const webpack = function (config, { dev }) {
        config.module.rules.push({
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 100000,
                    name: '[name].[ext]',
                },
            },
        });
        config.resolve.alias['~'] = path.resolve(__dirname + '/src');
        return config;
    };

    return withBundleAnalyzer({
        distDir,
        env,
        webpack,
    });
};

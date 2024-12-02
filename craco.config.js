const { when } = require('@craco/craco');
const path = require(`path`);
const BabelRcPlugin = require('@jackwilsdon/craco-use-babelrc');
const fs = require('fs');

// Create alias for all file, folder inside src (level 1)
const SRC = `./src`;
const files = fs.readdirSync(path.join(__dirname, SRC));
const resolvedAliases = files.reduce(
    (rs, cur) => ({
        ...rs,
        [`@${cur}`]: path.resolve(__dirname, `${SRC}/${cur}`),
    }),
    {},
);

module.exports = {
    style: {
        css: {
            loaderOptions: {
                modules: {
                    auto: true,
                    exportLocalsConvention: 'camelCase',
                },
            },
        },
        modules: {
            ...when(
                process.env.REACT_APP_ENV !== 'dev',
                () => ({ localIdentName: '[hash:base64:5]' }),
                () => ({}),
            ),
        },
    },
    plugins: [
        {
            plugin: BabelRcPlugin,
        },
    ],
    webpack: {
        alias: resolvedAliases,
    },
};

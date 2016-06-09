const rollup = require('rollup');
const babel = require('rollup-plugin-babel');

rollup.rollup({
    entry: './index.js',
    external: [
        'backbone',
        'underscore',
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
    ],
}).then((bundle) => {
    bundle.write({
        format: 'umd',
        globals: {
            backbone: 'Backbone',
            underscore: '_',
        },
        moduleId: 'backbone-relation',
        moduleName: 'backboneRelation',
        dest: 'dist/backbone-relation.js',
    });
}).catch((err) => {
    console.log(String(err));
    process.exit(1);
});

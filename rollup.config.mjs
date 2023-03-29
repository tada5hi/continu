/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */


import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert {type: 'json'};

import { transform } from "@swc/core";

const extensions = [
    '.js', '.jsx', '.ts', '.tsx',
];

export default [
    {
        input: './src/index.ts',

        // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
        // https://rollupjs.org/guide/en/#external
        external: [],

        plugins: [
            // Allows node_modules resolution
            resolve({ extensions: ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts']}),

            // Compile TypeScript/JavaScript files
            {
                name: 'swc',
                transform(code) {
                    return transform(code, {
                        jsc: {
                            target: 'es2020',
                            parser: {
                                syntax: 'typescript'
                            },
                            loose: true
                        },
                        sourceMaps: true
                    });
                }
            },

            terser({
                output: {
                    ecma: 5,
                },
            }),
        ],
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true
            }, {
                file: pkg.module,
                format: 'esm',
                sourcemap: true
            }
        ]
    }
];

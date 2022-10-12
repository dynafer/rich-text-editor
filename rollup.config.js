import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import scss from 'rollup-plugin-scss';
import { run } from './rollup.hook';
import fs from 'fs';
import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const outputPath = path.resolve(__dirname, process.env.OUTPUT_PATH);
const isDevelopment = process.env.MODE === 'development';
const useScss = process.env.USE_SCSS === 'true';
const srcPath = path.resolve(__dirname, './src');
const scssPlugin = [];
if (useScss) {
    scssPlugin.push( scss({
        output: path.resolve(outputPath, `./${process.env.OUTPUT_FILE_NAME}.min.css`),
        sourceMap: isDevelopment,
        outputStyle: 'compressed',
        failOnError: true,
        watch: srcPath
    }) );
}

const plugins = [];

if (!isDevelopment) {
    const mapFile = type => path.resolve(outputPath, `./${process.env.OUTPUT_FILE_NAME}.${type}.map`);
    if (fs.existsSync(mapFile('js'))) fs.unlinkSync(mapFile('js'));
    if (fs.existsSync(mapFile('min.js'))) fs.unlinkSync(mapFile('min.js'));
    if (fs.existsSync(mapFile('min.css'))) fs.unlinkSync(mapFile('min.css'));
} else {
    plugins.push(run('npm run lint'))
}

export default {
    input: path.resolve(srcPath, `./${useScss ? 'ts/' : ''}${process.env.MAIN_FILE}.ts`),
    output: [
        {
            file: path.resolve(outputPath, `./${process.env.OUTPUT_FILE_NAME}.js`),
            format: 'iife',
            name: 'finer',
            sourcemap: isDevelopment
        },
        {
            file: path.resolve(outputPath, `./${process.env.OUTPUT_FILE_NAME}.min.js`),
            format: 'iife',
            name: 'finer',
            plugins: [terser()],
            sourcemap: isDevelopment
        },
    ],
    plugins: [
        ...plugins,
        typescript({
            tsconfig: path.resolve(__dirname, './tsconfig.json'),
            compilerOptions: {
                sourceMap: isDevelopment
            }
        }),
        ...scssPlugin
    ],
}
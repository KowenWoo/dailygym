import { build } from 'esbuild';
import fs from 'fs';
const r = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false, platform: 'browser', legalComments: 'none' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = fs.readFileSync('tools/template.html', 'utf8').replace('/*APP*/', () => js);
fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/index.html', html);
console.log('dist/index.html', (html.length / 1e6).toFixed(2), 'MB');

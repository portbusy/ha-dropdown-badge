import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/dropdown-badge.js'],
  bundle: true,
  outfile: 'dist/dropdown-badge.js',
  format: 'esm',
  target: 'es2020',
  minify: true,
  sourcemap: false,
});

console.log('Built dist/dropdown-badge.js');

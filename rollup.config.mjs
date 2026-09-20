import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import importMetaAssets from './plugins/rollup-plugin-import-meta-assets.js';

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.esm.js', format: 'es', sourcemap: false },
      { file: 'dist/index.cjs.js', format: 'cjs', exports: 'named', sourcemap: false },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'StellaSoraCursor',
        exports: 'named',
        sourcemap: false,
      },
    ],
    plugins: [
      importMetaAssets(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: false,
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.esm.min.js',
        format: 'es',
        sourcemap: false,
      },
      {
        file: 'dist/index.cjs.min.js',
        format: 'cjs',
        exports: 'named',
        sourcemap: false,
      },
      {
        file: 'dist/index.umd.min.js',
        format: 'umd',
        name: 'StellaSoraCursor',
        exports: 'named',
        sourcemap: false,
      },
    ],
    plugins: [
      importMetaAssets(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: false,
      }),
      terser({ compress: true, mangle: true, format: { comments: false } }),
    ],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
  },
];

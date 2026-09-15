import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.esm.js', format: 'es', sourcemap: false },
      { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: false },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'StellaSoraCursor',
        sourcemap: false,
      },
    ],
    plugins: [
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
      { file: 'dist/index.esm.min.js', format: 'es', sourcemap: false },
      { file: 'dist/index.cjs.min.js', format: 'cjs', sourcemap: false },
      {
        file: 'dist/index.umd.min.js',
        format: 'umd',
        name: 'StellaSoraCursor',
        sourcemap: false,
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: false,
      }),
      terser({
        compress: true,
        mangle: true,
        format: { comments: false },
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
  },
];
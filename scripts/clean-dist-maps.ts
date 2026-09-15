import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 删除旧构建遗留的 source map */
async function cleanDistMaps() {
  const projectRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
  await Promise.all([
    rm(join(projectRoot, 'dist', 'index.esm.js.map'), { force: true }),
    rm(join(projectRoot, 'dist', 'index.cjs.js.map'), { force: true }),
    rm(join(projectRoot, 'dist', 'index.umd.js.map'), { force: true }),
    rm(join(projectRoot, 'dist', 'index.esm.min.js.map'), { force: true }),
    rm(join(projectRoot, 'dist', 'index.cjs.min.js.map'), { force: true }),
    rm(join(projectRoot, 'dist', 'index.umd.min.js.map'), { force: true }),
  ]);
}

cleanDistMaps().catch((error: unknown) => {
  console.error('Failed to clean dist source maps:', error);
  process.exitCode = 1;
});

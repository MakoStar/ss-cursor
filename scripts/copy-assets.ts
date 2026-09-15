import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 复制源码图片到构建产物 */
async function copyAssets() {
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = join(projectRoot, 'assets');
  const destination = join(projectRoot, 'dist', 'assets');

  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });
  console.log('Copied assets to dist/assets');
}

copyAssets().catch((error: unknown) => {
  console.error('Failed to copy assets:', error);
  process.exitCode = 1;
});

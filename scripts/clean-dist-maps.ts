import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

const SRC = 'assets';
const DST = 'dist/assets';

if (!existsSync(SRC)) {
  console.warn(`[copy-assets] 找不到源目录 ${SRC}/，跳过`);
  process.exit(0);
}

if (existsSync(DST)) rmSync(DST, { recursive: true, force: true });
mkdirSync(DST, { recursive: true });
cpSync(SRC, DST, { recursive: true });

console.log(`[copy-assets] ${SRC}/ → ${DST}/`);
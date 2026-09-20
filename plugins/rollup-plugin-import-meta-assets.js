import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/**
  * 处理源码里的 new URL('./xxx.png', import.meta.url)
  *
  * 把引用的资源 emit 到 dist，替换为 Rollup 认识的占位符
  */
export default function importMetaAssets() {
  return {
    name: 'import-meta-assets',

    transform(code, id) {
      /** 只处理源码文件 */
      if (!/\.[cm]?[jt]sx?$/.test(id)) return null;

      /** 匹配 new URL('...', import.meta.url) */
      const pattern = /new\s+URL\s*\(\s*(['"])([^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g;
      const matches = [...code.matchAll(pattern)];
      if (matches.length === 0) return null;

      let out = code;
      for (const m of matches) {
        const raw = m[0];
        const relPath = m[2];

        /** 跳过绝对 URL 和 data URI */
        if (/^(https?:|data:|file:|\/\/)/.test(relPath)) continue;

        /** 解析相对当前源文件的绝对路径 */
        const absPath = resolve(dirname(id), relPath);
        if (!existsSync(absPath)) {
          this.warn(`[import-meta-assets] source no found: ${absPath}`);
          continue;
        }

        /** 读文件、作为 asset emit 到 dist */
        const buf = readFileSync(absPath);
        /** 从路径里找到 'assets/' 之后的部分作为 name，避免重复前缀 */
        const parts = relPath.split('/');
        const idx = relPath.lastIndexOf('assets/');
        const name = idx >= 0
          ? relPath.slice(idx + 'assets/'.length)
          : parts[parts.length - 1];

        const refId = this.emitFile({
          type: 'asset',
          name,
          source: buf,
        });

        /** Rollup 会把这个占位符替换为相对当前 chunk 的正确 URL */
        const replacement = `new URL(import.meta.ROLLUP_FILE_URL_${refId}, import.meta.url)`;
        out = out.replace(raw, replacement);
      }

      return { code: out, map: null };
    },
  };
}

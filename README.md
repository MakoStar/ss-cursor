# @makostar/ss-cursor

一个星塔旅人（Stella Sora）主题的光标与点击特效库，基于 Canvas 实现。提供点击特效、拖动拖尾、主题光标，内置 4 套主题。

## 安装

```bash
npm add @makostar/ss-cursor
```

## 快速开始

```ts
import { initStellaSoraCursor } from '@makostar/ss-cursor';

const cursor = await initStellaSoraCursor({ theme: 'summer' });

// 用完销毁
cursor.destroy();
```

初始化后库会在页面创建全屏 canvas，自动监听 `pointerdown` / `pointermove` / `pointerup`。不传 `theme` 时按日期自动选择：目前只有12/25 ~ 次年 1/7 用 `christmas`，其它日期用 `default`。

## 主题

内置 4 套：`default` / `christmas` / `newyear` / `summer`

```ts
await initStellaSoraCursor({ theme: 'summer' });   // 指定
await initStellaSoraCursor();                      // auto，按日期选择
await initStellaSoraCursor({ theme: 'random' });   // 随机
```

传入不存在的主题名会回退到 `default`。

## 配置

```ts
await initStellaSoraCursor({
  theme: 'default',
  customThemes: [],
  holdDelay: 100,
  holdInterval: 100,
  zIndex: 2147483647,
  replaceCursor: true,
  disableTrail: false,
  silent: false,
});
```

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | ---: | --- |
| `theme` | `string` | `'auto'` | 主题名，或 `auto` / `random` |
| `customThemes` | `ThemeAssets[]` | `[]` | 运行时注册的自定义主题 |
| `holdDelay` | `number` | `100` | 拖尾激活延迟（毫秒） |
| `holdInterval` | `number` | `100` | 拖尾粒子发射间隔（毫秒） |
| `zIndex` | `number` | `2147483647` | canvas 层级 |
| `replaceCursor` | `boolean` | `true` | 是否替换页面光标 |
| `disableTrail` | `boolean` | `false` | 禁用拖动拖尾，只保留点击特效 |
| `silent` | `boolean` | `false` | 静默控制台日志 |

切换主题时先销毁旧实例：

```ts
let cursor = await initStellaSoraCursor({ theme: 'default' });
cursor.destroy();
cursor = await initStellaSoraCursor({ theme: 'summer' });
```

## 同步入口

需要立即拿销毁句柄时用：

```ts
import { initStellaSoraCursorSync } from '@makostar/ss-cursor';

const cursor = initStellaSoraCursorSync({ theme: 'default' });
cursor.destroy();
```

## 自定义主题

```ts
const oceanTheme = {
  name: 'ocean',
  spriteFiles: {
    ringOuter: '/themes/ocean/ring.png',
    burst: 'https://cdn.example.com/ocean/shard.png',
  },
  createEmitters(S) {
    // S.ringOuter / S.burst 是已加载的 HTMLImageElement
    return [];
  },
  createTrail(S) {
    // 返回 SlideTrail 实例
  },
  cursorImage: '/themes/ocean/cursor.png',
  cursorPointerImage: '/themes/ocean/cursor-pointer.png',
};

await initStellaSoraCursor({
  theme: 'ocean',
  customThemes: [oceanTheme],
});
```

`ThemeAssets` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| `name` | `string` | 是 | 主题名 |
| `spriteFiles` | `Record<string, string>` | 是 | 贴图键 -> URL |
| `createEmitters` | `(S) => Emitter[]` | 是 | 点击特效工厂 |
| `createTrail` | `(S) => SlideTrail` | 是 | 拖动拖尾工厂 |
| `cursorImage` | `string` | 否 | 普通区域光标 |
| `cursorPointerImage` | `string` | 否 | 可交互元素光标 |
| `matchDate` | `() => boolean` | 否 | 供 `auto` 使用 |
| `label` | `string` | 否 | 显示名，缺省用 `name` |

自定义优先于内置，同名主题用先找到的。

## 引入方式

**ESM**

```ts
import { initStellaSoraCursor } from '@makostar/ss-cursor';
```

**CommonJS**

```js
const { initStellaSoraCursor } = require('@makostar/ss-cursor');
```

**UMD（全局 `StellaSoraCursor`）**

```html
<script src="https://unpkg.com/@makostar/ss-cursor/dist/index.umd.min.js"></script>
<script>
  StellaSoraCursor.initStellaSoraCursor({ theme: 'random' });
</script>
```

## 底层 API

```ts
import { Emitter, SlideTrail, TouchEffect } from '@makostar/ss-cursor';
import { sampleCurve, sampleGradient, getTinted } from '@makostar/ss-cursor';
```

| 函数 | 说明 |
| --- | --- |
| `sampleCurve(pts, t)` | 分段折线采样 |
| `sampleGradient(stops, t)` | 颜色渐变采样 |
| `getTinted(sprite, color)` | 乘法染色（带缓存） |

## 本地开发

```bash
npm build     # 构建
npm serve     # 启动服务，打开 http://localhost:3000/demo/
npm dev       # 监听模式
npm start     # build + serve
```

## 发布

```bash
npm build
npm publish --dry-run   # 检查发布内容
npm publish
```

产物：

```
dist/
├── index.esm.js         # ESM 未压缩
├── index.esm.min.js
├── index.cjs.js         # CJS 未压缩
├── index.cjs.min.js
├── index.umd.js         # UMD 未压缩
├── index.umd.min.js
├── index.d.ts
└── assets/              # 贴图资源
```

## 常见问题

**点击没效果** -> F12 看控制台报错；确认 `dist/assets/` 里图片齐全。

**多个实例** -> 会叠加 canvas 和事件。切主题先 `cursor.destroy()`。

**主题名拼错** -> 控制台会打 `unknown theme "xxx", fallback to default`，按提示改。

## License

MIT

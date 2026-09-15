# ss-cursor

废弃旧文档

一个基于 Canvas 的网页鼠标特效库，提供鼠标点击、长按、移动粒子、主题光标和笔画拖尾效果。

项目的图片资源以独立文件形式发布，不会转换为 Base64。安装 npm 包后，主题图片位于包内的 `dist/assets` 目录，并由构建后的 JavaScript 文件自动加载。

## 目录

- [特性](#特性)
- [安装](#安装)
- [快速开始](#快速开始)
- [主题选择](#主题选择)
- [初始化配置](#初始化配置)
- [生命周期](#生命周期)
- [内置主题](#内置主题)
- [自定义主题](#自定义主题)
- [资源目录和发布结构](#资源目录和发布结构)
- [Demo 和本地开发](#demo-和本地开发)
- [构建和发布](#构建和发布)
- [常见问题](#常见问题)

## 特性

- 点击鼠标显示主题点击特效。
- 长按鼠标持续生成粒子。
- 按住鼠标移动时显示主题拖尾和碎片。
- 停止移动后拖尾自动淡出，松开鼠标后清除拖尾。
- 支持普通页面光标和链接、按钮等可交互元素的指针光标。
- 内置 `default`、`christmas`、`new-year` 和 `summer` 主题。
- 支持按日期自动选择主题。
- 支持从内置主题和自定义主题中随机选择主题。
- 支持运行时传入自定义主题和图片 URL。
- 支持 ESM、CommonJS 和 TypeScript 类型声明。
- 图片作为独立资源随 npm 包发布，不使用 Base64 内嵌。
- 支持销毁实例，移除 Canvas、事件监听器、动画和光标样式。

## 安装

```bash
npm install ss-cursor
```

## 快速开始

```ts
import { initStellaSoraCursor } from 'ss-cursor';

const cursor = await initStellaSoraCursor();

// 页面卸载或不再需要效果时调用
cursor.destroy();
```

初始化后，库会在浏览器页面中创建一个 Canvas 并监听鼠标事件。未传入 `theme` 时默认按日期选择主题：

- 每年 12 月 25 日至次年 1 月 7 日：`christmas`
- 其他日期：`default`

该库依赖浏览器的 Canvas、Image 和鼠标事件 API，应在浏览器环境中使用。

## 主题选择

### 指定主题

```ts
const cursor = await initStellaSoraCursor({
  theme: 'new-year',
});
```

可用的内置主题：

```text
default
christmas
new-year
summer
```

如果传入不存在的主题名称，库会回退到 `default`。

### 自动主题

以下两种写法都会按日期自动选择主题：

```ts
const cursor = await initStellaSoraCursor();
```

```ts
const cursor = await initStellaSoraCursor({
  theme: 'auto',
});
```

### 随机主题

```ts
const cursor = await initStellaSoraCursor({
  theme: 'random',
});
```

`random` 会从内置主题和 `customThemes` 中合并后的主题列表中随机选择一个主题。每次初始化都会重新随机选择；切换主题时可以先销毁旧实例，再创建新实例。

## 初始化配置

### 完整示例

```ts
import { initStellaSoraCursor } from 'ss-cursor';

const cursor = await initStellaSoraCursor({
  theme: 'default',
  randomCount: 5,
  holdDelay: 100,
  throttleDelay: 10,
  holdInterval: 100,
  followAnimDuration: 500,
  holdParticleLife: 100,
  zIndex: 2147483647,
});
```

### 配置项

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | ---: | --- |
| `theme` | `string` | 自动选择 | 主题名称，也可以是 `auto` 或 `random` |
| `customThemes` | `ThemeAssets[]` | `[]` | 运行时注册的自定义主题 |
| `randomCount` | `number` | `5` | 每次点击生成的飞散碎片数量 |
| `holdDelay` | `number` | `100` | 长按移动效果生效前的延迟，单位为毫秒 |
| `throttleDelay` | `number` | `10` | 鼠标移动事件的节流间隔，单位为毫秒 |
| `holdInterval` | `number` | `100` | 长按时生成粒子的间隔，单位为毫秒 |
| `followAnimDuration` | `number` | `500` | 跟随粒子的动画时长，单位为毫秒 |
| `holdParticleLife` | `number` | `100` | 长按粒子的生命周期，单位为毫秒 |
| `zIndex` | `number` | `2147483647` | Canvas 的层级 |

### 参数调节建议

- 想让移动拖尾更容易触发，可以适当降低 `holdDelay`。
- 想减少鼠标移动事件处理频率，可以增大 `throttleDelay`。
- 想让长按粒子更密集，可以降低 `holdInterval`。
- 想让跟随粒子停留更久，可以增大 `followAnimDuration` 或 `holdParticleLife`。
- 如果页面已有较高层级的弹窗或导航栏，可以手动调整 `zIndex`。

## 同步初始化

异步入口会等待主题图片加载完成后再返回实例。如果需要立即获得销毁句柄，可以使用同步入口：

```ts
import { initStellaSoraCursorSync } from 'ss-cursor';

const cursor = initStellaSoraCursorSync({
  theme: 'default',
});

// 即使资源仍在加载，也可以安全销毁
cursor.destroy();
```

`initStellaSoraCursorSync` 会在资源加载完成后异步创建效果。如果在加载完成前调用 `destroy()`，后续不会再创建 Renderer。

## 生命周期和主题切换

初始化函数返回的实例目前提供一个方法：

```ts
interface CursorInstance {
  destroy(): void;
}
```

切换主题时，建议先销毁旧实例：

```ts
let cursor = await initStellaSoraCursor({
  theme: 'default',
});

async function switchTheme(theme: string) {
  cursor.destroy();
  cursor = await initStellaSoraCursor({ theme });
}

await switchTheme('summer');
```

`destroy()` 会清理 Canvas、鼠标事件监听器、动画帧、定时器和库注入的光标样式。重复调用不会重新创建效果。

## 内置主题

### Default

```ts
const cursor = await initStellaSoraCursor({
  theme: 'default',
});
```

Default 主题包含：

- Canvas 绘制的点击光环和中心效果。
- 默认点击飞散碎片。
- 荧光白、粉、红、黄渐变拖尾。
- 默认主题 `ring.png` 和 `dot.png`。
- 普通光标和指针光标。

### Christmas

```ts
const cursor = await initStellaSoraCursor({
  theme: 'christmas',
});
```

Christmas 使用主题图片完成点击背景和碎片效果，并复用公共光标资源。未单独设置拖尾配置时，会使用库内置的默认回退拖尾配置。

### New Year

```ts
const cursor = await initStellaSoraCursor({
  theme: 'new-year',
});
```

New Year 点击时：

- `bg-1.png`、`bg-2.png`、`bg-3.png`、`bg-4.png` 从同一个点击中心依次扩散。
- `ring.png` 使用与 Default 主题相同的光环动画方式。
- `shard-1.png` 到 `shard-4.png` 用于移动拖尾碎片。
- 拖尾使用荧光黄色。
- 使用公共的 `assets/cursor.png` 和 `assets/cursor-pointer.png` 作为光标。

资源目录：

```text
assets/themes/new-year/
├─ bg-1.png
├─ bg-2.png
├─ bg-3.png
├─ bg-4.png
├─ ring.png
├─ shard-1.png
├─ shard-2.png
├─ shard-3.png
└─ shard-4.png
```

### Summer

```ts
const cursor = await initStellaSoraCursor({
  theme: 'summer',
});
```

Summer 点击时：

- `bg-1.png` 从点击中心向外扩散。
- `bg-2.png` 同时播放旋转和缩放效果。
- `bg-2.png` 比 `bg-1.png` 晚约一小段时间消失。
- `shard-1.png` 到 `shard-5.png` 用于移动拖尾碎片。
- 拖尾使用荧光淡蓝色。

资源目录：

```text
assets/themes/summer/
├─ bg-1.png
├─ bg-2.png
├─ shard-1.png
├─ shard-2.png
├─ shard-3.png
├─ shard-4.png
└─ shard-5.png
```

## 自定义主题

自定义主题通过 `customThemes` 传入。图片路径可以是：

- 站点根路径，例如 `/images/shard.png`
- 相对当前页面的路径，例如 `./images/shard.png`
- 完整 URL，例如 `https://example.com/images/shard.png`
- 构建工具生成的资源 URL

### 最小自定义主题

```ts
import { initStellaSoraCursor } from 'ss-cursor';

const customTheme = {
  name: 'ocean',
  shardImages: [
    '/themes/ocean/shard-1.png',
    '/themes/ocean/shard-2.png',
  ],
  animDuration: 700,
  bgType: 'canvas-draw',
};

const cursor = await initStellaSoraCursor({
  theme: 'ocean',
  customThemes: [customTheme],
});
```

### 图片主题

当 `bgType` 为 `images` 时，`bgImages` 会作为点击背景图片加载：

```ts
const imageTheme = {
  name: 'ocean',
  shardImages: [
    '/themes/ocean/shard-1.png',
    '/themes/ocean/shard-2.png',
    '/themes/ocean/shard-3.png',
  ],
  bgImages: [
    '/themes/ocean/bg-1.png',
    '/themes/ocean/bg-2.png',
  ],
  cursorImage: '/themes/ocean/cursor.png',
  cursorPointerImage: '/themes/ocean/cursor-pointer.png',
  animDuration: 800,
  bgType: 'images',
};

const cursor = await initStellaSoraCursor({
  theme: 'ocean',
  customThemes: [imageTheme],
});
```

### 自定义拖尾

拖尾配置写在主题的 `trail` 字段中。`colorStops` 的范围是 `0` 到 `1`，表示从轨迹尾部到鼠标当前位置的颜色位置：

```ts
const trail = {
  colors: ['#d9faff', '#35d9ff', '#1683ff'],
  colorStops: [0, 0.45, 0.9],
  maxPoints: 24,
  maxWidth: 18,
  glowBlur: 22,
  fadeDelay: 20,
  fadeDuration: 120,
};

const theme = {
  name: 'ocean',
  shardImages: ['/themes/ocean/shard.png'],
  animDuration: 700,
  bgType: 'canvas-draw',
  trail,
};
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `colors` | `string[]` | 拖尾颜色列表，支持 CSS 颜色值 |
| `colorStops` | `number[]` | 对应颜色的位置，通常与 `colors` 长度一致 |
| `maxPoints` | `number` | 保留的轨迹点数量，越大拖尾越长 |
| `maxWidth` | `number` | 拖尾最大宽度 |
| `glowBlur` | `number` | 发光模糊范围 |
| `fadeDelay` | `number` | 停止移动后开始淡出的延迟，单位为毫秒 |
| `fadeDuration` | `number` | 拖尾淡出时长，单位为毫秒 |

### 自定义粒子外观

可以通过 `particle` 调整主题碎片的尺寸和发光效果：

```ts
const theme = {
  name: 'ocean',
  shardImages: ['/themes/ocean/shard.png'],
  animDuration: 700,
  bgType: 'canvas-draw',
  particle: {
    size: 12,
    glowColor: '#8be9ff',
    glowBlur: 14,
  },
};
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `size` | `number` | 粒子绘制尺寸 |
| `glowColor` | `string` | 粒子发光颜色 |
| `glowBlur` | `number` | 粒子发光模糊范围 |

### 主题字段

`ThemeAssets` 支持以下字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| `name` | `string` | 是 | 主题名称，用于 `theme` 和随机选择 |
| `shardImages` | `string[]` | 是 | 点击飞散碎片和移动拖尾使用的图片 |
| `animDuration` | `number` | 是 | 点击动画时长，单位为毫秒 |
| `bgType` | `'canvas-draw' \| 'images'` | 是 | 使用 Canvas 绘制背景，或使用 `bgImages` |
| `bgImages` | `string[]` | 否 | `bgType` 为 `images` 时使用的背景图片 |
| `ringImage` | `string` | 否 | 默认点击光环图片 |
| `dotImage` | `string` | 否 | 默认点击中心光点图片 |
| `cursorImage` | `string` | 否 | 普通页面区域的光标图片 |
| `cursorPointerImage` | `string` | 否 | 链接、按钮、`select`、`label` 等可交互元素的光标图片 |
| `trail` | `TrailConfig` | 否 | 主题拖尾配置 |
| `particle` | `ParticleConfig` | 否 | 主题粒子配置 |
| `clickEffectFactory` | `ClickEffectFactory` | 否 | 完全接管主题点击绘制逻辑 |
| `matchDate` | `() => boolean` | 否 | 主题日期匹配函数，供主题注册逻辑使用 |

自定义主题名称应保持唯一。若多个主题名称相同，解析时会使用列表中先找到的主题。

## 资源目录和发布结构

源码资源目录示例：

```text
assets/
├─ cursor.png
├─ cursor-pointer.png
└─ themes/
   ├─ default/
   │  ├─ dot.png
   │  ├─ ring.png
   │  └─ shard-1.png ...
   ├─ christmas/
   │  ├─ bg-1.png
   │  ├─ bg-2.png
   │  └─ shard-1.png ...
   ├─ new-year/
   │  ├─ bg-1.png ... bg-4.png
   │  ├─ ring.png
   │  └─ shard-1.png ... shard-4.png
   └─ summer/
      ├─ bg-1.png
      ├─ bg-2.png
      └─ shard-1.png ... shard-5.png
```

构建后目录：

```text
dist/
├─ index.esm.js
├─ index.esm.min.js
├─ index.cjs.js
├─ index.cjs.min.js
├─ index.umd.js
├─ index.umd.min.js
├─ index.d.ts
└─ assets/
   ├─ cursor.png
   ├─ cursor-pointer.png
   └─ themes/
      ├─ default/
      ├─ christmas/
      ├─ new-year/
      └─ summer/
```

源码使用 `new URL('./assets/...', import.meta.url)` 获取资源地址。构建完成后，`scripts/copy-assets.ts` 会把根目录的 `assets` 复制到 `dist/assets`，因此不能只发布 JavaScript 文件而遗漏 `dist/assets`。

`package.json` 的发布白名单为：

```json
{
  "files": ["dist"]
}
```

## Demo 和本地开发

构建项目：

```bash
npm run build
```

启动静态服务器：

```bash
npm run serve
```

打开：

```text
http://localhost:3000/demo/
```

也可以直接执行构建并启动服务器：

```bash
npm start
```

Demo 当前支持切换：

- Default
- Christmas
- New Year
- Summer
- 随机主题
- 按日期自动选择主题

开发模式会先构建资源，然后启动 Rollup 监听：

```bash
npm run dev
```

## 构建和发布

### 构建

```bash
npm run build
```

该命令会依次执行：

1. 使用 Rollup 构建未压缩的 ESM、CommonJS 和 UMD JavaScript 文件。
2. 使用 Terser 生成对应的 `.min.js` 压缩混淆文件。
3. 生成 TypeScript 类型声明。
4. 将 `assets` 复制到 `dist/assets`。

JavaScript 同时提供可读版和压缩混淆版。压缩只作用于 `.min.js` 文件，不会修改公开 API、资源路径或 TypeScript 类型声明。生产构建默认不生成 JavaScript source map。

### JavaScript 产物

| 文件 | 模块格式 | 是否压缩 | 适用场景 |
| --- | --- | :---: | --- |
| `dist/index.esm.js` | ESM | 否 | 开发调试、现代构建工具 |
| `dist/index.esm.min.js` | ESM | 是 | 生产构建、体积优化 |
| `dist/index.cjs.js` | CommonJS | 否 | Node.js、CommonJS 调试 |
| `dist/index.cjs.min.js` | CommonJS | 是 | CommonJS 生产环境 |
| `dist/index.umd.js` | UMD | 否 | 浏览器 `<script>` 调试 |
| `dist/index.umd.min.js` | UMD | 是 | 浏览器 `<script>` 生产环境 |

### ESM

```ts
import { initStellaSoraCursor } from 'ss-cursor';
```

`package.json` 的 `module` 和 `exports.import` 默认指向未压缩的 `dist/index.esm.js`，方便构建工具进行 Tree Shaking 和调试。

如果需要显式使用压缩版本：

```ts
import { initStellaSoraCursor } from 'ss-cursor/dist/index.esm.min.js';
```

### CommonJS

```js
const { initStellaSoraCursor } = require('ss-cursor');
```

`package.json` 的 `main` 和 `exports.require` 默认指向未压缩的 `dist/index.cjs.js`。

如果需要显式使用压缩版本：

```js
const { initStellaSoraCursor } = require('ss-cursor/dist/index.cjs.min.js');
```

### UMD 和浏览器 script

UMD 文件会暴露名为 `StellaSoraCursor` 的全局对象：

```html
<script src="./node_modules/ss-cursor/dist/index.umd.min.js"></script>
<script>
  (async () => {
    const cursor = await StellaSoraCursor.initStellaSoraCursor({
      theme: 'random',
    });
  })();
</script>
```

UMD 入口导出与 ESM/CommonJS 相同，包括：

```js
StellaSoraCursor.initStellaSoraCursor
StellaSoraCursor.initStellaSoraCursorSync
```

如果需要调试未压缩版本，可以改用：

```html
<script src="./node_modules/ss-cursor/dist/index.umd.js"></script>
```

`package.json` 中的浏览器和 CDN 字段如下：

```json
{
  "browser": "dist/index.umd.js",
  "unpkg": "dist/index.umd.min.js",
  "jsdelivr": "dist/index.umd.min.js"
}
```

### 类型检查

```bash
npx tsc --noEmit
```

### 检查 npm 发布内容

```bash
npm pack --dry-run
```

检查结果中应包含：

```text
dist/index.esm.js
dist/index.esm.min.js
dist/index.cjs.js
dist/index.cjs.min.js
dist/index.umd.js
dist/index.umd.min.js
dist/index.d.ts
dist/assets/...
```

### 发布

```bash
npm publish
```

发布前会自动执行 `prepublishOnly`，重新构建 `dist` 并复制图片资源。

## 常见问题

### 为什么 `dist` 中没有 `assets`？

请使用：

```bash
npm run build
```

而不是只执行 Rollup。`assets` 由构建后的 `copy-assets` 步骤复制到 `dist/assets`。

### 为什么不使用 Base64？

本项目明确使用独立图片文件。这样可以保持资源可替换、便于缓存，也能确保 npm 包中的 `dist/assets` 与构建后的路径一致。

### 自定义图片加载失败怎么办？

请检查：

1. 图片 URL 是否可以直接在浏览器中访问。
2. URL 是否区分大小写。
3. 部署服务器是否正确发布了图片目录。
4. 跨域图片服务器是否允许浏览器加载。
5. `bgType: 'images'` 时是否传入了 `bgImages`。

图片加载失败时，对应图片不会绘制，但其他已加载资源仍可继续工作。

### 如何让效果消失？

保存初始化返回值并调用：

```ts
cursor.destroy();
```

切换主题前也应先调用旧实例的 `destroy()`，避免多个 Canvas 和事件监听器同时运行。

### 如何让随机主题包含自定义主题？

将自定义主题传入 `customThemes`，再使用 `random`：

```ts
const cursor = await initStellaSoraCursor({
  theme: 'random',
  customThemes: [customTheme],
});
```

随机选择范围会包含内置主题和该数组中的自定义主题。

## License

MIT

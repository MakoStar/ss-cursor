/** tag 样式：亮蓝底白字，左侧圆角 */
const TAG = 'background:#0ea5e9;color:#fff;padding:3px 8px;' +
  'border-radius:4px 0 0 4px;font-weight:600';

/** 内容样式：深灰底浅灰字，右侧圆角 */
const LABEL = 'background:#334155;color:#e2e8f0;padding:3px 8px;' +
  'border-radius:0 4px 4px 0';

/** 值样式：高亮 */
const VALUE = 'background:#334155;color:#7dd3fc;padding:3px 8px;' +
  'border-radius:0 4px 4px 0;font-weight:600';

/** 警告用橙色 tag */
const WARN_TAG = 'background:#f59e0b;color:#fff;padding:3px 8px;' +
  'border-radius:4px 0 0 4px;font-weight:600';
const WARN_LABEL = 'background:#334155;color:#fbbf24;padding:3px 8px;' +
  'border-radius:0 4px 4px 0';

/** 错误用红色 tag */
const ERROR_TAG = 'background:#ef4444;color:#fff;padding:3px 8px;' +
  'border-radius:4px 0 0 4px;font-weight:600';
const ERROR_LABEL = 'background:#334155;color:#fca5a5;padding:3px 8px;' +
  'border-radius:0 4px 4px 0';

/** 是否静默 */
let silent = false;

/** 设置静默模式 */
export function setSilent(v: boolean): void {
  silent = v;
}

/** 初始化日志 */
export function logInit(themeName: string): void {
  if (silent) return;
  console.info(
    `%c ss-cursor %c init ${themeName} `,
    TAG, VALUE,
  );
}

/** 销毁日志 */
export function logDestroy(): void {
  if (silent) return;
  console.info(
    `%c ss-cursor %c destroyed `,
    TAG, LABEL,
  );
}

/** 警告日志 */
export function logWarn(msg: string): void {
  if (silent) return;
  console.warn(
    `%c ss-cursor %c ${msg} `,
    WARN_TAG, WARN_LABEL,
  );
}

/** 错误日志 */
export function logError(msg: string, err?: unknown): void {
  if (silent) return;
  if (err !== undefined) {
    console.error(`%c ss-cursor %c ${msg} `, ERROR_TAG, ERROR_LABEL, err);
  } else {
    console.error(`%c ss-cursor %c ${msg} `, ERROR_TAG, ERROR_LABEL);
  }
}

/** 提示日志 */
export function logTips(msg: string): void {
  if (silent) return;
  console.info(
    `%c ss-cursor %c ${msg} `,
    TAG, VALUE,
  );
}

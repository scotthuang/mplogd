export interface MplogConfig {
  // 是否自动记录错误信息
  autoLogError?: boolean;
  // 是否自动记录promise错误
  autoLogRejection?: boolean;
  // 是否自动记录AJAX请求
  autoLogAjax?: boolean;
  // 过滤AJAX请求的函数, 默认不做过滤
  logAjaxFilter?: Function | null;
  // 最大允许错误数
  maxErrorNum?: number;
  // 数据库名称,如果不是写日志，还是新建一个数据库好，不然打开同一个版本数据库时，很可能导致另外的store不能增删改结构
  dbName?: string;
  // 数据库表名
  dbStoreName?: string;
  // 数据库版本。只能增加。如果没有修改数据库名称，但是想要新建，删除，更新store, 版本号要在这里改动
  // 如果修改了版本号，灰度了又回退，一定要再修改一次版本号，不然会open时会报错
  dbVersion?: number;
  // 缓存记录的大小
  bufferSize?: number;
  // 当前页面链接
  location?: string;
  // 是否自动只保留7天数据
  keep7Days?: boolean;

  onupgradeneeded?: Function | null;
  // 是否对内部的错误上报
  BadJsReport?: Function | null;
  // 单条log的最大长度
  maxLogSize?: number;
  // 实时上报函数
  reportFunction?: Function | null;
  autoLogFetch?: boolean;
}

export const DBStatus  = { //eslint-disable-line
  /**
   * 初始化中
   */
  INITING: 'initing',
  /**
   * 初始化完成
   */
  INITED: 'inited',
  /**
   * 失败
   */
  FAILED: 'failed',
};

export const ErrorLevel = {
  /**
   * 只用于上报的错误
   */
  unused: 0,
  /**
   * 一般级别错误
   */
  normal: 1,
  /**
   * 严重错误
   */
  serious: 2,
  /**
   * 致命错误
   */
  fatal: 3,
};

export const LevelEnum = {
  /**
   * 信息
   */
  info: 'info',
  /**
   * 警告
   */
  warn: 'warn',
  /**
   * 错误
   */
  error: 'error',
};

export const IgnoreCGIName = ['mplog', 'report', 'webcommreport'];

export const MAX_LOG_SIZE = 100000000; // 100MB

export const STORAGE_MAX_SIZE = 50000000; // 50MB

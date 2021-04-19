/**
 * @author dididong
 * @description 实际进行日志操作
 */
import { MplogConfig, DBStatus } from '../util/config';
import * as Util  from '../util/util';
import { MPIndexedDB } from '../database/indexedDB';
import { PoolHandler } from '../controller/pool_handler';

export class LogController {
  public bufferSize: number;

  private bufferLog: Array<any> = [];

  private mpIndexedDB: MPIndexedDB;

  private poolHandler: PoolHandler;

  private maxLogSize: number;

  private reportFunction: Function;

  constructor(config: MplogConfig) {
    // 缓存记录的大小
    this.bufferSize = config && typeof config.bufferSize !== 'undefined' ? config.bufferSize * 1 : 10;

    this.maxLogSize = config && config.maxLogSize ? config.maxLogSize : 3000;

    this.reportFunction = config && config.reportFunction;

    this.poolHandler = new PoolHandler();

    this.mpIndexedDB = new MPIndexedDB(config, this.poolHandler);
  }

  public log(location: string, level: string, description?: string, data?: any): void{
    const date = new Date();
    const value = {
      time: Util.formatTime(date), // 时间字符串
      location, // 页面链接
      level, // 日志等级
      description, // 描述
      data: this.dealLength(this.formatMsg(data)), // 日志
      timestamp: date.getTime(), // 时间戳，单位毫秒
    };
    this.bufferLog.push(value);
    if (this.bufferLog.length >= this.bufferSize) {
      this.flush(this.bufferLog);
      this.bufferLog = [];
    }
  }

  public flush(items = this.bufferLog): any {
    if (!items || items.length === 0) {
      return false;
    }

    if (this.reportFunction) {
      this.reportFunction(items);
    }

    if (this.mpIndexedDB.dbStatus !== DBStatus.INITED) {
      return this.poolHandler.push(() => this.flush(items));
    }
    this.mpIndexedDB.insertItems(items);
    return 0;
  }

  public get(from: Date, to: Date, dealFun?: Function, successCb?: Function): any {
    if (this.mpIndexedDB.dbStatus !== DBStatus.INITED) {
      return this.poolHandler.push(() => this.get(from, to, dealFun, successCb));
    }
    this.mpIndexedDB.get(from, to, dealFun, successCb);
  }

  public keep(saveDays: number): void {
    if (this.mpIndexedDB.dbStatus !== DBStatus.INITED) {
      return this.poolHandler.push(() => this.keep(saveDays));
    }
    this.mpIndexedDB.keep(saveDays);
  }

  public clean(): void {
    if (this.mpIndexedDB.dbStatus !== DBStatus.INITED) {
      return this.poolHandler.push(() => this.clean());
    }
    this.mpIndexedDB.clean();
  }

  private dealLength(logValue: String): String {
    if (typeof this.maxLogSize === 'number' && typeof logValue === 'string' && logValue.length >= this.maxLogSize) {
      logValue = logValue.substr(0, this.maxLogSize);
    }
    return logValue;
  }

  // 支持string\boolean\number\普通对象
  private formatMsg(obj: any): any {
    let msg = '';
    try {
      let isSupportType = (value) => {
        if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string' || Object.prototype.toString.call(value) === '[object Object]' || Object.prototype.toString.call(value) === '[object Array]') {
          return true;
        }
        return false;
      }
      let replacer = (key, value) => {
        if (!isSupportType(value)) {
          return undefined;
        }
        return value;
      }

      if (obj && isSupportType(obj)) {
        if (typeof obj === 'string') {
          return obj;
        } else if (Object.prototype.toString.call(obj) === '[object FormData]') {
          let jsonData = {};
          obj.forEach((value, key) => jsonData[key] = value);
          return JSON.stringify(jsonData);
        } else {
          msg = JSON.stringify(obj, replacer);
        }
      }
    } catch (e) {console.log(e)};
    return msg;
  }
}

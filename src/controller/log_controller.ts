import { MplogConfig, DB_Status} from '../util/config';
import * as Util  from '../util/util';
import { MPIndexedDB } from '../database/indexedDB';
import { PoolHandler } from '../controller/pool_handler';

export class LogController {
  public autoLogError: boolean;

  public autoLogRejection: boolean;

  public autoLogAjax: boolean;

  public logAjaxFilter: Function | null;

  public defaultAjaxFilter = null;

  public maxErrorNum: number;

  public bufferSize: number;

  private bufferLog: Array<any> = [];
   
  private mpIndexedDB: MPIndexedDB;

  private poolHandler: PoolHandler;

  constructor(config: MplogConfig) {
    // 是否自动记录错误信息
    this.autoLogError = config && typeof config.autoLogError !== 'undefined' ? config.autoLogError : false;
    // 是否自动记录promise错误
    this.autoLogRejection = config && typeof config.autoLogRejection !== 'undefined' ? config.autoLogRejection : false;
     // 是否自动记录AJAX请求
    this.autoLogAjax = config && typeof config.autoLogAjax !== 'undefined' ? config.autoLogAjax : false;

    this.logAjaxFilter = config && config.logAjaxFilter && config.logAjaxFilter ? config.logAjaxFilter : this.defaultAjaxFilter;
    // 最大允许错误数
    this.maxErrorNum = config && config.maxErrorNum ? config.maxErrorNum : 3;
    // 缓存记录的大小
    this.bufferSize = config && typeof config.bufferSize !== 'undefined' ? config.bufferSize * 1 : 3;
    
    this.poolHandler = new PoolHandler();

    this.mpIndexedDB = new MPIndexedDB(config, this.poolHandler);
  }

  public log(location: string, level: string, description?: string, data?: any) : void{
    const date = new Date();
    const value = {
      'time': Util.formatTime(date), // 时间字符串
      'location': location, // 页面链接
      'level': level, // 日志等级
      'description': description, // 描述
      'data': this.filterFunction(data), // 日志
      'timestamp': date.getTime() // 时间戳，单位毫秒
    };
    this.bufferLog.push(value);
    if (this.bufferLog.length >= this.bufferSize) {
      this.flush();
    }
  }

  private filterFunction(obj: any): object {
    const newObj:any = {};
    try {
      // 函数则转为字符串
      if (typeof obj === 'function') {
        return obj.toString();
      }

      if (typeof obj !== 'object') {
        return obj;
      }

      for (const i in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, i)) {
          if (typeof obj[i] !== 'function') {
            newObj[i] = this.filterFunction(obj[i]);
          }
        }
      }
      return newObj;
    } catch (e) {
      return {
        error: 'filterFunction error'
      };
    }
  }

  public flush(): any {
    if (this.bufferLog.length === 0) {
      return false;
    }
    
    if (this.mpIndexedDB.dbStatus !== DB_Status.INITED) {
      return this.poolHandler.push(() => {
        return this.flush();
      });
    }
    this.mpIndexedDB.insertItems(this.bufferLog);
    this.bufferLog = [];
    return 0;
  }

  public get(from: Date, to: Date, dealFun: Function): any{
    if (this.mpIndexedDB.dbStatus !== DB_Status.INITED) {
      return this.poolHandler.push(() => {
        return this.get(from, to, dealFun);
      });
    }
    this.mpIndexedDB.get(from, to, dealFun);
  }

  public keep(saveDays: number): void {
    if (this.mpIndexedDB.dbStatus !== DB_Status.INITED) {
      return this.poolHandler.push(() => {
        return this.keep(saveDays);
      });
    }
    this.mpIndexedDB.keep(saveDays);
  }
}
/**
 * 获得当前indexeddb使用容量
 */
import { MAX_LOG_SIZE } from '../util/config';

export async function getIfCurrentUsageExceed(maxLogSize = MAX_LOG_SIZE) {
  try {
    if (window.navigator && window.navigator.storage && (window.navigator as any).storage.estimate) {
      return window.navigator.storage.estimate().then(({ quota, usage }) => usage >= quota || usage >= maxLogSize);
    } else if (window.navigator && (window.navigator as any).webkitTemporaryStorage
      && (window.navigator as any).webkitTemporaryStorage.queryUsageAndQuota) {
      return new Promise((resolve) => {
        (window.navigator as any).webkitTemporaryStorage
        .queryUsageAndQuota((usedBytes, grantedBytes) => {
         resolve(usedBytes > grantedBytes ||  usedBytes >= maxLogSize)
        });
      })
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function getCurrentUsage() {
  try {
    if (window.navigator && window.navigator.storage && (window.navigator as any).storage.estimate) {
      return window.navigator.storage.estimate().then(({ usage }) => usage);
    } else if (window.navigator && (window.navigator as any).webkitTemporaryStorage
      && (window.navigator as any).webkitTemporaryStorage.queryUsageAndQuota) {
      return new Promise((resolve) => {
        (window.navigator as any).webkitTemporaryStorage
        .queryUsageAndQuota((usedBytes) => {
         resolve(usedBytes)
        });
      })
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

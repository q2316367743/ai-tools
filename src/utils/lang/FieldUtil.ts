import {listify} from "radash";

export function isNull(value?: any): boolean {
  return typeof value === "undefined" || value === null;
}

export function isNotNull(value?: any): boolean {
  return !isNull(value);
}

export function copyProperties<S extends Record<string, any>, T extends Record<string, any>>(source: S, target: T, focus = false) {
  listify(source, (k, v) => {
    if (focus) {
      // @ts-ignore
      target[k] = v;
    } else if (isNotNull(v) && v) {
      // @ts-ignore
      target[k] = v;
    }
  });
}

export function getEffectiveNumber(num: number, min: number, max: number): number {
  if (num < min) {
    return min;
  }
  if (num >= max) {
    return max - 1;
  }
  return num;
}


export function isEmptyArray(arr?: Array<any>): boolean {
  if (!arr) {
    return true;
  }
  if (!Array.isArray(arr)) {
    return true;
  }
  return arr.length === 0;
}

export function isNotEmptyArray(arr?: Array<any>): boolean {
  return !isEmptyArray(arr);
}

export function isEmptyString(str: any): boolean {
  if (typeof str === 'undefined') {
    return true
  } else if (typeof str !== 'string') {
    str = `${str}`;
  }
  return str.length === 0;
}

export function isNotEmptyString(str: any): boolean {
  return !isEmptyString(str);
}



export function versionCompare(version1: string, version2: string): number {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] > v2[i]) {
      return 1;
    } else if (v1[i] < v2[i]) {
      return -1;
    }
  }
  return 0;
}

export function isVersionUpdate(newVersion: string, oldVersion: string, minVersion: string): boolean {
  // 新版本必须大于等于最小版本，旧版本必须小于最小版本
  return versionCompare(newVersion, minVersion) >= 0 && versionCompare(oldVersion, minVersion) < 0;
}

export function subStr(str: string, len: number): string {
  if (isEmptyString(str)) {
    return '';
  }
  return str.substring(0, len);
}

/**
 * 深拷贝一个对象或数组，支持循环引用和多种数据类型
 * @param source 要拷贝的源对象
 * @param hash 用于处理循环引用的 WeakMap
 * @returns 深拷贝后的新对象
 */
export function deepClone<T>(source: T, hash = new WeakMap()): T {
  // 处理 null 或原始类型
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // 处理日期对象
  if (source instanceof Date) {
    return new Date(source.getTime()) as T;
  }

  // 处理正则表达式
  if (source instanceof RegExp) {
    return new RegExp(source.source, source.flags) as T;
  }

  // 处理 Map
  if (source instanceof Map) {
    const clonedMap = new Map();
    hash.set(source, clonedMap);
    source.forEach((value, key) => {
      clonedMap.set(deepClone(key, hash), deepClone(value, hash));
    });
    return clonedMap as T;
  }

  // 处理 Set
  if (source instanceof Set) {
    const clonedSet = new Set();
    hash.set(source, clonedSet);
    source.forEach(value => {
      clonedSet.add(deepClone(value, hash));
    });
    return clonedSet as T;
  }

  // 处理数组
  if (Array.isArray(source)) {
    const clonedArray: any[] = [];
    hash.set(source as any, clonedArray);
    source.forEach((item, index) => {
      clonedArray[index] = deepClone(item, hash);
    });
    return clonedArray as T;
  }

  // 处理循环引用
  if (hash.has(source as any)) {
    return hash.get(source as any);
  }

  // 处理普通对象
  const clonedObj = Object.create(Object.getPrototypeOf(source));
  hash.set(source as any, clonedObj);

  // 拷贝所有可枚举属性
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      clonedObj[key] = deepClone((source as any)[key], hash);
    }
  }

  // 拷贝 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(source);
  symbolKeys.forEach(symbol => {
    clonedObj[symbol] = deepClone((source as any)[symbol], hash);
  });

  return clonedObj;
}

/**
 * If value is null or undefined, return default value.
 * @param value 检测值
 * @param defaultValue 默认值
 */
export function defaultIfNull<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || typeof value === 'undefined' ? defaultValue : value;
}

/**
 * If object is null or undefined, return default value.
 * @param value
 * @param attr
 * @param defaultValue
 */
export function ifObjectIsNull<T extends Record<string, any>, A extends T[K], K extends keyof T>(value: T | null | undefined, attr: K, defaultValue: A): A {
  if (value) {
    return value[attr] ?? defaultValue;
  } else {
    return defaultValue;
  }
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
export function clone<T>(obj: T, deep = false) {
  if (deep) {
    return deepClone(obj);
  }
  return structuredClone(obj);
}

/**
 * 深度合并对象
 * @param initial 初始值
 * @param source 源值
 * @returns 合并后的对象
 */
export function assignDeep<T extends Record<string, any>>(initial: T, source?: any | null): T {
  if (!source) {
    return initial;
  }
  for (let initialKey in initial) {
    const own = initial[initialKey];
    const target = source[initialKey];
    // 不等于undefined，说明有值，更加准确
    if (typeof target !== 'undefined') {
      if (typeof own === 'object') {
        if (Array.isArray(own)) {
          if (Array.isArray(target)) {
            initial[initialKey] = target.concat(own) as any;
          } else {
            initial[initialKey] = [target].concat(own) as any;
          }
        } else {
          initial[initialKey] = assignDeep(initial[initialKey], source[initialKey]);
        }
      } else if (typeof own === typeof target) {
        // 类型相同，直接赋值
        initial[initialKey] = target;
      }
    }
  }
  return initial;
}
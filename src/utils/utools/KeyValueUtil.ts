export const KeyValueUtil = {
  getItem: <T>(key: string): T | null => {
    return utools.dbStorage.getItem(key) as T | null;
  },
  getItemByDefault: <T>(key: string, defaultValue: T): T => {
    return (utools.dbStorage.getItem(key) as T) || defaultValue;
  },
  setItem: <T>(key: string, value: T) => {
    utools.dbStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    utools.dbStorage.removeItem(key);
  }
}
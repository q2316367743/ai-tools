/// <reference types="vite/client" />


interface OpenFileOption {
  title?: string,
  defaultPath?: string,
  buttonLabel?: string,
  filters?: { name: string, extensions: string[] }[],
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>,
  message?: string,
  securityScopedBookmarks?: boolean
}

interface Window {
  preload: {
    /**
     * 发送消息到指定窗口
     * @param id 窗口ID
     * @param channel 通道名称
     * @param data  数据
     */
    sendTo(id: string, channel: string, data?: any);
    fs: {
      /**
       * 下载一个链接到指定文件路径
       * @param url 链接
       * @param path 文件路径
       */
      downloadUrl(url: string, path: string): Promise<void>;
      /**
       * 创建目录
       * @param path 路径
       * @param recursive 递归创建
       */
      mkdir(path: string, recursive?: boolean): void;
    },
    path: {
      /**
       * 拼接路径
       * @param path 路径部门
       */
      join(...path: string[]): string;
    }
  }
}
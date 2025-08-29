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
     * 打开一个文件，并返回File对象
     * @param options 参数
     * @return 返回File对象
     */
    openFile(options: OpenFileOption): Promise<File>,
    /**
     * 从url下载一个文件到指定目录
     * @param url 链接
     * @param path 要保存的文件路径，包含文件名
     */
    downloadFileFromUrl(url: string, path: string): Promise<void>,
    /**
     * 下载一个文件
     * @param data 文件内容，可以使blob(file)或ArrayBuffer或者链接或者DATA URL
     * @param name 文件名
     * @return 文件保存的路径
     */
    downloadFile(data: string | Blob | ArrayBuffer, name: string): Promise<string>;
    /**
     * 发送消息到指定窗口
     * @param id 窗口ID
     * @param channel 通道名称
     * @param data  数据
     */
    sendTo(id: string, channel: string, data?: any);
  }
}
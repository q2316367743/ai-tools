class CacheManage {
  private readonly cacheDir = window.preload.path.join(utools.getPath('appData'), 'xyz.esion.ai-tool', 'cache');

  constructor() {
    window.preload.fs.mkdir(this.cacheDir, true);
  }

  handle(string: string): Promise<string>;

}

export const cacheManage = new CacheManage();
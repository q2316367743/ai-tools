class CacheManage {
  private readonly cacheDir = window.preload.path.join(utools.getPath('appData'), 'xyz.esion.ai-tool', 'cache');

  /**
   * 处理HTML内容，下载并替换其中的远程资源链接
   * @param html HTML内容
   * @returns 处理后的HTML内容
   */
  async handle(html: string): Promise<string> {
    // 创建一个临时的div来解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 处理各种资源
    await this.processStylesheets(doc);
    await this.processScripts(doc);
    await this.processImages(doc);

    // 返回处理后的HTML
    return doc.documentElement.outerHTML;
  }

  /**
   * 处理样式表链接
   * @param doc Document对象
   */
  private async processStylesheets(doc: Document): Promise<void> {
    const links = doc.querySelectorAll('link[rel="stylesheet"]');
    for (const link of Array.from(links)) {
      const href = link.getAttribute('href');
      if (href && this.isRemoteUrl(href)) {
        try {
          const localPath = await this.downloadResource(href);
          link.setAttribute('href', localPath);
        } catch (error) {
          console.error(`Failed to download stylesheet: ${href}`, error);
        }
      }
    }
  }

  /**
   * 处理脚本链接
   * @param doc Document对象
   */
  private async processScripts(doc: Document): Promise<void> {
    const scripts = doc.querySelectorAll('script[src]');
    for (const script of Array.from(scripts)) {
      const src = script.getAttribute('src');
      if (src && this.isRemoteUrl(src)) {
        try {
          const localPath = await this.downloadResource(src);
          script.setAttribute('src', localPath);
        } catch (error) {
          console.error(`Failed to download script: ${src}`, error);
        }
      }
    }
  }

  /**
   * 处理图片资源
   * @param doc Document对象
   */
  private async processImages(doc: Document): Promise<void> {
    const images = doc.querySelectorAll('img[src]');
    for (const img of Array.from(images)) {
      const src = img.getAttribute('src');
      if (src && this.isRemoteUrl(src)) {
        try {
          const localPath = await this.downloadResource(src);
          img.setAttribute('src', localPath);
        } catch (error) {
          console.error(`Failed to download image: ${src}`, error);
        }
      }
    }
  }

  /**
   * 判断是否为远程URL
   * @param url URL地址
   * @returns 是否为远程URL
   */
  private isRemoteUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
  }

  /**
   * 下载远程资源并缓存到本地
   * @param url 远程资源URL
   * @returns 本地缓存路径
   */
  private async downloadResource(url: string): Promise<string> {
    // 根据URL生成文件名和路径
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    let pathname = urlObj.pathname;
    
    // 确保路径以 '/' 开头
    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }
    
    // 处理路径中的特殊字符
    const safePath = this.sanitizePath(pathname);
    
    // 本地文件路径
    const localPath = window.preload.path.join(this.cacheDir, hostname, safePath);
    
    // 创建目录
    const dirPath = window.preload.path.dirname(localPath);
    await window.preload.fs.mkdir(dirPath, true);

    const exists = window.preload.fs.existsSync(localPath);
    if (exists) return localPath;

    // 下载文件
    await window.preload.fs.downloadUrl(url, localPath);
    
    // 返回相对于缓存目录的路径
    return localPath;
  }

  /**
   * 处理路径中的特殊字符，确保路径安全
   * @param path 路径
   * @returns 安全的路径
   */
  private sanitizePath(path: string): string {
    // 移除或替换不安全的字符
    return path.replace(/[^a-zA-Z0-9\-_\/.]/g, '_');
  }
}

export const cacheManage = new CacheManage();
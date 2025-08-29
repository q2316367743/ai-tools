export class CacheManage {
  cacheDir = window.preload.path.join(utools.getPath("appData"), "xyz.esion.ai-tool", "cache");
  async handle(html) {
    const parser = new DOMParser;
    const doc = parser.parseFromString(html, "text/html");
    await this.processStylesheets(doc);
    await this.processScripts(doc);
    // 远程图片可以加载
    // await this.processImages(doc);
    return doc.documentElement.outerHTML;
  }
  async processStylesheets(doc) {
    const links = doc.querySelectorAll('link[rel="stylesheet"]');
    for (const link of Array.from(links)) {
      const href = link.getAttribute("href");
      if (href && this.isRemoteUrl(href)) {
        try {
          const localPath = await this.downloadResource(href);
          link.setAttribute("href", localPath);
        } catch (error) {
          console.error(`Failed to download stylesheet: ${href}`, error);
        }
      }
    }
  }
  async processScripts(doc) {
    const scripts = doc.querySelectorAll("script[src]");
    for (const script of Array.from(scripts)) {
      const src = script.getAttribute("src");
      if (src && this.isRemoteUrl(src)) {
        try {
          const localPath = await this.downloadResource(src);
          script.setAttribute("src", localPath);
        } catch (error) {
          console.error(`Failed to download script: ${src}`, error);
        }
      }
    }
  }
  async processImages(doc) {
    const images = doc.querySelectorAll("img[src]");
    for (const img of Array.from(images)) {
      const src = img.getAttribute("src");
      if (src && this.isRemoteUrl(src)) {
        try {
          const localPath = await this.downloadResource(src);
          img.setAttribute("src", localPath);
        } catch (error) {
          console.error(`Failed to download image: ${src}`, error);
        }
      }
    }
  }
  isRemoteUrl(url) {
    return /^https?:\/\//.test(url);
  }
  async downloadResource(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    let pathname = urlObj.pathname;
    if (!pathname.startsWith("/")) {
      pathname = "/" + pathname;
    }
    const safePath = this.sanitizePath(pathname);
    const localPath = window.preload.path.join(this.cacheDir, hostname, safePath);
    const dirPath = window.preload.path.dirname(localPath);
    await window.preload.fs.mkdir(dirPath, true);
    const exists = window.preload.fs.existsSync(localPath);
    if (exists)
      return localPath;
    await window.preload.fs.downloadUrl(url, localPath);
    return localPath;
  }
  sanitizePath(path) {
    return path.replace(/[^a-zA-Z0-9\-_\/.]/g, "_");
  }
}
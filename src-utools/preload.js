const {existsSync, createWriteStream} = require('node:fs');
const {mkdir} = require('node:fs/promises');
const {dirname, join} = require('node:path');
const {URL} = require("node:url");
const https = require("node:https");
const http = require("node:http");
const {ipcRenderer} = require('electron');

/**
 * 下载文件
 * @param {string} url 远程连接
 * @param path 本地路径
 * @return {Promise<void>}
 */
async function downloadUrl(url, path) {
  console.log(`正在从「${url}」下载文件到「${path}」`)
  return new Promise((resolve, reject) => {
    const file = createWriteStream(path);
    const urlObj = new URL(url);
    const request = urlObj.protocol === 'https:' ? https : http;

    request.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

window.preload = {
  ipc: {
    onload(callback) {
      ipcRenderer.once('open-ai-tool', callback);
    },
    sendTo(id, channel, data) {
      ipcRenderer.sendTo(id, channel, data)
    }
  },
  fs: {
    async mkdir(path, recursive) {
      if (existsSync(path)) return Promise.resolve();
      await mkdir(path, {recursive});
      return Promise.resolve();
    },
    async downloadUrl(url, path) {
      // 确保目录存在
      const dir = dirname(path);
      await this.mkdir(dir, true);
      // 下载文件
      return downloadUrl(url, path);
    },
    existsSync
  },
  path: {
    join, dirname
  }
}
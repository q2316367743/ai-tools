const {ipcRenderer} = require('electron');

window.preload = {
  onload(callback) {
    ipcRenderer.once('open-ai-tool', callback);
  }
}
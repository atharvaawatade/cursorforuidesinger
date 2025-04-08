const fs = require('fs').promises;
const path = require('path');

class FileManager {
  constructor(fileTreeElement) {
    this.fileTreeElement = fileTreeElement;
    this.filesDir = path.join(__dirname, '../../../files');
    this.files = { html: '', css: '', js: '' };
    this.init();
  }

  async init() {
    await fs.mkdir(this.filesDir, { recursive: true });
  }

  async saveFiles(files) {
    this.files = files;
    if (files.html) {
      await fs.writeFile(path.join(this.filesDir, 'generated.html'), files.html);
    }
    if (files.css) {
      await fs.writeFile(path.join(this.filesDir, 'generated.css'), files.css);
    }
    if (files.js) {
      await fs.writeFile(path.join(this.filesDir, 'generated.js'), files.js);
    }
    this.updateFileTree();
  }

  updateFileTree() {
    this.fileTreeElement.innerHTML = '';
    if (this.files.html) {
      const htmlItem = document.createElement('div');
      htmlItem.className = 'file-item';
      htmlItem.textContent = 'generated.html';
      htmlItem.dataset.type = 'html';
      this.fileTreeElement.appendChild(htmlItem);
    }
    if (this.files.css) {
      const cssItem = document.createElement('div');
      cssItem.className = 'file-item';
      cssItem.textContent = 'generated.css';
      cssItem.dataset.type = 'css';
      this.fileTreeElement.appendChild(cssItem);
    }
    if (this.files.js) {
      const jsItem = document.createElement('div');
      jsItem.className = 'file-item';
      jsItem.textContent = 'generated.js';
      jsItem.dataset.type = 'js';
      this.fileTreeElement.appendChild(jsItem);
    }
  }

  getFiles() {
    return this.files;
  }

  async downloadFiles() {
    const JSZip = require('jszip');
    const { saveAs } = require('file-saver');
    const zip = new JSZip();
    if (this.files.html) zip.file('generated.html', this.files.html);
    if (this.files.css) zip.file('generated.css', this.files.css);
    if (this.files.js) zip.file('generated.js', this.files.js);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'generated-design.zip');
  }
}

module.exports = FileManager;
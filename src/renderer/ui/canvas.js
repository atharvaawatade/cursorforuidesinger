class CanvasManager {
    constructor(iframe, loadingElement, fileManager) {
      this.whiteboard = iframe;
      this.loadingElement = loadingElement;
      this.fileManager = fileManager;
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.isGridVisible = false;
      this.isSnapToGrid = false;
      this.gridSize = 20;
      this.isPanning = false;
      this.isDragging = false;
      this.isResizing = false;
      this.startX = 0;
      this.startY = 0;
      this.selectedElement = null;
      this.layers = [];
      this.tool = 'select';
      this.history = [];
      this.historyIndex = -1;
      this.viewportMode = 'desktop';
      this.init();
    }
  
    init() {
      this.setupGrid();
      this.setupEventListeners();
      this.setupCanvasEditing();
      this.setupToolbar();
      this.setupViewportModes();
      this.setupUndoRedo();
    }
  
    setupGrid() {
      this.whiteboard.style.background = this.isGridVisible ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${this.gridSize}" height="${this.gridSize}" fill="none"><rect width="100%" height="100%" fill="none"/><rect width="1" height="100%" fill="rgba(255,255,255,0.1)"/><rect width="100%" height="1" fill="rgba(255,255,255,0.1)"/></svg>')` : 'none';
    }
  
    setupEventListeners() {
      this.whiteboard.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.scale = Math.max(0.1, Math.min(2, this.scale + delta));
        this.updateTransform();
        this.updateZoomLevel();
      });
  
      this.whiteboard.addEventListener('mousedown', (e) => {
        if (e.button === 1) {
          this.isPanning = true;
          this.startX = e.clientX - this.translateX;
          this.startY = e.clientY - this.translateY;
          this.whiteboard.style.cursor = 'grabbing';
        }
      });
  
      this.whiteboard.addEventListener('mousemove', (e) => {
        if (this.isPanning) {
          this.translateX = e.clientX - this.startX;
          this.translateY = e.clientY - this.startY;
          this.updateTransform();
        }
      });
  
      this.whiteboard.addEventListener('mouseup', () => {
        this.isPanning = false;
        this.whiteboard.style.cursor = 'default';
      });
  
      this.whiteboard.addEventListener('mouseleave', () => {
        this.isPanning = false;
        this.whiteboard.style.cursor = 'default';
      });
    }
  
    setupCanvasEditing() {
      const doc = this.whiteboard.contentDocument || this.whiteboard.contentWindow.document;
      
      doc.addEventListener('click', (e) => {
        const target = e.target;
        if (target === doc.body || target === doc.documentElement) {
          this.deselectElement();
          return;
        }
        this.selectElement(target);
      });
  
      doc.addEventListener('mousedown', (e) => {
        if (this.selectedElement && e.target === this.selectedElement) {
          this.isDragging = true;
          this.startX = e.clientX / this.scale - parseFloat(this.selectedElement.style.left || 0);
          this.startY = e.clientY / this.scale - parseFloat(this.selectedElement.style.top || 0);
          this.selectedElement.style.transition = 'none';
        }
      });
  
      doc.addEventListener('mousemove', (e) => {
        if (this.isDragging && this.selectedElement) {
          let newX = e.clientX / this.scale - this.startX;
          let newY = e.clientY / this.scale - this.startY;
          
          if (this.isSnapToGrid) {
            newX = Math.round(newX / this.gridSize) * this.gridSize;
            newY = Math.round(newY / this.gridSize) * this.gridSize;
          }
  
          this.selectedElement.style.position = 'absolute';
          this.selectedElement.style.left = `${newX}px`;
          this.selectedElement.style.top = `${newY}px`;
          this.updatePropertiesPanel();
          this.updateCode();
        }
      });
  
      doc.addEventListener('mouseup', () => {
        if (this.selectedElement) {
          this.selectedElement.style.transition = 'all 0.2s ease-in-out';
        }
        this.isDragging = false;
      });
    }
  
    setupToolbar() {
      const toolButtons = document.querySelectorAll('.tool-btn');
      toolButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tool = button.dataset.tool;
          if (tool) {
            this.setTool(tool);
            toolButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
            button.setAttribute('aria-pressed', 'true');
          }
        });
      });
  
      document.getElementById('grid-toggle').addEventListener('click', () => {
        this.toggleGrid();
        const button = document.getElementById('grid-toggle');
        button.setAttribute('aria-pressed', this.isGridVisible.toString());
      });
  
      document.getElementById('snap-toggle').addEventListener('click', () => {
        this.toggleSnapToGrid();
        const button = document.getElementById('snap-toggle');
        button.setAttribute('aria-pressed', this.isSnapToGrid.toString());
      });
    }
  
    setTool(tool) {
      this.tool = tool;
      const doc = this.whiteboard.contentDocument || this.whiteboard.contentWindow.document;
      
      switch (tool) {
        case 'select':
          doc.body.style.cursor = 'default';
          break;
        case 'rectangle':
          doc.body.style.cursor = 'crosshair';
          break;
        case 'text':
          doc.body.style.cursor = 'text';
          break;
        case 'image':
          doc.body.style.cursor = 'copy';
          break;
      }
    }
  
    selectElement(element) {
      if (this.selectedElement) {
        this.selectedElement.classList.remove('selected');
      }
      this.selectedElement = element;
      this.selectedElement.classList.add('selected');
      this.updatePropertiesPanel();
      this.updateLayersPanel();
    }
  
    deselectElement() {
      if (this.selectedElement) {
        this.selectedElement.classList.remove('selected');
        this.selectedElement = null;
        this.updatePropertiesPanel();
        this.updateLayersPanel();
      }
    }
  
    updatePropertiesPanel() {
      const bgColorInput = document.getElementById('bg-color');
      const widthInput = document.getElementById('width');
      const heightInput = document.getElementById('height');
      const posXInput = document.getElementById('pos-x');
      const posYInput = document.getElementById('pos-y');
  
      if (this.selectedElement) {
        const styles = window.getComputedStyle(this.selectedElement);
        bgColorInput.value = rgbToHex(styles.backgroundColor);
        widthInput.value = parseInt(styles.width) || '';
        heightInput.value = parseInt(styles.height) || '';
        posXInput.value = parseInt(this.selectedElement.style.left) || 0;
        posYInput.value = parseInt(this.selectedElement.style.top) || 0;
  
        bgColorInput.onchange = () => {
          this.selectedElement.style.backgroundColor = bgColorInput.value;
          this.updateCode();
        };
        widthInput.onchange = () => {
          this.selectedElement.style.width = `${widthInput.value}px`;
          this.updateCode();
        };
        heightInput.onchange = () => {
          this.selectedElement.style.height = `${heightInput.value}px`;
          this.updateCode();
        };
        posXInput.onchange = () => {
          this.selectedElement.style.position = 'absolute';
          this.selectedElement.style.left = `${posXInput.value}px`;
          this.updateCode();
        };
        posYInput.onchange = () => {
          this.selectedElement.style.position = 'absolute';
          this.selectedElement.style.top = `${posYInput.value}px`;
          this.updateCode();
        };
      } else {
        bgColorInput.value = '#000000';
        widthInput.value = '';
        heightInput.value = '';
        posXInput.value = '';
        posYInput.value = '';
      }
    }
  
    updateLayersPanel() {
      const layersContent = document.getElementById('layers-content');
      layersContent.innerHTML = '';
      const doc = this.whiteboard.contentDocument || this.whiteboard.contentWindow.document;
      const elements = doc.body.querySelectorAll('*');
      this.layers = Array.from(elements).filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE');
      
      this.layers.forEach((el, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.setAttribute('role', 'listitem');
        layerItem.setAttribute('aria-selected', el === this.selectedElement);
        
        const icon = document.createElement('i');
        icon.className = this.getLayerIcon(el.tagName);
        
        const label = document.createElement('span');
        label.textContent = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '');
        
        layerItem.appendChild(icon);
        layerItem.appendChild(label);
        
        if (el === this.selectedElement) {
          layerItem.classList.add('active');
        }
        
        layerItem.onclick = () => this.selectElement(el);
        layersContent.appendChild(layerItem);
      });
    }
  
    getLayerIcon(tagName) {
      switch (tagName.toLowerCase()) {
        case 'div': return 'fas fa-square';
        case 'p': return 'fas fa-paragraph';
        case 'img': return 'fas fa-image';
        case 'button': return 'fas fa-square';
        case 'input': return 'fas fa-i-cursor';
        default: return 'fas fa-square';
      }
    }
  
    update(files) {
      this.showLoading();
      setTimeout(() => {
        const htmlContent = files.html || '<!DOCTYPE html><html><head><title>Generated Design</title></head><body></body></html>';
        const cssContent = files.css ? `<style>${files.css}</style>` : '';
        const jsContent = files.js ? `<script>${files.js}</script>` : '';
        
        const combinedContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Generated Design</title>
              <style>
                * { 
                  user-select: none;
                  transition: all 0.2s ease-in-out;
                }
                .selected { 
                  outline: 2px solid var(--accent-primary);
                  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
                }
              </style>
              ${cssContent}
            </head>
            <body>
              ${htmlContent}
              ${jsContent}
            </body>
          </html>
        `;
        
        const doc = this.whiteboard.contentDocument || this.whiteboard.contentWindow.document;
        doc.open();
        doc.write(combinedContent);
        doc.close();
  
        setTimeout(() => {
          const body = doc.body;
          if (body) {
            const width = Math.max(body.scrollWidth, this.whiteboard.clientWidth);
            const height = Math.max(body.scrollHeight, this.whiteboard.clientHeight);
            this.whiteboard.style.width = `${width}px`;
            this.whiteboard.style.height = `${height}px`;
          }
          this.hideLoading();
          this.setupCanvasEditing();
          this.updateLayersPanel();
        }, 100);
      }, 500);
    }
  
    showLoading() {
      this.loadingElement.classList.add('active');
      this.loadingElement.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading canvas...</span>
      `;
    }
  
    hideLoading() {
      this.loadingElement.classList.remove('active');
    }
  
    reset() {
      this.update({ html: '', css: '', js: '' });
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.updateTransform();
      this.updateZoomLevel();
    }
  
    updateTransform() {
      requestAnimationFrame(() => {
        this.whiteboard.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
      });
    }
  
    updateZoomLevel() {
      const zoomLevel = document.getElementById('zoom-level');
      zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
    }
  
    toggleGrid() {
      this.isGridVisible = !this.isGridVisible;
      this.setupGrid();
    }
  
    toggleSnapToGrid() {
      this.isSnapToGrid = !this.isSnapToGrid;
    }
  
    updateCode() {
      const doc = this.whiteboard.contentDocument || this.whiteboard.contentWindow.document;
      const htmlContent = doc.body.innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      const cssContent = doc.querySelector('style')?.innerText || '';
      const jsContent = doc.querySelector('script')?.innerText || '';
      this.fileManager.saveFiles({ html: htmlContent, css: cssContent, js: jsContent });
    }

    setupViewportModes() {
        const viewportSizes = {
            desktop: { width: '100%', height: '100%' },
            tablet: { width: '768px', height: '1024px' },
            mobile: { width: '375px', height: '667px' }
        };

        this.setViewportMode = (mode) => {
            this.viewportMode = mode;
            const size = viewportSizes[mode];
            this.whiteboard.style.width = size.width;
            this.whiteboard.style.height = size.height;
            this.whiteboard.style.transform = `scale(${this.scale})`;
            this.centerCanvas();
        };
    }

    setupUndoRedo() {
        this.addToHistory = () => {
            const state = this.getCanvasState();
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(state);
            this.historyIndex++;
        };

        this.undo = () => {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.restoreCanvasState(this.history[this.historyIndex]);
            }
        };

        this.redo = () => {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.restoreCanvasState(this.history[this.historyIndex]);
            }
        };
    }

    centerCanvas() {
        const wrapper = this.whiteboard.parentElement;
        const wrapperRect = wrapper.getBoundingClientRect();
        const canvasRect = this.whiteboard.getBoundingClientRect();
        
        this.translateX = (wrapperRect.width - canvasRect.width) / 2;
        this.translateY = (wrapperRect.height - canvasRect.height) / 2;
        this.updateTransform();
    }
  }
  
  // Utility function to convert RGB to Hex
  function rgbToHex(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`;
  }
  
  module.exports = CanvasManager;

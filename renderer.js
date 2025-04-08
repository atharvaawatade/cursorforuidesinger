const AIAgent = require('./src/renderer/ai/aiAgent');
const CanvasManager = require('./src/renderer/ui/canvas');
const FileManager = require('./src/renderer/files/fileManager');

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const whiteboard = document.getElementById('whiteboard');
  const canvasLoading = document.getElementById('canvas-loading');
  const fileTree = document.getElementById('file-tree');
  const terminalPanel = document.getElementById('terminal-panel');
  const terminalToggle = document.getElementById('terminal-toggle');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  const aiChatHistory = document.getElementById('ai-chat-history');
  const aiPromptInput = document.getElementById('ai-prompt-input');
  const aiSendBtn = document.getElementById('ai-send-btn');
  const gridToggle = document.getElementById('grid-toggle');
  const snapToggle = document.getElementById('snap-toggle');
  const downloadCodeBtn = document.getElementById('download-code-btn');

  // State Management
  const state = {
    currentTool: 'select',
    zoomLevel: 100,
    viewport: 'desktop',
    history: [],
    isTerminalVisible: true,
  };

  // Initialize Managers
  const fileManager = new FileManager(fileTree);
  const canvasManager = new CanvasManager(whiteboard, canvasLoading, fileManager);
  const aiAgent = new AIAgent(' '); // Replace with your Google API key

  // Initialize UI
  function initializeUI() {
    // Tool Buttons
    document.querySelectorAll('.tool-btn').forEach(button => {
      button.addEventListener('click', () => {
        state.currentTool = button.dataset.tool;
        updateToolUI();
      });
    });

    // Viewport Controls
    document.querySelectorAll('.viewport-controls button').forEach(button => {
      button.addEventListener('click', () => {
        state.viewport = button.id.replace('-view', '');
        updateViewport();
      });
    });

    // Zoom Controls
    document.getElementById('zoom-in').addEventListener('click', () => {
      state.zoomLevel += 10;
      updateZoom();
    });
    document.getElementById('zoom-out').addEventListener('click', () => {
      state.zoomLevel = Math.max(10, state.zoomLevel - 10);
      updateZoom();
    });

    // Grid Toggle
    gridToggle.addEventListener('click', () => {
      canvasManager.toggleGrid();
      gridToggle.style.background = canvasManager.isGridVisible ? '#39ff14' : 'transparent';
      gridToggle.style.color = canvasManager.isGridVisible ? '#000000' : 'var(--text-color)';
    });

    // Snap Toggle
    snapToggle.addEventListener('click', () => {
      canvasManager.toggleSnapToGrid();
      snapToggle.style.background = canvasManager.isSnapToGrid ? '#39ff14' : 'transparent';
      snapToggle.style.color = canvasManager.isSnapToGrid ? '#000000' : 'var(--text-color)';
    });

    // Terminal Toggle
    terminalToggle.addEventListener('click', () => {
      state.isTerminalVisible = !state.isTerminalVisible;
      terminalPanel.classList.toggle('hidden', !state.isTerminalVisible);
      terminalToggle.textContent = state.isTerminalVisible ? 'Hide Terminal' : 'Show Terminal';
    });

    // Terminal Input
    terminalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = terminalInput.value.trim();
        terminalOutput.textContent += `> ${command}\n`;
        terminalInput.value = '';
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    });

    // File Tree Click Handler
    fileTree.addEventListener('click', (e) => {
      const fileItem = e.target.closest('.file-item');
      if (fileItem) {
        document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
        fileItem.classList.add('active');
        const files = fileManager.getFiles();
        canvasManager.update(files);
      }
    });

    // AI Chat Send Button
    aiSendBtn.addEventListener('click', async () => {
      const prompt = aiPromptInput.value.trim();
      if (prompt) {
        aiChatHistory.innerHTML += `<div class="chat-message user-message">${prompt}</div>`;
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
        aiPromptInput.value = '';
        await aiAgent.generateStepByStepCode(prompt, (step, message) => {
          aiChatHistory.innerHTML += `<div class="chat-message ai-message"><strong>${step}</strong><br>${message}</div>`;
          aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
        }, fileManager, canvasManager);
      }
    });

    // Download Code
    downloadCodeBtn.addEventListener('click', () => {
      fileManager.downloadFiles();
    });

    // Clear Terminal
    document.getElementById('clear-terminal-btn').addEventListener('click', () => {
      terminalOutput.textContent = '';
    });

    // Clear AI Chat
    document.getElementById('clear-chat-btn').addEventListener('click', () => {
      aiChatHistory.innerHTML = '';
    });
  }

  // Update Tool UI
  function updateToolUI() {
    document.querySelectorAll('.tool-btn').forEach(button => {
      button.style.background = button.dataset.tool === state.currentTool ? '#39ff14' : 'transparent';
      button.style.color = button.dataset.tool === state.currentTool ? '#000000' : 'var(--text-color)';
    });
  }

  // Update Viewport
  function updateViewport() {
    const widths = { desktop: '100%', tablet: '768px', mobile: '375px' };
    whiteboard.style.width = widths[state.viewport];
    whiteboard.style.margin = '0 auto';
  }

  // Update Zoom
  function updateZoom() {
    document.getElementById('zoom-level').textContent = `${state.zoomLevel}%`;
    canvasManager.scale = state.zoomLevel / 100;
    canvasManager.updateTransform();
  }

  // Initialize
  initializeUI();
  canvasManager.reset();
});
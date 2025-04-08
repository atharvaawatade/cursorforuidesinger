# Cursor for Designer

![image](https://github.com/user-attachments/assets/ef9671f3-4556-4526-be5c-edc948a58b32)
----------------------------------------------------------------------------------------------------------------------------------------------------------
![image](https://github.com/user-attachments/assets/9e6e3468-9d6f-4677-bace-cf3f0b153e95)



## 🚀 Overview

Cursor for Designer is a powerful, AI-assisted design workspace that bridges the gap between design and development. It allows designers and developers to create, prototype, and export web interfaces using an intuitive canvas with AI-powered generation capabilities.

Built with Electron and powered by Google's Gemini AI, Cursor for Designer streamlines the design-to-code workflow, enabling rapid prototyping and seamless code generation.

## ✨ Features

- **AI-Powered Design Generation**: Create UI designs by describing them in natural language
- **Interactive Canvas**: Manipulate design elements with intuitive controls
- **Multi-Viewport Preview**: Test designs across desktop, tablet, and mobile views
- **Code Export**: Generate and download HTML, CSS, and JavaScript code
- **File Management**: Organize and manage your design files
- **Terminal Integration**: Access command-line tools directly within the workspace
- **Grid & Snap Controls**: Precise element positioning with customizable grid
- **Layer Management**: Organize design elements with a comprehensive layer panel
- **Zoom & Pan Controls**: Navigate large designs with ease
- **Undo/Redo History**: Track and revert changes to your designs

## 🔧 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/cursorfordesigner.git
cd cursorfordesigner

# Install dependencies
npm install
# or
yarn install

# Start the application
npm start
# or
yarn start
```

### Building for Production

```bash
# Build for your current platform
npm run build
# or
yarn build
```

## 📖 Usage

### Creating a New Design

1. Launch Cursor for Designer
2. Use the AI Assistant panel on the right to describe your design
   - Example: "Create a shopping website homepage like Amazon"
3. The AI will generate HTML, CSS, and JavaScript code
4. The design will appear in the canvas for further editing

### Editing Elements

- **Select Tool**: Click on elements to select them
- **Rectangle Tool**: Add rectangular elements to the canvas
- **Text Tool**: Add text elements to the canvas
- **Image Tool**: Add image placeholders to the canvas

### Exporting Your Design

1. Click the "Download Code" button
2. A ZIP file containing HTML, CSS, and JavaScript will be downloaded
3. Use these files in your web project or further customize them

## 🏗️ Architecture

Cursor for Designer follows a modular architecture with clear separation of concerns:

```
cursorfordesigner/
├── main.js                 # Electron main process
├── renderer.js             # Electron renderer process
├── index.html              # Main application HTML
├── styles.css              # Global styles
├── src/
│   ├── renderer/
│   │   ├── ai/
│   │   │   └── aiAgent.js  # AI integration with Google Gemini
│   │   ├── files/
│   │   │   └── fileManager.js # File system operations
│   │   └── ui/
│   │       └── canvas.js   # Canvas management and rendering
├── files/                  # Generated design files
└── node_modules/           # Dependencies
```

### Core Components

1. **AI Agent**: Integrates with Google's Generative AI (Gemini) to process natural language prompts and generate design code
2. **Canvas Manager**: Handles the rendering and interaction with the design canvas
3. **File Manager**: Manages file operations, saving, and exporting designs

## 🔌 API

### AI Agent

The AI Agent uses Google's Generative AI to process design requests:

```javascript
const aiAgent = new AIAgent('YOUR_API_KEY');
await aiAgent.generateStepByStepCode(prompt, updateCallback, fileManager, canvasManager);
```

### Canvas Manager

The Canvas Manager provides methods for manipulating the design canvas:

```javascript
const canvasManager = new CanvasManager(iframe, loadingElement, fileManager);

// Update canvas with new code
canvasManager.update({ html, css, js });

// Zoom controls
canvasManager.zoomIn();
canvasManager.zoomOut();

// Toggle grid and snap features
canvasManager.toggleGrid();
canvasManager.toggleSnapToGrid();
```

### File Manager

The File Manager handles file operations:

```javascript
const fileManager = new FileManager(fileTreeElement);

// Save generated files
await fileManager.saveFiles({ html, css, js });

// Download files as ZIP
await fileManager.downloadFiles();
```

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Electron](https://www.electronjs.org/) - Cross-platform desktop app framework
- [Google Generative AI](https://ai.google.dev/) - AI model powering the design generation
- [JSZip](https://stuk.github.io/jszip/) - JavaScript library for creating ZIP files
- [html2canvas](https://html2canvas.hertzen.com/) - Screenshots with JavaScript

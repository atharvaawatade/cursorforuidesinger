const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    this.isGenerating = false;
  }

  async generateStepByStepCode(prompt, updateCallback, fileManager, canvasManager) {
    if (this.isGenerating) {
      updateCallback('Error', 'Please wait until the current generation is complete.');
      return;
    }

    this.isGenerating = true;
    updateCallback('Generating...', 'I’m working on your design request. Please wait...');

    try {
      const files = { html: '', css: '', js: '' };

      // Step 1: Generate HTML
      const htmlPrompt = `Generate the HTML structure for: ${prompt}. Provide only the code without explanations or markdown.`;
      files.html = await this.generateContent(htmlPrompt);
      await fileManager.saveFiles(files);
      canvasManager.update(files);
      updateCallback('Designing the structure...', 'I’ve created the HTML structure for your request. It includes the basic layout and elements needed for the design.');
      await this.delay(1000);

      // Step 2: Add CSS
      const cssPrompt = `Generate modern, responsive CSS for this HTML:\n${files.html}\nProvide only the CSS code without explanations or markdown.`;
      files.css = await this.generateContent(cssPrompt);
      await fileManager.saveFiles(files);
      canvasManager.update(files);
      updateCallback('Adding styles...', 'I’ve added CSS to style the design. This includes modern typography, colors, and responsive layouts to make it visually appealing.');
      await this.delay(1000);

      // Step 3: Add JavaScript
      const jsPrompt = `Generate JavaScript to enhance this HTML:\n${files.html}\nwith this CSS:\n${files.css}\nProvide only the JS code without explanations or markdown. If no JS is needed, return an empty string.`;
      files.js = await this.generateContent(jsPrompt);
      await fileManager.saveFiles(files);
      canvasManager.update(files);
      updateCallback('Enhancing functionality...', 'I’ve added JavaScript to enhance interactivity, such as form validation or animations, if applicable.');
    } catch (error) {
      updateCallback('Error', `Failed to generate design: ${error.message}`);
    } finally {
      this.isGenerating = false;
    }
  }

  async generateContent(prompt) {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let code = response.text().trim();

    if (code.startsWith('```html') && code.endsWith('```')) {
      code = code.slice(7, -3).trim();
    } else if (code.startsWith('```css') && code.endsWith('```')) {
      code = code.slice(6, -3).trim();
    } else if (code.startsWith('```javascript') && code.endsWith('```')) {
      code = code.slice(12, -3).trim();
    } else if (code.startsWith('```') && code.endsWith('```')) {
      code = code.slice(3, -3).trim();
    }

    return code;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AIAgent;
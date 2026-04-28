
class DiagnosticsPanel {
  #panelElement = null;
  #llmModel = null;
  prompt = null;

  async initialize() {
    // Fetch LLM model name from server config before initializing the UI
    try {
      const configResponse = await fetch('/api/config');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        this.#llmModel = configData.llmModel;
        this.prompt = configData.prompt;
      }
    } catch {
    }
  }

  show() {
    WebViewer.getInstance().UI.closeElements(['diagnosticsPanel']);
    WebViewer.getInstance().UI.openElements(['diagnosticsPanel']);
    WebViewer.getInstance().UI.setPanelWidth('diagnosticsPanel', 400);
  }

  render() {
    const llmModelBubble = this.#createBubble(`LLM Model: ${this.#llmModel}`, 'system');
    const fileNameBubble = this.#createBubble(`Document: ${globalThis.loadedDocument.fileName}`, 'system');

    // The main container div
    const panel = document.createElement('div');
    panel.className = 'diagnosticsPanelDivClass';

    const title = document.createElement('div');
    title.className = 'diagnosticsPanelTitleClass';
    title.innerText = 'LLM Session Diagnostics';
    panel.appendChild(title);
    
    if (llmModelBubble)
      panel.appendChild(llmModelBubble);
    if (fileNameBubble)
      panel.appendChild(fileNameBubble);

    this.#panelElement = panel;
    return this.#panelElement;
  }

  display(message, messageType) {
    const bubble = this.#createBubble(message, messageType);
    if (!bubble)
      return;

    if (this.#panelElement)
      this.#panelElement.appendChild(bubble);
  }

  #createBubble(message, messageType) {
    const bubble = document.createElement('div');

    if (messageType === 'system')
      bubble.className = 'systemMessageDivClass';
    else if (messageType === 'human')
      bubble.className = 'humanMessageDivClass';
    else
      return null;

    if (!message || message.trim() === '')
      return null;

    bubble.innerText = message;
    return bubble;
  }
}

export default DiagnosticsPanel;

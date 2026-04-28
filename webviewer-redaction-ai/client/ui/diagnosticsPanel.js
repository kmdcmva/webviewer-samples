
class DiagnosticsPanel {
  #panelElement = null;

  show() {
    WebViewer.getInstance().UI.closeElements(['diagnosticsPanel']);
    WebViewer.getInstance().UI.openElements(['diagnosticsPanel']);
    WebViewer.getInstance().UI.setPanelWidth('diagnosticsPanel', 400);
  }

  render() {
    // The main container div
    this.#panelElement = document.createElement('div');
    this.#panelElement.className = 'diagnosticsPanelDivClass';

    const title = document.createElement('div');
    title.className = 'diagnosticsPanelTitleClass';
    title.innerText = 'LLM Session Diagnostics';
    this.#panelElement.appendChild(title);

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

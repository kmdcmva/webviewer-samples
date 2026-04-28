
class DiagnosticsPanel {
  #panelElement = null;
  #diagnosticsLog = [];

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

    // Restore existing log entries when the panel is re-rendered (for example, after toggle).
    this.#diagnosticsLog.forEach(({ message, messageType }) => {
      const bubble = this.#createBubble(message, messageType);
      if (bubble)
        this.#panelElement.appendChild(bubble);
    });

    return this.#panelElement;
  }

  display(message, messageType) {
    const bubble = this.#createBubble(message, messageType);
    if (!bubble)
      return;

    if (this.#panelElement) {
      this.#panelElement.appendChild(bubble);
      this.#diagnosticsLog.push({ message, messageType });
    }
  }

  #createBubble(message, messageType) {
    if (!message || message.trim() === '')
      return null;

    const bubble = document.createElement('div');

    if (messageType === 'system')
      bubble.className = 'systemMessageDivClass';
    else if (messageType === 'human')
      bubble.className = 'humanMessageDivClass';
    else
      return null;

    bubble.innerText = message;
    return bubble;
  }
}

export default DiagnosticsPanel;
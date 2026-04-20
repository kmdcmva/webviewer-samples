import { analyzeDocumentForPII } from '../document/analyzer.js';
import { applyRedactions } from '../redaction.js';

const functionMap = {
  'aiPanelRender': () => {
    return globalThis.aiPanel.render();
  },
  'AIPIIRedactionClick': async () => {
    globalThis.aiPanel?.addBubble(globalThis.aiPanel.prompt, 'human');
    await analyzeDocumentForPII();
    globalThis.aiPanel?.addBubble(`Status: ${globalThis.aiAnalysisResult.success ? 'Success' : 'Failure'}`, 'system');
    globalThis.aiPanel?.addBubble('Response:', 'system');
    if (globalThis.aiAnalysisResult.success) {
      globalThis.aiPanel?.addBubble(globalThis.aiAnalysisResult.analysis, 'system');
      await applyRedactions();
    }
    else
      globalThis.aiPanel?.addBubble(globalThis.aiAnalysisResult.error, 'system');
  },
};

export default functionMap;
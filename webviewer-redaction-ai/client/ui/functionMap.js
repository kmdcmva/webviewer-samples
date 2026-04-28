import { analyzeDocumentForPII } from '../document/analyzer.js';
import { applyRedactions } from '../redaction.js';

const functionMap = {
  'diagnosticsPanelRender': () => {
    return globalThis.diagnosticsPanel.render();
  },
  'AIPIIRedactionClick': async () => {
    globalThis.diagnosticsPanel?.addBubble(globalThis.diagnosticsPanel.prompt, 'human');

    const analysisSucceeded = await analyzeDocumentForPII();
    if (!analysisSucceeded || !globalThis.aiAnalysisResult) {
      globalThis.diagnosticsPanel?.addBubble('Status: Failure', 'system');
      globalThis.diagnosticsPanel?.addBubble('Response:', 'system');
      globalThis.diagnosticsPanel?.addBubble('Unable to analyze document for PII.', 'system');
      if (globalThis.aiAnalysisResult?.error)
        globalThis.diagnosticsPanel?.addBubble(`Error details: ${globalThis.aiAnalysisResult.error}`, 'system');
      return;
    }

    globalThis.diagnosticsPanel?.addBubble(`Status: ${globalThis.aiAnalysisResult.success ? 'Success' : 'Failure'}`, 'system');
    globalThis.diagnosticsPanel?.addBubble('Response:', 'system');
    if (globalThis.aiAnalysisResult.success) {
      globalThis.diagnosticsPanel?.addBubble(globalThis.aiAnalysisResult.analysis, 'system');
      await applyRedactions();
    }
    else
      globalThis.diagnosticsPanel?.addBubble(globalThis.aiAnalysisResult.error, 'system');
  },
};

export default functionMap;
import { analyzeDocumentForPII } from '../document/analyzer.js';
import { applyRedactions } from '../redaction.js';

const functionMap = {
  'AIPIIRedactionClick': async () => {
    const analysisSuccess = await analyzeDocumentForPII();
    if (analysisSuccess) {
      await applyRedactions();
    }
  },
};

export default functionMap;
import { analyzeDocumentForPII } from '../document/analyzer.js';
import { applyRedactions } from '../redaction.js';

const functionMap = {
  'AIPIIRedactionClick': async () => {
    await analyzeDocumentForPII();
    await applyRedactions();
  },
};

export default functionMap;
import DocumentManager from './document/manager.js';
import functionMap from './ui/functionMap.js';
import AIPanel from './ui/aiPanel.js';
const customUIFile = './ui/custom.json';

const instance = await WebViewer({
  path: 'lib',
  initialDoc: globalThis.files[0],
  fullAPI: true,
  loadAsPDF: true,
  enableFilePicker: true, // Enable file picker to open files. In WebViewer -> menu icon -> Open File
  enableRedaction: true,
  css: 'ui/styles.css',
  licenseKey: 'YOUR_LICENSE_KEY',
}, document.getElementById('viewer'));

const { documentViewer } = instance.Core;
const { UI } = instance;

// Import modular components configuration from JSON file
try {
  const response = await fetch(customUIFile);
  if (!response.ok)
    throw new Error(`Failed to import modular components configuration: ${response.statusText}`);

  let customUIConfig = JSON.stringify(await response.json());
  WebViewer.getInstance().UI.importModularComponents(JSON.parse(customUIConfig), functionMap);
} catch (error) {
  throw new Error(`Failed to import modular components configuration: ${error.message}`);
}

documentViewer.addEventListener('documentLoaded', async () => {
  // Switch to the Redact toolbar group
  UI.setToolbarGroup('toolbarGroup-Redact');

  // Set layout to Facing Continuous and fit mode
  // to Fit Page for better redaction experience
  UI.setLayoutMode(UI.LayoutMode.FacingContinuous);
  UI.setFitMode(UI.FitMode.FitPage);

  // Load document manager
  globalThis.loadedDocument = new DocumentManager(documentViewer);
  await globalThis.loadedDocument.initialize().then(async () => {
    globalThis.aiPanel = new AIPanel();
    await globalThis.aiPanel.initialize();
    globalThis.aiPanel.show();
  }).catch(error => {
    console.error('Failed to initialize document manager:', error);
  });
});
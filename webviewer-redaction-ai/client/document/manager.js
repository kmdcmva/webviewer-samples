// Manage the loaded document-related
// properties and operations.
// NOTE: The loaded document contents is cached in this object.
//       Document contents edit requires saving then re-loading.
class DocumentManager {
  #documentViewer;
  #instance;
  fileName;
  text;
  #isValid;
  pageCount;

  constructor(documentViewer) {
    this.#documentViewer = documentViewer;
    this.#instance = null;
    this.fileName = '';
    this.text = '';
    this.#isValid = true;
    this.pageCount = 0;
  }

  async initialize() {
    this.#instance = this.#documentViewer.getDocument();
    this.#isValid = !!this.#instance;
    if (!this.#isValid) {
      console.error('Failed to initialize document manager.');
      return;
    }
    this.fileName = this.#instance.getFilename();
    this.pageCount = this.#instance.getPageCount();
    await this.#instance.getDocumentCompletePromise().then(async () => {
      // Load full document text
      for (let pageIndex = 1; pageIndex <= this.pageCount; pageIndex++) {
        try {
          const pageText = await this.#instance.loadPageText(pageIndex);
          this.text += `${pageText}\n`;
        } catch (error) {
          this.text += `[Error loading page content: ${error.message}]\n`;
          continue;
        }
      }
    });
    this.#isValid = this.#instance &&
      this.text.length > 0;
  }
}

export default DocumentManager;
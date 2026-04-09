// InMemoryStore class to validate the received document text length
// and page count are within acceptable limits to prevent processing
// of excessively large documents.
export default class InMemoryStore {
  static ALLOWED_PAGES = 20;
  static MAX_DOCUMENT_LENGTH = 30000;

  isValidDocument(documentText, pageCount) {
    if (!documentText || documentText.length === 0)
      return 0;

    if (documentText.length > InMemoryStore.MAX_DOCUMENT_LENGTH)
      return 1;

    if (pageCount > InMemoryStore.ALLOWED_PAGES)
      return 2;
    
    return -1;
  }
}

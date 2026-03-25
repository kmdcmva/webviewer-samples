// Send the loaded document text to the server, to be
// analyzed for personal information identification (PII)
const sendTextToServer = async () => {
  try {
    const response = await fetch('/api/send-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText: globalThis.loadedDocument?.text ?? '',
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok)
      throw new Error(`Server error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error('Error sending document text to server:', error);
    throw error;
  }
}

// Analyze the loaded document text for personal information identification (PII)
const analyzeDocument = async (documentId) => {
  try {
    const response = await fetch('/api/analyze-pii', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: documentId,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok)
      throw new Error(`Server error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error('Error analyzing document for PII:', error);
    throw error;
  }
}

// Receive analysis result from the server
const getAnalysisResult = async (documentId) => {
  try {
    const response = await fetch(`/api/get-results/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok)
      throw new Error(`Server error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error('Error getting analysis result:', error);
    throw error;
  }
}

const analyzeDocumentForPII = async () => {
  // Show WebViewer loading spinner
  WebViewer.getInstance().UI.openElements('loadingModal');
  try {
    // Step 1: Send document text to server
    const sendResult = await sendTextToServer();
    const documentId = sendResult.documentId;

    // Step 2: Analyze document for PII
    await analyzeDocument(documentId);

    // Step 3: Get analysis result from server
    globalThis.aiAnalysisResult = await getAnalysisResult(documentId);
  } catch (error) {
    console.error('Failed to analyze document:', error);
  }

  // Hide WebViewer loading spinner
  WebViewer.getInstance().UI.closeElements('loadingModal');
}

export { analyzeDocumentForPII };
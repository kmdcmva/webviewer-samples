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
        pageCount: globalThis.loadedDocument?.pageCount ?? 0
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error sending document text to server:', error);
    throw error;
  }
}

// Analyze the loaded document text for personal information identification (PII)
const analyzeDocument = async () => {
  try {
    const response = await fetch('/api/analyze-pii', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
const getAnalysisResult = async () => {
  try {
    const response = await fetch('/api/get-results', {
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
  try {
    // Show WebViewer loading spinner
    WebViewer.getInstance().UI.openElements('loadingModal');

    // Step 1: Send document text to server
    let response = await sendTextToServer();
    if (!response.success) {
      alert(response.error);
      return false;
    }

    // Step 2: Analyze document for PII
    response = await analyzeDocument();
    if (!response.success)
      return false;

    // Step 3: Get analysis result from server
    globalThis.aiAnalysisResult = await getAnalysisResult();
    if (!globalThis.aiAnalysisResult.success) {
      alert('No PII result found.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to analyze document:', error);
    return false;
  }
  finally {
    // Hide WebViewer loading spinner
    WebViewer.getInstance().UI.closeElements('loadingModal');
  }
}

export { analyzeDocumentForPII };
function removeLeadingNumbering(text) {
  const pattern = /^\s*(?:(?:\d+|[IVXLCDM]+)[)\-–—]*|[•*·\-–—])\s*/i;
  return text.replace(pattern, '');
}

// Function to create redaction annotations from AI analysis results
const applyRedactions = async () => {
  const { documentViewer, Search, annotationManager, Annotations } = WebViewer.getInstance().Core;

  // Ensure the user has permissions to create/edit/delete annotations
  annotationManager.promoteUserToAdmin();

  // Parse the analysis to extract PII entities
  let piiEntities = [];
  try {
    // Extract entities from the analysis (assuming format from AI response)
    const lines = globalThis.aiAnalysisResult.analysis.split('\n');
    lines.forEach(line => {
      if (line.trim() !== '')
        piiEntities.push(line.trim());
    });
  } catch (error) {
    console.error('Error parsing analysis result:', error);
    return;
  }

  if (piiEntities.length === 0)
    return;

  // Configure the search modes
  const modes = [
    Search.Mode.PAGE_STOP,
    Search.Mode.HIGHLIGHT,
    Search.Mode.CASE_SENSITIVE,
    Search.Mode.WHOLE_WORD
  ];
  const searchMode = modes.reduce((combinedModes, mode) => combinedModes | mode, 0);

  // Search for PII entities then create redactions
  let searchOptions = null;
  for (const piiEntity of piiEntities) {
    
    const classifiedPIIEntity = piiEntity.split(":").map(part => part.trim());
    const classification = removeLeadingNumbering(classifiedPIIEntity[0]);
    const pii = classifiedPIIEntity[1];

    await new Promise((resolve) => {
      searchOptions = {
        // search the entire document
        fullSearch: true,
        // called when search is complete
        onDocumentEnd: () => {
          resolve();
        },
        // called when a search result is found
        onResult: (result) => {
          if (result.resultCode === Search.ResultCode.FOUND) {
            // Get the page number and the quads for the search result
            const { pageNum, quads } = result;

            // Create a new redaction annotation using the quads and page number
            const redactAnnot = new Annotations.RedactionAnnotation({
              PageNumber: pageNum,
              Quads: quads.map((quad) => quad.getPoints())
            });

            redactAnnot.Author = "AI Redaction";
            redactAnnot.setContents(classification);
            redactAnnot.setCustomData('trn-annot-preview', documentViewer.getSelectedText(redactAnnot.PageNumber));

            // Apply and redraw the redaction annotation
            annotationManager.addAnnotations([redactAnnot]);
            annotationManager.drawAnnotationsFromList([redactAnnot]);
          }
        },
      };

      documentViewer.textSearchInit(pii, searchMode, searchOptions);
    });
  }
};

export { applyRedactions };
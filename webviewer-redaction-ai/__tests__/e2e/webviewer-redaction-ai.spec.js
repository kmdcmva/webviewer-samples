// This file contains end-to-end tests for the AI PII redaction tool in WebViewer.
// It uses Playwright for testing the UI interactions and validating the functionality
// of the AI PII redaction tool.

import { test, expect } from '@playwright/test';
import { MOCK_DATA, registerApiRouteMocks } from '../../__mocks__/webviewer-redaction-ai.mock.js';

const normalizeMultilineText = (value) =>
  (value || '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line !== '')
    .join('\n');

// Validating that the AI PII redaction tool button exists in the DOM.
test('Validate AI PII redaction tool button exists in DOM', async ({ page }) => {
  // Go to the app page (adjust the URL if needed)
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Locate the AIPIIRedactionToolButton button in ModularHeader
  let component = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();
});

// Applying AI PII redaction with mocked endpoint responses.
test('Perform AI PII redaction', async ({ page }) => {
  const mockCalls = await registerApiRouteMocks(page);

  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Ensure full document text is loaded before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  // Trigger analyzeDocumentForPII + applyRedactions through the UI button.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await pIIBtn.click();

  // Verify mocked endpoint workflow for send -> analyze -> get result.
  await expect.poll(() => mockCalls.sendText).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(1);
  await expect.poll(() => mockCalls.getResults).toBe(1);
  await expect.poll(() => normalizeMultilineText(mockCalls.sendTextPayload?.documentText)).toBe(
    normalizeMultilineText(MOCK_DATA.documentText)
  );
  await expect.poll(() => mockCalls.analyzePIIPayload?.documentId).toBe(MOCK_DATA.documentId);

  // Complete the redaction flow and assert it closes cleanly.
  const redactAllBtn = page.locator('button[data-element="redactAllMarkedButton"]');
  await expect(redactAllBtn).toBeVisible();
  await redactAllBtn.click();

  // Confirm the apply redaction modal and ensure it disappears after confirming.
  const applyRedactionBtn = page.locator('button[data-element="WarningModalSignButton"]');
  await expect(applyRedactionBtn).toBeVisible();
  await applyRedactionBtn.click();
  await expect(applyRedactionBtn).toBeHidden();

  // Ensure mocked analysis text is the value used by the UI workflow.
  await expect.poll(() => page.evaluate(() => globalThis.aiAnalysisResult?.analysis)).toBe(MOCK_DATA.analysisText);
});

// Validate server-side in-memory lifecycle.
// This test assumes analyzing a document twice.
// The first analysis should succeed.
// The second should fail with a 404 error,
// indicating that the raw document was released from memory after the first analysis.
test('In-memory store releases raw document after analysis', async ({ request }) => {

  // First analysis that should succeed.
  const documentText = 'Customer Jane Doe\nEmail jane.doe@example.com\nPhone 123-456-7890';

  const sendTextResponse = await request.post('/api/send-text', {
    data: { documentText }
  });

  expect(sendTextResponse.ok()).toBeTruthy();
  const sendTextBody = await sendTextResponse.json();
  expect(sendTextBody.success).toBe(true);
  expect(sendTextBody.textLength).toBe(documentText.length);
  expect(typeof sendTextBody.documentId).toBe('string');
  expect(sendTextBody.documentId.length).toBeGreaterThan(0);

  const { documentId } = sendTextBody;

  const analyzeResponse = await request.post('/api/analyze-pii', {
    data: { documentId }
  });
  
  expect(analyzeResponse.ok()).toBeTruthy();
  const analyzeBody = await analyzeResponse.json();
  expect(analyzeBody.success).toBe(true);
  expect(analyzeBody.documentId).toBe(documentId);
  
  const resultsResponse = await request.get(`/api/get-results/${documentId}`);
  expect(resultsResponse.ok()).toBeTruthy();
  const resultsBody = await resultsResponse.json();
  expect(resultsBody.success).toBe(true);
  expect(resultsBody.documentId).toBe(documentId);
  expect(typeof resultsBody.analysis).toBe('string');


  // Second analysis that should fail with 404, confirming the document was released from memory.
  const analyzeAgainResponse = await request.post('/api/analyze-pii', {
    data: { documentId }
  });

  expect(analyzeAgainResponse.status()).toBe(404);
  const analyzeAgainBody = await analyzeAgainResponse.json();
  expect(analyzeAgainBody.success).toBe(false);
  expect(analyzeAgainBody.error).toBe('Document not found');
});
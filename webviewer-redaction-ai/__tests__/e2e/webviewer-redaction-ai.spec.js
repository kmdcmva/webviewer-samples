// This file contains end-to-end tests for the AI PII redaction tool in WebViewer.
// It uses Playwright for testing the UI interactions and validating the functionality
// of the AI PII redaction tool.

import { test, expect } from '@playwright/test';
import { MOCK_DATA, registerApiRouteMocks } from '../../__mocks__/webviewer-redaction-ai.mock.js';

let mockCalls = null;

// Before each test, we set up the API route mocks to intercept and
// simulate backend responses for the AI PII redaction workflow.
// This allows us to test the UI interactions and logic without
// relying on actual backend services.
test.beforeEach(async ({ page }) => {
  mockCalls = await registerApiRouteMocks(page);
});

const normalizeMultilineText = (value) =>
  (value || '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line !== '')
    .join('\n');

// Validating that the AI PII redaction tool button exists in the DOM.
test('PII redaction tool button visibility', async ({ page }) => {
  // Go to the app page (adjust the URL if needed)
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Locate the AIPIIRedactionToolButton button in ModularHeader
  let component = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();
});

// Test the AI panel is rendering the expected results after clicking
// the AI PII redaction tool button and completing the mocked workflow.
test('AI Panel renders the expected results', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Ensure full document text is loaded before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  // Ensure full document text length/size is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text.length || 0)
  ).toBeLessThanOrEqual(30000);

  // Ensure page count is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.pageCount || 0)
  ).toBeLessThanOrEqual(20);

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

  // Assert that the AI Panel is visible after clicking the button and completing the mocked workflow.
  const panel = page.locator('div.ModularPanel[data-element="aiPanel"]');
  await panel.waitFor({ state: 'visible' });
  await expect(panel).toBeVisible();
});

// Applying AI PII redaction with mocked endpoint responses.
test('Perform AI PII redaction for document text size and page count within limits', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Ensure full document text is loaded before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text || '')
  ).toContain('Peady, Eff, & Wright Exporting');

  // Ensure full document text length/size is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.text.length || 0)
  ).toBeLessThanOrEqual(30000);

  // Ensure page count is within limits before triggering analysis requests.
  await expect.poll(
    () => page.evaluate(() => globalThis.loadedDocument?.pageCount || 0)
  ).toBeLessThanOrEqual(20);

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

// Expect an alert when analysis completes but /api/get-results returns no PII findings.
test('Expect an alert when loaded document has no identifiable PII', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Wait until document wrapper is initialized before replacing the loaded text.
  await expect.poll(() => page.evaluate(() => Boolean(globalThis.loadedDocument))).toBe(true);

  const noPIIText = 'Quarterly operations summary for warehouse inventory and packaging materials.';
  await page.evaluate((text) => {
    globalThis.loadedDocument.text = text;
    globalThis.loadedDocument.pageCount = 1;
  }, noPIIText);

  let getResultsCalls = 0;
  await page.unroute('**/api/get-results');
  await page.route('**/api/get-results', async (route) => {
    getResultsCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'No analysis results found.'
      })
    });
  });

  // Trigger analyzeDocumentForPII through the UI button and verify the alert content.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  const alertPromise = page.waitForEvent('dialog');
  await pIIBtn.click();
  const alertDialog = await alertPromise;
  expect(alertDialog.message()).toBe('No PII result found.');
  await alertDialog.accept();

  // Ensure the no-PII document text was submitted and the flow reached /api/get-results.
  await expect.poll(() => mockCalls.sendText).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(1);
  await expect.poll(() => getResultsCalls).toBe(1);
  await expect.poll(() => normalizeMultilineText(mockCalls.sendTextPayload?.documentText)).toBe(noPIIText);
});

// Expect an alert when document text/pages values exceed limits.
test('Expect an alert when document text exceeds 30000 characters with page count above 20', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the Redact tab to activate the Redact toolbar group.
  await page.locator('button[data-element="toolbarGroup-Redact"]').click();

  // Wait until document wrapper is initialized before mutating fields.
  await expect.poll(() => page.evaluate(() => Boolean(globalThis.loadedDocument))).toBe(true);

  await page.evaluate(() => {
    globalThis.loadedDocument.text = 'A'.repeat(30001);
    globalThis.loadedDocument.pageCount = 21;
  });

  let sendTextCalls = 0;
  await page.unroute('**/api/send-text');
  await page.route('**/api/send-text', async (route) => {
    sendTextCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'Document text size exceeds 30000 characters limit.'
      })
    });
  });

  // Trigger analyzeDocumentForPII through the UI button and verify the alert content.
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  const alertPromise = page.waitForEvent('dialog');
  await pIIBtn.click();
  const alertDialog = await alertPromise;
  expect(alertDialog.message()).toBe('Document text size exceeds 30000 characters limit.');
  await alertDialog.accept();

  // Ensure request flow stops at /api/send-text when request validation fails.
  await expect.poll(() => sendTextCalls).toBe(1);
  await expect.poll(() => mockCalls.analyzePII).toBe(0);
  await expect.poll(() => mockCalls.getResults).toBe(0);
});
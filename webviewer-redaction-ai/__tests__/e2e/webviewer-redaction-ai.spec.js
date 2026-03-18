// This file contains end-to-end tests for the AI PII redaction tool in WebViewer.
// It uses Playwright for testing the UI interactions and validating the functionality
// of the AI PII redaction tool.

import { test, expect } from '@playwright/test';

// Validating that the AI PII redaction tool button exists in the DOM.
test('Validate AI PII redaction tool button exists in DOM', async ({ page }) => {
  // Go to the app page (adjust the URL if needed)
  await page.goto('/client/index.html');

  // Locate the AIPIIRedactionToolButton button in ModularHeader
  let component = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();
});

// Applying AI PII redaction to the document and validating the workflow of the tool.
test('Perform AI PII redaction', async ({ page }) => {
  await page.goto('/client/index.html');

  // Click the PII button to start identifying PII in the document
  const pIIBtn = page.locator('button[data-element="AIPIIRedactionToolButton"]');
  await pIIBtn.click();

  // Click Redact All once AI marks are available.
  const redactAllBtn = page.locator('button[data-element="redactAllMarkedButton"]');
  await expect(redactAllBtn).toBeVisible();
  await redactAllBtn.click();

  // Confirm redaction once the warning modal's apply button is available.
  const applyRedactionBtn = page.locator('button[data-element="WarningModalSignButton"]');
  await expect(applyRedactionBtn).toBeVisible();
  await applyRedactionBtn.click();

  // Wait deterministically for the warning/apply button to disappear,
  // indicating that the redaction confirmation flow has completed.
  await expect(applyRedactionBtn).toBeHidden();
});
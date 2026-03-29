// This file contains end-to-end tests for the WebViewer Ask AI sample application,
// using the Playwright testing framework.

import { test, expect } from '@playwright/test';
import { registerApiChatMock } from '../../__mocks__/webviewer-ask-ai.mock.js';
const timeout = 30000;

test.beforeEach(async ({ page }) => {
  await registerApiChatMock(page);
});

// Validate the existence of the chatbot toggle button in the DOM.
test('Chatbot toggle button exists in DOM', async ({ page }) => {
  // Go to the app page
  await page.goto('/client/index.html');

  // Locate the askWebSDKPanelToggle button of ModularHeader in DOM
  const toggle = page.locator('button[data-element="askWebSDKPanelToggle"]');
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toBeVisible();
});

// Validate the existence of the chatbot panel in the DOM.
test('Chatbot panel exists in DOM', async ({ page }) => {
  // Go to the app page
  await page.goto('/client/index.html');

  const panel = page.locator('div.ModularPanel[data-element="askWebSDKPanel"]');
  await expect(panel).toHaveCount(1, { timeout: timeout });
  await expect(panel).toBeVisible({ timeout: timeout });
});

// Validate the existence of the summarizing selection button in the DOM.
test('Summarizing selection button exists in DOM', async ({ page }) => {
  // Go to the app page
  await page.goto('/client/index.html');

  // Wait until WebViewer is fully initialized and a document is loaded.
  await page.waitForFunction(() => {
    const instance = globalThis.WebViewer?.getInstance?.();
    if (!instance?.Core?.documentViewer)
      return false;

    return !!instance.Core.documentViewer.getDocument();
  }, { timeout: timeout });

  // Locate the askWebSDKButton button in the TextPopup
  await page.evaluate((pageNumber) => {
    const instance = globalThis.WebViewer.getInstance();
    const core = instance.Core;
    const UI = instance.UI;
    const documentViewer = core.documentViewer;
    const textSelectTool = documentViewer.getTool(core.Tools.ToolNames.TEXT_SELECT);
    documentViewer.setCurrentPage(pageNumber);
    UI.setToolMode(core.Tools.ToolNames.TEXT_SELECT);
    textSelectTool.select({ pageNumber: pageNumber, x: 56.69320848, y: 32.40185332 }, { pageNumber: pageNumber, x: 105.11567193, y: 40.06439572 });
    UI.openElements(['textPopup']);
  }, 2);

  const popupButton = page.locator('button[data-element="askWebSDKButton"]');
  await expect(popupButton).toHaveCount(1);
  await expect(popupButton).toBeVisible({ timeout: timeout });
});
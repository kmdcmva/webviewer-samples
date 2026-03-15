// This file contains end-to-end tests for the WebViewer Ask AI sample application,
// using the Playwright testing framework.

import { test, expect } from '@playwright/test';

// Validate the existence of key components in the DOM,
// such as the chatbot panel and its toggle button,
// as well as the askWebSDKButton in the text selection popup.
test('Components existence validation in DOM', async ({ page }) => {
  // Go to the app page (adjust the URL if needed)
  await page.goto('/client/index.html');

  // Locate the askWebSDKPanelToggle button in ModularHeader
  let component = page.locator('#viewer apryse-webviewer #app .App nav .ModularHeader .ModularHeaderItems .ToggleElementButton button[data-element="askWebSDKPanelToggle"]');
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();

  // Wait for 5 seconds to ensure the app is fully loaded
  await page.waitForTimeout(5000);

  // Locate the askWebSDKPanel panel in ModularPanel
  component = page.locator('#viewer apryse-webviewer #app .App .content div.ModularPanel[data-element="askWebSDKPanel"]');
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();

  // Locate the askWebSDKButton button in the TextPopup
  await page.evaluate((pageNumber) => {
    const core = WebViewer.getInstance().Core;
    const UI = WebViewer.getInstance().UI;
    const documentViewer = core.documentViewer;
    const textSelectTool = documentViewer.getTool(core.Tools.ToolNames.TEXT_SELECT);
    documentViewer.setCurrentPage(pageNumber);
    UI.setToolMode(core.Tools.ToolNames.TEXT_SELECT);
    textSelectTool.select({ pageNumber: pageNumber, x: 56.69320848, y: 32.4018533200001 }, { pageNumber: pageNumber, x: 105.11567196000001, y: 40.06439572000011 });
    setTimeout(() => {
      UI.openElements(['textPopup']);
    }, 1000);
  }, 2);

  component = page.locator('#viewer apryse-webviewer #app .App .Popup.TextPopup .container button[data-element="askWebSDKButton"]');
  await expect(component).toHaveCount(1);
  await expect(component).toBeVisible();
});

// Simulates user asking free question within the chatbot interface
test('Ask free question', async ({ page }) => {
  await askQuestion(page);
});

// Simulates user selecting text on the document and asking the chatbot to summarize it
test('Summarize selected text', async ({ page }) => {
  // Go to the app page (adjust the URL if needed)
  await page.goto('/client/index.html');

  // Wait for 10 seconds to ensure the app is fully loaded
  await page.waitForTimeout(10000);

  // Select text on the document programmatically, to be summarized
  await page.evaluate((pageNumber) => {
    const core = WebViewer.getInstance().Core;
    const UI = WebViewer.getInstance().UI;
    const documentViewer = core.documentViewer;
    const textSelectTool = documentViewer.getTool(core.Tools.ToolNames.TEXT_SELECT);
    documentViewer.setCurrentPage(pageNumber);
    UI.setToolMode(core.Tools.ToolNames.TEXT_SELECT);
    // The coordinates used here are based on the PDF document used in this sample.
    textSelectTool.select({ pageNumber: pageNumber, x: 179.72459999999998, y: 536.4002 }, { pageNumber: pageNumber, x: 141.165, y: 415.9352 });
    setTimeout(() => {
      UI.openElements(['textPopup']);
    }, 1000);

    const items = UI.textPopup.getItems();
    const askWebSDKButton = items.find(item => item.dataElement === 'askWebSDKButton');
    askWebSDKButton?.onClick();
  }, 6);

  // Wait for 2 seconds before finishing
  // the test to capture the AI response
  await page.waitForTimeout(2000);
});

// Simulates user toggling the visibility of the chatbot panel
test('Hide/Show chatbot panel', async ({ page }) => {
  await askQuestion(page);

  // Click the toggle button to hide the chatbot panel
  const toggleBtn = page.locator('#viewer apryse-webviewer #app .App nav .ModularHeader .ModularHeaderItems .ToggleElementButton button[data-element="askWebSDKPanelToggle"]');
  await toggleBtn.click();

  // Wait for 1 second between interactions
  // to ensure the UI has updated
  await page.waitForTimeout(1000);

  // Click the toggle button again to show the chatbot panel
  await toggleBtn.click();
});

const askQuestion = async (page) => {
  // Go to the app page (adjust the URL if needed)
  await page.goto('/client/index.html');
  // Ask question via input field
  await page.fill('#askWebSDKQuestionInput', 'What social responsibility initiatives did Rosneft undertake in 2011?');
  // Hit Enter to send the question
  await page.press('#askWebSDKQuestionInput', 'Enter');
  // Wait for 1 second before finishing
  // the test to capture the AI response
  await page.waitForTimeout(1000);
};
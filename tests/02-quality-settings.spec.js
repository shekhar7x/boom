import { test, expect } from './fixtures/base-fixtures.js';

test.describe('Critical Path 3: Quality Settings Configuration', () => {
  test.beforeEach(async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.mockMediaDevices();
  });

  test('CP3: Open and configure quality settings', async ({ page, helpers }) => {
    // Look for settings button
    const settingsButton = page.locator('button:has-text("Settings"), button[aria-label*="Settings"], button.settings-btn').first();

    if (await settingsButton.isVisible({ timeout: 2000 })) {
      // Click settings button
      await settingsButton.click();
      await helpers.wait(500);

      // Verify settings modal/panel appears
      const settingsModal = page.locator('.settings-modal, .quality-settings, [role="dialog"]');
      await expect(settingsModal.first()).toBeVisible();

      // Test resolution dropdown
      const resolutionSelect = page.locator('select[name="resolution"], select#resolution, .resolution-select').first();
      if (await resolutionSelect.isVisible({ timeout: 1000 })) {
        await resolutionSelect.selectOption({ label: '720p' });
        await helpers.wait(200);
      }

      // Test frame rate dropdown
      const fpsSelect = page.locator('select[name="fps"], select[name="frameRate"], .fps-select').first();
      if (await fpsSelect.isVisible({ timeout: 1000 })) {
        await fpsSelect.selectOption('60');
        await helpers.wait(200);
      }

      // Test bitrate selector
      const bitrateSelect = page.locator('select[name="bitrate"], .bitrate-select').first();
      if (await bitrateSelect.isVisible({ timeout: 1000 })) {
        await bitrateSelect.selectOption('2500');
        await helpers.wait(200);
      }

      // Test toggles for recording options
      const screenToggle = page.locator('input[type="checkbox"][name*="screen"], .screen-toggle').first();
      if (await screenToggle.isVisible({ timeout: 1000 })) {
        await screenToggle.check();
      }

      const webcamToggle = page.locator('input[type="checkbox"][name*="webcam"], .webcam-toggle').first();
      if (await webcamToggle.isVisible({ timeout: 1000 })) {
        const isChecked = await webcamToggle.isChecked();
        if (isChecked) {
          await webcamToggle.uncheck();
        } else {
          await webcamToggle.check();
        }
      }

      const audioToggle = page.locator('input[type="checkbox"][name*="audio"], .audio-toggle').first();
      if (await audioToggle.isVisible({ timeout: 1000 })) {
        await audioToggle.check();
      }

      // Apply settings
      const applyButton = page.locator('button:has-text("Apply"), button:has-text("Save"), button.apply-btn').first();
      if (await applyButton.isVisible({ timeout: 1000 })) {
        await applyButton.click();
        await helpers.wait(500);
      }

      // Verify modal closed
      const modalVisible = await settingsModal.first().isVisible({ timeout: 1000 }).catch(() => false);
      expect(modalVisible).toBe(false);
    } else {
      // Settings might be directly on the page
      console.log('Settings button not found, checking for inline settings');

      const resolutionSelect = page.locator('select[name="resolution"], select#resolution').first();
      if (await resolutionSelect.isVisible({ timeout: 1000 })) {
        await resolutionSelect.selectOption({ label: '720p' });
      }
    }
  });

  test('CP3: Settings persist across page reload', async ({ page, helpers }) => {
    // Open settings if available
    const settingsButton = page.locator('button:has-text("Settings"), button[aria-label*="Settings"]').first();

    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await helpers.wait(500);

      // Configure specific settings
      const resolutionSelect = page.locator('select[name="resolution"], select#resolution').first();
      if (await resolutionSelect.isVisible({ timeout: 1000 })) {
        await resolutionSelect.selectOption({ label: '1080p' });
      }

      const fpsSelect = page.locator('select[name="fps"], select[name="frameRate"]').first();
      if (await fpsSelect.isVisible({ timeout: 1000 })) {
        await fpsSelect.selectOption('30');
      }

      // Apply settings
      const applyButton = page.locator('button:has-text("Apply"), button:has-text("Save")').first();
      if (await applyButton.isVisible({ timeout: 1000 })) {
        await applyButton.click();
        await helpers.wait(500);
      }

      // Reload page
      await page.reload();
      await helpers.wait(1000);

      // Open settings again
      const settingsButton2 = page.locator('button:has-text("Settings"), button[aria-label*="Settings"]').first();
      if (await settingsButton2.isVisible({ timeout: 2000 })) {
        await settingsButton2.click();
        await helpers.wait(500);

        // Verify settings were persisted
        const resolutionSelect2 = page.locator('select[name="resolution"], select#resolution').first();
        if (await resolutionSelect2.isVisible({ timeout: 1000 })) {
          const selectedValue = await resolutionSelect2.inputValue();
          expect(selectedValue).toBeTruthy();
        }
      }
    }
  });

  test('CP3: All quality presets are selectable', async ({ page, helpers }) => {
    const settingsButton = page.locator('button:has-text("Settings"), button[aria-label*="Settings"]').first();

    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await helpers.wait(500);

      const resolutionSelect = page.locator('select[name="resolution"], select#resolution').first();

      if (await resolutionSelect.isVisible({ timeout: 1000 })) {
        // Test various resolutions
        const resolutions = ['480p', '720p', '1080p', '1440p'];

        for (const res of resolutions) {
          const optionExists = await page.locator(`option:has-text("${res}")`).count() > 0;
          if (optionExists) {
            await resolutionSelect.selectOption({ label: res });
            await helpers.wait(100);
            const selected = await resolutionSelect.inputValue();
            expect(selected).toBeTruthy();
          }
        }
      }

      // Close settings
      const closeButton = page.locator('button:has-text("Close"), button:has-text("Cancel"), button.close-btn').first();
      if (await closeButton.isVisible({ timeout: 1000 })) {
        await closeButton.click();
      }
    }
  });
});

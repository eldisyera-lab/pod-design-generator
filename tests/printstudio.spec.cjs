const { test, expect } = require('@playwright/test');

test('editor loads, image selection exposes resize controls, and corner drag scales', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await expect(page.locator('#canvas')).toBeVisible();
  await expect(page.locator('#addText')).toBeVisible();
  await page.locator('#addText').click();
  await expect(page.locator('#selectionTools')).toBeVisible();
  await expect(page.locator('#canvasScale')).toBeVisible();

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7XcAAAAASUVORK5CYII=', 'base64');
  await page.locator('#imageInput').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: png });
  await expect.poll(() => page.locator('#selectionLabel').textContent()).toContain('Elemento');
  const scale = page.locator('#canvasScale');
  const before = Number(await scale.inputValue());
  const canvas = page.locator('#canvas');
  const rect = await canvas.boundingBox();
  const handle = await page.evaluate(() => {
    const c = document.getElementById('canvas');
    const ctx = c.getContext('2d');
    const selected = window.__printStudioTestSelected;
    return { width: c.width, height: c.height };
  });
  // The uploaded square image is centered and rendered at 500x500 design pixels.
  const startX = rect.x + rect.width * (700 / handle.width);
  const startY = rect.y + rect.height * (290 / handle.height);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + rect.width * (45 / handle.width), startY - rect.height * (45 / handle.height), { steps: 6 });
  await page.mouse.up();
  const after = Number(await scale.inputValue());
  expect(after).toBeGreaterThan(before);
  expect(pageErrors).toEqual([]);
});

test('transparent print artwork excludes the artboard background and preserves canvas ratio', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    document.getElementById('addShape').click();
    const art = window.createPrintTextureCanvas();
    const ctx = art.getContext('2d');
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    return { width: art.width, height: art.height, alphaAtCorner: pixel[3], ratio: art.width / art.height, expected: 900 / document.getElementById('canvas').height };
  });
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
  expect(result.alphaAtCorner).toBe(0);
  expect(Math.abs(result.ratio - result.expected)).toBeLessThan(0.01);
});

const { test, expect } = require('@playwright/test');

test('editor loads and resize controls work', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await expect(page.locator('#canvas')).toBeVisible();
  await page.locator('#addText').click();
  await expect(page.locator('#selectionTools')).toBeVisible();
  await expect(page.locator('#canvasScale')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('transparent print artwork excludes the artboard background and preserves canvas ratio', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    document.getElementById('addShape').click();
    const art = window.createPrintTextureCanvas();
    const pixel = art.getContext('2d').getImageData(0, 0, 1, 1).data;
    return { width: art.width, height: art.height, alphaAtCorner: pixel[3], ratio: art.width / art.height, expected: 900 / document.getElementById('canvas').height };
  });
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
  expect(result.alphaAtCorner).toBe(0);
  expect(Math.abs(result.ratio - result.expected)).toBeLessThan(0.01);
});


test('3D print size follows the artwork scale on the 2D canvas', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    document.getElementById('addShape').click();
    const large = window.createPrintTextureCanvas().printScale;
    document.getElementById('canvasScale').value = '0.5';
    document.getElementById('canvasScale').dispatchEvent(new Event('input', { bubbles: true }));
    const small = window.createPrintTextureCanvas().printScale;
    return { large, small };
  });
  expect(result.large).toBeGreaterThan(0);
  expect(result.small).toBeLessThan(result.large);
  expect(result.small / result.large).toBeCloseTo(0.5, 1);
});

test('3D viewer module actually initializes a WebGL canvas and reports ready', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const viewer = page.locator('#threePreview');
  await expect(viewer).toBeVisible();
  await expect.poll(async () => viewer.locator('canvas').count(), { timeout: 10000 }).toBe(1);
  await expect(page.locator('#threeStatus')).toContainText('Visor listo');
  for (const selector of ['#modelFile', '#updatePrintBtn', '#clearPrintsBtn', '#reset3d', '#materialSelect', '#garmentColor', '#printSize']) {
    await expect(page.locator(selector)).toBeVisible();
  }
  expect(pageErrors).toEqual([]);
  expect(consoleErrors.filter(message => /WebGL|module|failed to load/i.test(message))).toEqual([]);
});

test('3D viewer and controls remain visible at desktop, tablet and mobile widths', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  for (const width of [1440, 1001, 900, 821, 820, 600]) {
    await page.setViewportSize({ width, height: 900 });
    const panel = page.locator('aside.right');
    const viewer = page.locator('#threePreview');
    await expect(panel).toBeVisible();
    await expect(viewer).toBeVisible();
    for (const selector of ['#modelFile', '#updatePrintBtn', '#clearPrintsBtn', '#reset3d', '#materialSelect', '#garmentColor', '#printSize']) {
      await expect(page.locator(selector)).toBeVisible();
    }
    const dimensions = await viewer.boundingBox();
    expect(dimensions.width).toBeGreaterThan(150);
    expect(dimensions.height).toBeGreaterThan(200);
    const workspace = await page.locator('main.workspace').boundingBox();
    if (width > 820) expect(dimensions.x).toBeGreaterThan(workspace.x + workspace.width - 1);
    else expect(dimensions.y).toBeGreaterThan(workspace.y + workspace.height - 1);
  }
});

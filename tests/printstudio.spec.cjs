const { test, expect } = require('@playwright/test');

test('PrintStudio loads the 2D editor and the new product simulator without the retired GLB viewer', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await expect(page.locator('#canvas')).toBeAttached();
  await expect(page.locator('#productPreviewCanvas')).toBeVisible();
  await expect(page.locator('#viewTab3d')).toContainText('Vista del producto');
  await expect(page.locator('#viewTab2d')).toContainText('Diseño 2D');
  await expect(page.locator('#threePreview')).toHaveCount(0);
  await expect(page.locator('#modelFile')).toHaveCount(0);
  await page.locator('#addText').click();
  await expect(page.locator('#selectionTools')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('product catalog is separate from square, portrait, landscape and custom canvas formats', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const productOptions = await page.locator('#product option').allTextContents();
  expect(productOptions.join(' ')).not.toContain('Diseño cuadrado');
  expect(productOptions.join(' ')).toContain('Funda para móvil');
  const formats = await page.locator('#canvasFormat option').allTextContents();
  expect(formats.join(' ')).toContain('Cuadrado');
  expect(formats.join(' ')).toContain('Horizontal');
  expect(formats.join(' ')).toContain('Personalizado');

  await page.locator('#canvasFormat').selectOption('square');
  await expect(page.locator('#dimensions')).toContainText('3000 × 3000');
  await expect.poll(() => page.locator('#canvas').evaluate(el => el.height)).toBe(900);

  await page.locator('#canvasFormat').selectOption('landscape');
  await expect(page.locator('#dimensions')).toContainText('4500 × 3000');
  await expect.poll(() => page.locator('#canvas').evaluate(el => el.height)).toBe(600);

  await page.locator('#canvasFormat').selectOption('custom');
  await page.locator('#customWidth').fill('2400');
  await page.locator('#customHeight').fill('3600');
  await page.locator('#customHeight').dispatchEvent('change');
  await expect(page.locator('#dimensions')).toContainText('2400 × 3600');
  await expect.poll(() => page.locator('#canvas').evaluate(el => el.height)).toBe(1350);
});

test('changing product preserves the 2D composition and displays each product preview', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#addShape').click();
  await page.locator('#addText').click();
  const before = await page.evaluate(() => ({
    count: window.document.querySelector('#selectionLabel').textContent,
    itemCount: window.document.querySelector('#canvas').toDataURL().length
  }));
  for (const product of ['shirt', 'hoodie', 'mug', 'tote', 'phone-case']) {
    await page.locator('#product').selectOption(product);
    await expect(page.locator('#productPreviewCanvas')).toBeVisible();
    await expect(page.locator('#selectionLabel')).toContainText('Elemento');
    if (product === 'phone-case') {
      await expect(page.locator('#phoneCaseOptions')).toBeVisible();
      await expect(page.locator('#productPreviewStatus')).toContainText('genérica');
    }
  }
  const after = await page.evaluate(() => ({
    count: window.document.querySelector('#selectionLabel').textContent,
    itemCount: window.document.querySelector('#canvas').toDataURL().length
  }));
  expect(after.count).toBe(before.count);
  expect(after.itemCount).toBe(before.itemCount);
  expect(pageErrors).toEqual([]);
});

test('transparent artwork preserves the full canvas ratio and has no beige or white artboard background', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    document.getElementById('addShape').click();
    const art = window.createPrintTextureCanvas();
    const pixel = art.getContext('2d').getImageData(0, 0, 1, 1).data;
    return {
      width: art.width,
      height: art.height,
      alphaAtCorner: pixel[3],
      ratio: art.width / art.height,
      expected: 900 / document.getElementById('canvas').height
    };
  });
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
  expect(result.alphaAtCorner).toBe(0);
  expect(Math.abs(result.ratio - result.expected)).toBeLessThan(0.01);
});

test('product simulator keeps artwork proportional when product color changes', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#addShape').click();
  await page.locator('#addText').click();
  for (const product of ['shirt', 'hoodie', 'mug', 'tote', 'phone-case']) {
    await page.locator('#product').selectOption(product);
    await page.locator('#productColor').fill('#cc3344');
    await expect(page.locator('#productPreviewCanvas')).toBeVisible();
    await expect(page.locator('#productPreviewStatus')).not.toContainText('Error');
  }
  expect(pageErrors).toEqual([]);
});

test('PNG export uses the selected canvas format dimensions', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#canvasFormat').selectOption('square');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('3000x3000');
});

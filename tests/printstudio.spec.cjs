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


function makeTestGlb() {
  const positions = new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,1,0]);
  const normals = new Float32Array([0,0,1, 0,0,1, 0,0,1, 0,0,1]);
  const indices = new Uint16Array([0,1,2, 0,2,3]);
  const binary = Buffer.alloc(108);
  Buffer.from(positions.buffer).copy(binary, 0);
  Buffer.from(normals.buffer).copy(binary, 48);
  Buffer.from(indices.buffer).copy(binary, 96);
  const gltf = {
    asset: { version: '2.0', generator: 'PrintStudio test fixture' },
    scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: 'Body' }],
    meshes: [{ name: 'Body', primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
    materials: [{ name: 'Skin', pbrMetallicRoughness: { baseColorFactor: [0.9, 0.9, 0.9, 1] } }],
    buffers: [{ byteLength: 108 }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 48, target: 34962 },
      { buffer: 0, byteOffset: 48, byteLength: 48, target: 34962 },
      { buffer: 0, byteOffset: 96, byteLength: 12, target: 34963 }
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [-1,-1,0], max: [1,1,0] },
      { bufferView: 1, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: 6, type: 'SCALAR' }
    ]
  };
  const json = Buffer.from(JSON.stringify(gltf));
  const jsonLength = Math.ceil(json.length / 4) * 4;
  const totalLength = 12 + 8 + jsonLength + 8 + binary.length;
  const glb = Buffer.alloc(totalLength);
  glb.writeUInt32LE(0x46546c67, 0);
  glb.writeUInt32LE(2, 4);
  glb.writeUInt32LE(totalLength, 8);
  glb.writeUInt32LE(jsonLength, 12);
  glb.writeUInt32LE(0x4e4f534a, 16);
  json.copy(glb, 20);
  glb.fill(0x20, 20 + json.length, 20 + jsonLength);
  const binHeader = 20 + jsonLength;
  glb.writeUInt32LE(binary.length, binHeader);
  glb.writeUInt32LE(0x004e4942, binHeader + 4);
  binary.copy(glb, binHeader + 8);
  return glb;
}

test('a second click repositions the 3D print instead of stacking another copy', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#modelFile').setInputFiles({
    name: 'flat-test-surface.glb',
    mimeType: 'model/gltf-binary',
    buffer: makeTestGlb()
  });
  await expect(page.locator('#threeStatus')).toContainText('Modelo cargado', { timeout: 10000 });
  await expect(page.locator('#materialSelect')).toContainText('Cuerpo · Piel');
  await page.locator('#languageSelect').selectOption('en');
  await expect(page.locator('#materialSelect')).toContainText('Body · Skin');
  await page.locator('#languageSelect').selectOption('es');
  const viewerCanvas = page.locator('#threePreview canvas');
  await expect(viewerCanvas).toBeVisible();
  const rect = await viewerCanvas.boundingBox();
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await expect(page.locator('#threeStatus')).toContainText('Estampado colocado', { timeout: 5000 });
  await page.mouse.click(rect.x + rect.width / 2 + 12, rect.y + rect.height / 2);
  await expect(page.locator('#threeStatus')).toContainText('Estampado reposicionado: se sustituyó la colocación anterior.', { timeout: 5000 });
});


test('Spanish and English selector translates the 2D editor, 3D viewer and remembers the choice', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const language = page.locator('#languageSelect');
  await expect(language).toHaveValue('es');
  await expect(page.locator('#addText')).toContainText('Añadir texto');
  await expect(page.locator('#threeStatus')).toContainText('Visor listo');

  await language.selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#addText')).toContainText('Add text');
  await expect(page.locator('#saveBtn')).toContainText('Save project');
  await expect(page.locator('#product option[value="mug"]')).toHaveText('Mug / jug');
  await expect(page.locator('#threeStatus')).toContainText('Viewer ready');

  await page.locator('#removeBgBtn').click();
  await expect(page.locator('#status')).toHaveText('Select an image on the canvas first.');
  await language.selectOption('es');
  await expect(page.locator('#status')).toHaveText('Selecciona primero una imagen del lienzo.');
  await expect(page.locator('#threeStatus')).toContainText('Visor listo');

  await language.selectOption('en');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#languageSelect')).toHaveValue('en');
  await expect(page.locator('#addText')).toContainText('Add text');
  await expect(page.locator('#threeStatus')).toContainText('Viewer ready');
});


test('3D placement and reposition messages follow the selected English language', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#languageSelect').selectOption('en');
  await page.locator('#modelFile').setInputFiles({
    name: 'flat-test-surface.glb', mimeType: 'model/gltf-binary', buffer: makeTestGlb()
  });
  await expect(page.locator('#threeStatus')).toContainText('Model loaded', { timeout: 10000 });
  const rect = await page.locator('#threePreview canvas').boundingBox();
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await expect(page.locator('#threeStatus')).toHaveText('Print placed with transparent artwork, without the canvas background.');
  await page.mouse.click(rect.x + rect.width / 2 + 12, rect.y + rect.height / 2);
  await expect(page.locator('#threeStatus')).toHaveText('Print repositioned: the previous placement was replaced.');
});

test('curved text controls render on the canvas and persist in saved projects', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#addText').click();
  await expect(page.locator('#textCurveControls')).toBeVisible();
  await page.locator('#textValue').fill('CROCHET PARA APRENDER');
  await page.locator('#textCurve').selectOption('arc-up');
  await page.locator('#curveAmount').fill('72');
  await page.locator('#curveOrientation').selectOption('inside');
  const result = await page.evaluate(() => {
    const art = window.createPrintTextureCanvas();
    const pixels = art.getContext('2d').getImageData(0, 0, art.width, art.height).data;
    let visible = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) visible++;
    return { visible, stored: document.getElementById('textCurve').value };
  });
  expect(result.visible).toBeGreaterThan(100);
  expect(result.stored).toBe('arc-up');
  await page.locator('#saveBtn').click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('printstudio-project')).items[0].curve)).toBe('arc-up');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('printstudio-project')).items[0]);
  expect(saved.curveAmount).toBeCloseTo(0.72, 2);
  expect(saved.curveOrientation).toBe('inside');
});

test('curved text controls are translated in English and restore Spanish', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#addText').click();
  await page.locator('#languageSelect').selectOption('en');
  await expect(page.locator('#textCurveControls')).toContainText('Text curvature');
  await expect(page.locator('#textCurve option[value="arc-up"]')).toHaveText('Upper arc');
  await page.locator('#languageSelect').selectOption('es');
  await expect(page.locator('#textCurveControls')).toContainText('Curvatura del texto');
  await expect(page.locator('#textCurve option[value="arc-down"]')).toHaveText('Arco inferior');
});

test('upper arc, lower arc and circular text all render artwork', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#addText').click();
  await page.locator('#textValue').fill('TEJER CON AMOR');
  for (const mode of ['arc-up', 'arc-down', 'circle']) {
    await page.locator('#textCurve').selectOption(mode);
    const result = await page.evaluate(() => {
      const art = window.createPrintTextureCanvas();
      const pixels = art.getContext('2d').getImageData(0, 0, art.width, art.height).data;
      let visible = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) visible++;
      return { visible, width: art.width, height: art.height };
    });
    expect(result.visible).toBeGreaterThan(100);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  }
});

test('3D model library stores GLB files persistently and reloads them', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#modelFile').setInputFiles({
    name: 'library-flat-test.glb', mimeType: 'model/gltf-binary', buffer: makeTestGlb()
  });
  await expect(page.locator('#threeStatus')).toContainText('Modelo cargado', { timeout: 10000 });
  await page.locator('#libraryModelName').fill('Mi superficie de prueba');
  await page.locator('#libraryCategory').selectOption('shirts');
  await page.locator('#saveModelToLibrary').click();
  await expect(page.locator('#modelLibraryList')).toContainText('Mi superficie de prueba');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#modelLibraryList')).toContainText('Mi superficie de prueba');
  await page.locator('#modelLibraryList').getByRole('button', { name: 'Cargar' }).click();
  await expect(page.locator('#threeStatus')).toContainText('Modelo cargado', { timeout: 10000 });
});

test('project save explains the native editable format and open workflow', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#saveBtn').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('printstudio-proyecto.printstudio');
  await expect(page.locator('#status')).toContainText('Archivo .printstudio descargado');
  await expect(page.locator('#saveBtn')).toHaveAttribute('title', /Abrir proyecto/);
});

test('GLB material names Body and Skin translate both ways in the material selector', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.locator('#modelFile').setInputFiles({
    name: 'named-materials.glb', mimeType: 'model/gltf-binary', buffer: makeTestGlb()
  });
  await expect(page.locator('#threeStatus')).toContainText('Modelo cargado', { timeout: 10000 });
  await expect(page.locator('#materialSelect')).toContainText('Cuerpo · Piel');
  await page.locator('#languageSelect').selectOption('en');
  await expect(page.locator('#materialSelect')).toContainText('Body · Skin');
  await page.locator('#languageSelect').selectOption('es');
  await expect(page.locator('#materialSelect')).toContainText('Cuerpo · Piel');
});


test('GLB material localization handles the real character and garment naming patterns', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const spanish = await page.evaluate(() => ['Cloth_hoodie','Cloth_briefs','Hair_short02','Eyebrows','Eyelashes','Eyes','Teeth','Tongue'].map(name => [name, window.printStudioTranslateMaterial(name)]));
  expect(Object.fromEntries(spanish)).toMatchObject({
    Cloth_hoodie: 'Tejido_Sudadera con capucha',
    Cloth_briefs: 'Tejido_Ropa interior',
    Hair_short02: 'Pelo_Corto02',
    Eyebrows: 'Cejas',
    Eyelashes: 'Pestañas',
    Eyes: 'Ojos',
    Teeth: 'Dientes',
    Tongue: 'Lengua'
  });
  await page.locator('#languageSelect').selectOption('en');
  const english = await page.evaluate(() => ['Cuerpo','Piel','Sudadera con capucha','Ropa interior'].map(name => [name, window.printStudioTranslateMaterial(name)]));
  expect(Object.fromEntries(english)).toMatchObject({
    Cuerpo: 'Body',
    Piel: 'Skin',
    'Sudadera con capucha': 'Hoodie',
    'Ropa interior': 'Briefs'
  });
});

test('shared GLB materials are isolated per mesh before independent recoloring', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    const shared = { color: { value: '#336699' } };
    const clone = material => ({ ...material, color: { ...material.color } });
    const meshes = [{ name: 'Cloth_hoodie', material: shared }, { name: 'Body', material: shared }];
    const isolated = meshes.map(mesh => ({ ...mesh, material: clone(mesh.material) }));
    isolated[0].material.color.value = '#ff0000';
    return {
      independent: isolated[0].material !== isolated[1].material,
      hoodie: isolated[0].material.color.value,
      body: isolated[1].material.color.value
    };
  });
  expect(result).toEqual({ independent: true, hoodie: '#ff0000', body: '#336699' });
});

test('saving a loaded GLB gives visible progress and confirmation in the library panel', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await expect(page.locator('#libraryStatus')).toContainText('Carga un modelo GLB');
  await page.locator('#saveModelToLibrary').click();
  await expect(page.locator('#libraryStatus')).toContainText('Carga primero un modelo GLB.');
  await page.locator('#modelFile').setInputFiles({
    name: 'visible-library-save.glb', mimeType: 'model/gltf-binary', buffer: makeTestGlb()
  });
  await expect(page.locator('#threeStatus')).toContainText('Modelo cargado', { timeout: 10000 });
  await page.locator('#libraryModelName').fill('Modelo guardado visible');
  await page.locator('#saveModelToLibrary').click();
  await expect(page.locator('#libraryStatus')).toContainText('Modelo guardado en Mi biblioteca 3D.', { timeout: 10000 });
  await expect(page.locator('#modelLibraryList')).toContainText('Modelo guardado visible');
});

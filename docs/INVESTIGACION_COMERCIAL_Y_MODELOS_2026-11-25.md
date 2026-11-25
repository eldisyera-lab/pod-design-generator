# Investigación comercial y selección de modelos — PrintStudio

Fecha: 25 de noviembre de 2026  
Rama: `studio-profesional-v1`  
Estado: investigación preliminar. Ningún modelo está aprobado para producción.

## 1. Señales comerciales del nicho crochet/tejido

Etsy publicó dos informes oficiales relevantes:
- [Seller Trend Report: Spring and Summer 2026](https://www.etsy.com/seller-handbook/article/1473931456647), 17-03-2026: Etsy informó un aumento interanual del 36 % en ventas de ropa de crochet. Los datos del informe se cortan al 10-02-2026 y se basan en actividad de usuarios estadounidenses con sesión iniciada.
- [Seller Trend Report: Fall and Winter 2026](https://www.etsy.com/seller-handbook/article/seller-trend-report-fall-and-winter-2026/1521255894814), 14-10-2026: Etsy informó un aumento del 230 % en búsquedas de artículos tejidos a mano, dentro de la tendencia Mark of the Maker. No es una cifra de ventas de camisetas POD.
- [Marketplace Insights](https://help.etsy.com/hc/es/articles/35122361353239--C%C3%B3mo-puedo-utilizar-la-herramienta-Marketplace-Insights-de-Etsy) permite revisar búsquedas, cantidad de anuncios y términos relacionados de los últimos 30 días; Etsy indica hasta 15 consultas gratuitas semanales.

Interpretación: existe una señal de interés por crochet y artesanía, pero no prueba automáticamente demanda rentable para camisetas impresas. La primera colección debe dirigirse a la identidad de la comunidad tejedora: orgullo por tejer, humor compartido, regalos para crocheteras/os y amor por los ovillos y ganchillos. No presentar una camiseta impresa como prenda tejida a mano. Para el mercado estadounidense conviene investigar términos ingleses y revisar marcas registradas y propiedad intelectual.

### Primera tanda de consultas en Marketplace Insights
`crochet shirt`, `crochet t shirt`, `crochet sweatshirt`, `crochet hoodie`, `crochet lover shirt`, `funny crochet shirt`, `gift for crocheter`, `crochet gifts`, `crocheter gift`, `yarn lover shirt`, `crochet mom shirt`, `crochet club shirt`, `crochet tote bag`, `crochet mug`, `crochet addict shirt`.

Registrar búsquedas y anuncios, revisar sugerencias de cola larga y abrir una muestra de resultados para identificar qué productos se venden realmente. No escoger términos solo por volumen bruto.

## 2. Candidatos de modelos 3D para camiseta

| Modelo / fuente | Datos publicados | Licencia / limitaciones | Decisión preliminar |
|---|---|---|---|
| [Men Regular Apparel Fit Sporty T-Shirt — BINARYCLOTH / Sketchfab](https://sketchfab.com/3d-models/men-regular-apparel-fit-sporty-t-shirt-4d055bb8c1e04549a4b2dac7b27ebb2c) | Ficha anuncia GLB 2K de 4,44 MB y 4K de 20,4 MB; UV desplegados, un material, mapas base color/ORM/normal, aprox. 29,7k triángulos. | La ficha original indica CC Attribution y descarga; el binario aún no se ha descargado ni inspeccionado. La ficha duplicada de Fab no especifica claramente licencia y no debe usarse para acreditar derechos. | Candidato técnico principal, pendiente de obtener GLB, atribuir al autor y revisar malla, UV, mapas y color. |
| [T-Shirt Low Poly — JC4862 / Sketchfab](https://sketchfab.com/3d-models/t-shirt-low-poly-3e4b13a502884acfbd79cee0f9cd8876) | La ficha declara UV unwrap y texturas; aprox. 61,1k triángulos. | CC Attribution según ficha; GLB y binario no verificados. | Alternativa secundaria. |
| [Free T-Shirt — CGTrader](https://www.cgtrader.com/free-3d-models/character/clothing/free-t-shirt-d43e9bd6-3d88-473c-8c8e-2ac9fba9c267) | GLTF anunciado de 28 MB, 305.635 polígonos, UV “Mixed”. | La ficha anuncia Royalty Free, uso comercial gratuito. Archivo no inspeccionado. | No priorizar: peso y complejidad elevados, UV mixtos. |
| [T-Shirt — Grab3D](https://grab3d.com/models/props/t-shirt/) | GLB 1,2 MB, 20.609 triángulos, texturas PBR 2K. | CC0 según [licencia Grab3D](https://grab3d.com/license/); el binario no se recuperó en esta revisión. | No es camiseta vestible única: es composición flat-lay con prendas/elementos. Útil para escena estática, no como modelo principal. |
| [Folded t shirt — 3DAssets.dev](https://3dassets.dev/assets/clothing-rail-and-wardrobe-tshirt-folded-a3a7c296) | GLB 20,9 KB, 518 triángulos, dos materiales; [GLB directo](https://cdn.3dassets.dev/assets/35435/v1/model.glb). | CC0 1.0 según ficha. | Camiseta doblada; no sirve para probar impresión en una camiseta extendida. |
| [ClozDesign Crewneck](https://www.cloz-design.com/3d-models/t-shirt-mockup/crewneck-straight-cut-short-sleeve-t-shirt-3d-model-b42a1ab90447) | Ficha anuncia GLB de vista previa, SVG UV y zonas frontal/trasera/hombros. | Plan gratuito no permite descargar/exportar GLB; exportación indicada en plan Pro. Revisar términos antes de contratar. | Referencia de flujo, no activo libre incorporable ahora. |

**Decisión:** no incorporar ni aprobar todavía ningún modelo. Descargar primero el GLB BINARYCLOTH desde la ficha original, documentar autor/licencia/atribución y comprobar UV, escala, costuras, materiales, textura albedo y estampado en PrintStudio. Si falla, descartarlo sin parches específicos.

## 3. Diagnóstico técnico del repositorio

- Rama revisada: `studio-profesional-v1`, cabeza `562dfcdc0a599cfcc3479d516088eed19dd1ffe6`.
- `main` se mantiene separada; no se han realizado escrituras en ella.
- La ejecución de GitHub Actions asociada a esa cabeza terminó en success: [run 45390744150](https://github.com/eldisyera-lab/pod-design-generator/actions/runs/45390744150).
- La suite contiene 18 pruebas Playwright. Su fixture GLB es un plano de dos triángulos; por tanto, las pruebas verdes no certifican una camiseta real.
- En `preview3d.js`, la recoloración cambia `material.color` conservando `material.map`. El color del material se combina con el mapa base; si la textura ya contiene azul, seleccionar otro color no elimina necesariamente ese azul. Esto concuerda con el problema observado en el modelo masculino.
- El diagnóstico anterior de `character_male_baked.glb`: 9 mallas, 11 materiales y 10 texturas. `Cloth_hoodie` es una sola malla/material con azul integrado en su textura. No aprobar como modelo maestro.
- `createPrintTextureCanvas()` compone objetos sin pintar el fondo visual del artboard. Pero un PNG/JPG subido con un rectángulo beige opaco seguirá estampando ese beige: forma parte de la imagen, no del fondo del lienzo.
- El control `#canvasScale` es un deslizador para cambiar la escala del elemento seleccionado. La prueba comprueba que aparece al añadir texto; no comprueba un botón independiente para cambiar dimensiones físicas del lienzo/área de impresión.
- El selector usa `shirt` y el catálogo usa `tshirt`; las medidas 4500 × 5400 px a 300 DPI son genéricas, no una plantilla certificada de proveedor.

## 4. Secuencia obligatoria

1. Precisar y probar el control de dimensiones del lienzo, diferenciándolo de la escala del objeto.
2. Obtener e inspeccionar el GLB real de camiseta BINARYCLOTH; registrar licencia, autor, UV, materiales y texturas.
3. Corregir el color de tejido con una prueba reproducible del GLB real, preservando pliegues y textura sin contaminar el estampado.
4. Validar estampado frontal/trasero y límites de costuras, mangas y cuello.
5. Elegir proveedor y variante concreta; incorporar su plantilla real, sangrado, zona segura, perfil de color y exportación.
6. Probar guardado/reapertura, cambio de color, posición/tamaño, exportación y revisión visual desde varias vistas.

No ampliar a sudaderas, tazas ni bolsas hasta que la camiseta supere esos pasos.

## 5. Regla de aceptación

Una camiseta solo se considerará funcional cuando exista: modelo descargado y licencia/atribución documentadas; UV y materiales inspeccionados; recoloración fiel; estampado sin deformación; plantilla 2D de proveedor y variante identificadas; exportación verificada; proyecto reabrible; pruebas con el GLB real y revisión visual humana. Hasta entonces el estado es “en desarrollo”.

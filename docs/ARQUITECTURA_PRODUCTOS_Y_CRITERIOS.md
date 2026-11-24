# PrintStudio — Arquitectura de productos y criterios de aceptación

Estado: documento de arquitectura inicial  
Rama de trabajo: `studio-profesional-v1`  
Objetivo: producir archivos de impresión y presentaciones comerciales fiables para proveedores POD y tiendas como Etsy.

## 1. Decisiones que no se deben volver a discutir en cada modelo

1. El editor 2D, el motor de exportación y el visor 3D son subsistemas distintos.
2. Las dimensiones de impresión, sangrados y zonas seguras proceden de una plantilla de proveedor y de una variante concreta. Una medida genérica nunca se anunciará como plantilla certificada.
3. La maqueta 3D es una representación de presentación. El archivo de producción se genera desde la plantilla 2D validada del proveedor; no se extrae de una captura ni de una textura de la maqueta.
4. No todos los productos utilizan el mismo mapeado. La proyección tipo decal puede utilizarse en áreas locales adecuadas, pero no se considerará válida por defecto para impresión envolvente, fundas, costuras, paneles o superficies con recortes.
5. Los modelos 3D y las texturas se incorporan únicamente después de verificar licencia, atribución, UV, geometría, materiales, resolución y comportamiento visual.
6. No se modifica `main`. Los cambios se desarrollan y prueban en `studio-profesional-v1`.

## 2. Arquitectura objetivo

### A. Editor 2D
- Objetos editables: texto, imágenes, formas y capas.
- Transparencia real y control de orden, posición, escala y rotación.
- Guardado y recuperación de proyectos sin perder objetos ni imágenes.
- Composición exportable en las dimensiones exactas de la plantilla seleccionada.
- El lienzo de diseño no debe confundirse con el área física de impresión: las guías, sangrados y zonas seguras se muestran como ayudas y no se imprimen.

### B. Motor de producción
Cada exportación se resuelve a partir de un perfil de producto versionado:
- ancho y alto en píxeles;
- resolución objetivo y unidad física;
- perfil/espacio de color solicitado por el proveedor;
- sangrado, zona segura y áreas no imprimibles;
- una o varias zonas de impresión;
- reglas de transparencia y formato;
- referencia, fecha y versión de la plantilla del proveedor.

El motor debe validar dimensiones, resolución, contenido fuera de zona, transparencia y exportación. Debe advertir cuando falte información del proveedor, en lugar de inventar medidas.

### C. Motor 3D
- Carga GLB/GLTF y conserva materiales y texturas originales.
- Aísla materiales por instancia sin destruir texturas compartidas.
- Diferencia entre conservar textura, aplicar un tinte y sustituir un color de tejido. Un simple cambio de `material.color` multiplica el color por la textura existente y no equivale a recolorear una prenda de forma fiel.
- Soporta zonas de impresión identificadas por producto.
- Usa proyección local solo donde sea apropiada; usa texturas UV/atlas para envolventes y superficies complejas.
- Permite varias zonas de impresión independientes cuando el producto lo requiere.
- Libera geometrías, materiales y texturas al cambiar de modelo.

### D. Registro de modelos y perfiles
Cada modelo aprobado debe tener una ficha con:
- familia y variante;
- archivo y versión;
- autor, fuente, URL y licencia;
- atribución requerida;
- unidades y escala;
- lista de mallas/materiales relevantes;
- UV disponibles y resolución de texturas;
- zonas imprimibles y técnica de mapeado;
- colores permitidos y máscaras, si existen;
- pruebas visuales aprobadas.

## 3. Decisión sobre character_male_baked.glb / Dionysus

El archivo inspeccionado contiene 9 mallas, 11 materiales y 10 imágenes/texturas. La sudadera aparece como una única malla (`Cloth_hoodie`) con un material (`Cloth_hoodie`), con textura integrada y factor de color azul. No ofrece piezas separadas para cuerpo, mangas, capucha y puños.

El visor actual clona los materiales y después aplica `material.color`. Eso aísla instancias, pero no neutraliza los colores ya contenidos en `material.map`. La prueba automatizada actual de aislamiento usa objetos JavaScript simulados y no verifica el comportamiento real de Three.js ni el GLB del usuario.

**Decisión:** no aprobar este archivo como modelo maestro de ropa ni seguir añadiendo excepciones para hacerlo encajar. Se conserva como fixture de diagnóstico, sin considerarlo un activo de producción. Solo podrá reconsiderarse si supera todos los criterios de aceptación con cambios acotados y sin comprometer el motor común.

## 4. Catálogo objetivo: diez familias

Este catálogo es una cartera priorizada de producto, no una promesa de ventas ni un ranking permanente de Etsy. Cada entrada requiere una plantilla de proveedor y un activo visual aprobados.

| Prioridad de incorporación | Familia | Requisitos de producción y maqueta |
|---|---|---|
| 1 | Camisetas | Frontal/espalda y, si el proveedor lo permite, mangas; variantes de color/talla; zonas y guías propias. |
| 2 | Sudaderas y hoodies | Frontal/espalda/mangas; tejido y ribetes diferenciados cuando la malla lo permita; recoloración fiel. |
| 3 | Tazas y jarras | Plantilla envolvente del proveedor; asa y márgenes excluidos; mapeado UV, no decal plano como solución general. |
| 4 | Bolsas tote | Panel frontal/trasero según proveedor; asas y costuras protegidas; panel de impresión identificado. |
| 5 | Fundas para móviles | Perfil por modelo exacto de teléfono y proveedor; recorte de cámara, botones, bordes y zona segura; nunca una plantilla universal. |
| 6 | Gorras y sombreros | Paneles imprimibles o bordables; curvatura y costuras; distinguir impresión de simulación de bordado. |
| 7 | Tumblers y botellas | Plantilla envolvente con diámetro/altura específicos; asas, tapas y áreas no imprimibles. |
| 8 | Cojines | Frontal/reverso, variantes cuadradas y rectangulares; costuras, margen y sangrado. |
| 9 | Pegatinas | Troquel/contorno de corte, sangrado, transparencia, hojas y packs; exportación 2D, sin exigir 3D. |
| 10 | Adornos y decoración estacional | Plantillas por forma y proveedor; orificios, bordes, reverso y temporadas; exportación 2D o maqueta específica. |

## 5. Criterios de aceptación obligatorios

Un producto no se marca como listo hasta cumplir todos los puntos aplicables:

### Archivo de producción
- Se genera con las dimensiones exactas de la plantilla versionada.
- El tamaño físico y los píxeles son coherentes con la resolución exigida.
- La transparencia se conserva donde corresponde.
- Sangrado y zona segura están identificados y validados.
- No hay elementos involuntariamente recortados, deformados o fuera de zona.
- Se puede reabrir el proyecto y reproducir la exportación.

### Maqueta
- El modelo tiene licencia comercial compatible y atribución documentada.
- La geometría, escala, UV y materiales son adecuados.
- El estampado respeta curvatura, límites, recortes, costuras y zonas no imprimibles.
- El color de prenda se comporta correctamente con y sin textura.
- Se inspeccionan frontal, trasera, laterales y acercamientos relevantes.
- La maqueta no se presenta como prueba de producción certificada.

### Automatización
- Prueba unitaria del perfil y de las dimensiones.
- Prueba de navegador para selección, edición y exportación.
- Prueba de carga del GLB real aprobado, no solo de un plano ficticio.
- Evidencia visual revisada por una persona antes de aprobar el modelo.
- Ningún fallo de consola o de carga de recursos.

## 6. Orden de ejecución

### Fase 1 — Consolidar y proteger la base
- Mantener el editor 2D y los proyectos existentes.
- Documentar contratos de perfiles y modelos.
- Corregir el tratamiento de materiales/texturas solo después de una prueba reproducible con un GLB real.
- Separar la exportación de producción de la representación 3D.

### Fase 2 — Producto de referencia de ropa
- Seleccionar un modelo de camiseta y otro de hoodie con licencia y UV comprobados.
- Probar materiales, color, impresión y exportación.
- No avanzar si los resultados no superan los criterios.

### Fase 3 — Primer catálogo
- Camiseta, hoodie, taza, tote y funda de móvil.
- No incorporar diez productos a la vez: cada familia entra con plantilla y pruebas propias.

### Fase 4 — Ampliación
- Gorras, tumblers, cojines, pegatinas y adornos.
- Los productos 2D no necesitan forzarse dentro del visor 3D.

### Fase 5 — Preparación de tienda
- Imágenes de presentación, variantes, borradores de títulos/descripciones y lista de control de publicación.
- Cálculo de margen solo con costes y comisiones reales introducidos por el usuario.

## 7. Regla de alcance

No se añadirá un producto por tener un botón o una maqueta de muestra. Se añade cuando exista:
1. plantilla de proveedor identificada;
2. modelo o presentación con licencia documentada;
3. técnica de impresión correcta;
4. exportación validada;
5. pruebas técnicas y revisión visual aprobadas.

Si un modelo falla por defectos estructurales, UV o licencia, se sustituye. No se acumulan parches específicos que debiliten el motor común.

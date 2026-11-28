# PrintStudio — POD Design Lab

## Inicio recomendado en Windows
1. Descomprime el ZIP completo en una carpeta nueva.
2. Necesitas Python 3 instalado.
3. Haz doble clic en **Iniciar PrintStudio.bat**.
4. Se abrirá Chrome o tu navegador predeterminado en la dirección local que indique la ventana negra.
5. Mantén abierta esa ventana mientras trabajas. Para cerrar el servidor, pulsa Ctrl+C y luego cierra la ventana.

**Importante:** no abras `index.html` con doble clic. El simulador y sus módulos JavaScript necesitan servirse desde el servidor local.

El lanzador busca automáticamente un puerto libre entre 8765 y 8795. Si una instancia antigua sigue ocupando 8765, selecciona otro puerto y muestra la carpeta exacta que está sirviendo. Así se evita que el navegador abra accidentalmente una copia antigua de PrintStudio.

## Características
- Aplicación local, sin cuentas, backend, APIs ni suscripciones.
- Editor visual con texto, formas e imágenes.
- Movimiento por arrastre, colores, tipografías, escala y capas.
- Fondo transparente opcional.
- Exportación PNG y guardado local del proyecto. El botón Guardar proyecto descarga un archivo editable .printstudio (datos JSON); no es una imagen ni un documento para abrir con Word. Para recuperarlo, inicia PrintStudio y pulsa Abrir proyecto, seleccionando ese archivo.
- Simulador frontal de referencia para camiseta, hoodie, taza, tote y funda genérica de móvil. No es un visor 3D ni una maqueta certificada de proveedor.
- Selector de producto separado del formato del lienzo: vertical, cuadrado, horizontal y personalizado.
- La funda de móvil es únicamente una vista genérica de concepto; todavía no permite producir archivos para modelos específicos.

Las dimensiones son plantillas genéricas iniciales, no perfiles certificados de proveedores. Antes de imprimir o vender, comprueba medidas, sangrados, zonas seguras y perfiles de color exigidos por cada proveedor POD.

## Estado del simulador de producto

El simulador frontal actual es una ayuda visual de diseño. Se ha separado el producto del formato del lienzo y se ha conservado la composición completa al mostrarla. Las formas dibujadas son prototipos visuales: no deben presentarse como mockups fotográficos, modelos 3D ni perfiles de impresión listos para vender. En particular, una funda de móvil requiere seleccionar el modelo exacto y asociar una plantilla de proveedor verificada antes de exportar para producción.

## Arquitectura y catálogo POD

- [Arquitectura de productos y criterios de aceptación](docs/ARQUITECTURA_PRODUCTOS_Y_CRITERIOS.md): separación entre editor 2D, motor de producción, visor 3D y reglas para aprobar modelos comerciales.
- [Catálogo inicial de diez familias POD](assets/products/catalog.json): catálogo de planificación. Las plantillas y dimensiones de proveedor permanecen pendientes de verificación; no son todavía perfiles de producción certificados.

**Regla de calidad:** ningún producto se considera listo para vender hasta validar la plantilla del proveedor, el archivo exportado y la maqueta del modelo real.

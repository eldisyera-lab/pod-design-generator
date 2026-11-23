# PrintStudio — POD Design Lab

## Inicio recomendado en Windows
1. Descomprime el ZIP completo en una carpeta nueva.
2. Necesitas Python 3 instalado.
3. Haz doble clic en **Iniciar PrintStudio.bat**.
4. Se abrirá Chrome o tu navegador predeterminado en la dirección local que indique la ventana negra.
5. Mantén abierta esa ventana mientras trabajas. Para cerrar el servidor, pulsa Ctrl+C y luego cierra la ventana.

**Importante:** no abras `index.html` con doble clic. El visor 3D usa módulos JavaScript y necesita servirse desde un servidor local.

El lanzador busca automáticamente un puerto libre entre 8765 y 8795. Si una instancia antigua sigue ocupando 8765, selecciona otro puerto y muestra la carpeta exacta que está sirviendo. Así se evita que el navegador abra accidentalmente una copia antigua de PrintStudio.

## Características
- Aplicación local, sin cuentas, backend, APIs ni suscripciones.
- Editor visual con texto, formas e imágenes.
- Movimiento por arrastre, colores, tipografías, escala y capas.
- Fondo transparente opcional.
- Exportación PNG y guardado local del proyecto.
- Visor 3D basado en Three.js; carga modelos GLB locales.

Las dimensiones son plantillas genéricas iniciales, no perfiles certificados de proveedores. Antes de imprimir o vender, comprueba medidas, sangrados, zonas seguras y perfiles de color exigidos por cada proveedor POD.

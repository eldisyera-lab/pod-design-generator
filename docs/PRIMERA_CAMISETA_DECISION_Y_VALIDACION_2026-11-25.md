# Primera camiseta PrintStudio — decisión de activo y protocolo de validación

Fecha: 25 de noviembre de 2026  
Rama autorizada: `studio-profesional-v1`

## Decisión de producto

Se elige como primera prenda una **camiseta masculina básica de corte clásico**, de manga corta y superficie lisa, usando como candidato inicial el modelo de BINARYCLOTH en Sketchfab:

https://sketchfab.com/3d-models/men-regular-apparel-fit-sporty-t-shirt-4d055bb8c1e04549a4b2dac7b27ebb2c

La ficha pública consultada indica:
- Autor: BINARYCLOTH.
- Modelo: Men Regular Apparel Fit Sporty T-Shirt, versión V1.0.
- GLB 2K: 4,44 MB; GLB 4K: 20,4 MB.
- 29,7k triángulos; 15,8k vértices.
- UV completamente desplegados.
- Un material.
- Mapas Base Color, ORM y Normal.
- Unidades GLB en metros.
- Licencia Creative Commons Attribution (CC BY), que requiere atribución.

Fuente de confirmación: ficha original de Sketchfab consultada el 25-11-2026. La página devuelve 403 al intentar abrirla desde el entorno de investigación, por lo que no se ha podido completar la descarga automatizada. El resultado de búsqueda sí muestra la opción pública “Download 3D Model” y las especificaciones anteriores.

**No se ha descargado ni inspeccionado el binario.** No incluir todavía el modelo en el repositorio ni declarar que el activo está aprobado. La atribución exacta y la versión de licencia deben volver a comprobarse en la pantalla de descarga antes de cualquier distribución comercial.

## Paso necesario para obtener el archivo

1. Abrir la ficha original de Sketchfab con la cuenta del usuario.
2. Pulsar “Download 3D Model”.
3. Elegir GLB de 2K (4,44 MB) para la primera prueba; conservar también el nombre original del archivo y la información de atribución que muestra Sketchfab.
4. No convertirlo ni volver a exportarlo antes de la inspección inicial.
5. Entregar el archivo GLB original para poder probarlo en PrintStudio.

No utilizar la ficha duplicada de Fab para acreditar licencia: la ficha allí consultada no muestra términos de licencia especificados.

## Protocolo de aceptación del GLB

Registrar antes de modificar código:
- SHA-256 del archivo, tamaño y nombre original.
- Escena, nodos, mallas y conteo de triángulos/vértices.
- Materiales y asignación por malla.
- Texturas y dimensiones: Base Color, Normal y ORM.
- Presencia de color azul/beige horneado en Base Color.
- UV: rango, solapamientos y correspondencia de paneles frontal/trasero/mangas.
- Orientación, escala en metros, centro y dimensiones de bounding box.
- Prueba de carga en el visor, rotación y captura de vistas frontal/trasera.

## Pruebas de recoloración y estampado

El GLB declara un solo material. La implementación actual cambia `material.color` y conserva `material.map`; por tanto, hay que comparar:
1. render original;
2. blanco, negro, beige y azul cambiando solo color;
3. misma prueba usando una estrategia de tintado que conserve la textura de tejido y los pliegues;
4. arte con transparencia real y arte con fondo opaco para comprobar que no se confunden;
5. estampado en pecho frontal y espalda, observando deformación, escala, recorte y zonas fuera de la prenda.

No aceptar el modelo si el tinte destruye el tejido, conserva manchas del color original, o si el estampado se proyecta sobre costuras/mangas o se deforma de manera comercialmente inaceptable.

## Alcance de esta fase

No se modifica todavía el motor de renderizado. No se incorporan modelos ficticios ni planos de prueba como evidencia de camiseta funcional. No se amplía a otros productos. La siguiente intervención de código se define después de inspeccionar el GLB real y reproducir con él los fallos actuales.

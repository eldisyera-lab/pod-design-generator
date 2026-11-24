(() => {
  const translations = {
    "PrintStudio — Estudio de diseño POD":"PrintStudio — POD Design Studio",
    "Guardar proyecto":"Save project","Abrir proyecto":"Open project","Exportar PNG":"Export PNG",
    "Producto":"Product","Formato de impresión":"Print format",
    "Camiseta / sudadera":"T-shirt / sweatshirt","Pulóver / hoodie":"Pullover / hoodie",
    "Taza / jarra":"Mug / jug","Bolsa / tote bag":"Bag / tote bag","Diseño cuadrado":"Square design",
    "Elementos":"Elements","＋ Añadir texto":"＋ Add text","＋ Añadir forma":"＋ Add shape",
    "＋ Subir imagen":"＋ Upload image","Consejo: utiliza imágenes propias o recursos con licencia comercial.":"Tip: use your own images or resources with a commercial license.",
    "Quitar fondo":"Remove background","Selecciona una imagen del lienzo y elimina fondos lisos conectados a sus bordes.":"Select an image on the canvas to remove a solid background connected to its edges.",
    "Sensibilidad":"Tolerance","Restaurar":"Restore","Procesamiento local. Los resultados dependen del contraste y del fondo original.":"Processed locally. Results depend on contrast and the original background.",
    "Fondo":"Background","Color":"Color","Transparente":"Transparent","Activar":"Enable",
    "Proyecto":"Project","Limpiar lienzo":"Clear canvas","La aplicación funciona localmente en tu navegador. Tus diseños no se envían a ningún servidor.":"The app runs locally in your browser. Your designs are not sent to any server.",
    "LIENZO DE DISEÑO":"DESIGN CANVAS","Ningún elemento seleccionado":"No element selected",
    "Elemento ":"Element "," de ":" of ","Tamaño del elemento seleccionado":"Selected element size",
    "Reducir o ampliar elemento":"Resize selected element",
    "Selecciona y arrastra los elementos para colocarlos · Usa el panel derecho para editarlos":"Select and drag elements to position them · Use the right panel to edit them",
    "Visor 3D de modelos reales":"3D model viewer","Modelo 3D (.GLB)":"3D model (.GLB)",
    "Actualizar estampado":"Update print","Eliminar estampados":"Remove prints","Restablecer vista":"Reset view",
    "Pieza / material":"Part / material","Todos los materiales":"All materials","Color del material":"Material color",
    "Tamaño del estampado":"Print size","Carga un modelo GLB para iniciar la vista.":"Load a GLB model to start the viewer.",
    "El estampado se coloca haciendo clic sobre la superficie del modelo. Se recomienda GLB con texturas integradas.":"Place the print by clicking the model surface. GLB files with embedded textures are recommended.",
    "Editar elemento":"Edit element","Texto":"Text","Selecciona un texto para editarlo":"Select text to edit it",
    "Tipografía":"Font","Tamaño":"Size","Escala del elemento":"Element scale",
    "Arrastra cualquiera de las cuatro esquinas del marco para cambiar el tamaño sin deformar la imagen.":"Drag any of the four frame corners to resize without distorting the image.",
    "Negrita":"Bold","Eliminar":"Delete","Color rápido":"Quick colors","Capas":"Layers",
    "Enviar atrás":"Send backward","Traer delante":"Bring forward",
    "Imagen cargada.":"Image loaded.","Selecciona primero una imagen del lienzo.":"Select an image on the canvas first.",
    "Selecciona primero una imagen.":"Select an image first.","Imagen original restaurada.":"Original image restored.",
    "Preparando el archivo del proyecto…":"Preparing project file…",
    "Proyecto guardado. Se descargó un archivo que conserva textos, formas e imágenes.":"Project saved. A file preserving text, shapes and images was downloaded.",
    "No se pudo guardar el proyecto: ":"Could not save project: ",
    "El archivo no contiene un proyecto válido":"The file does not contain a valid project",
    "Abriendo proyecto…":"Opening project…",
    "Proyecto abierto correctamente, incluidas sus imágenes.":"Project opened successfully, including its images.",
    "No se pudo abrir el proyecto: ":"Could not open project: ",
    "No se pudo crear el PNG.":"Could not create PNG.",
    "PNG exportado: ":"PNG exported: ",
    "Error al exportar: ":"Export error: ",
    "Haz clic sobre la superficie del producto.":"Click on the product surface.",
    "No se pudo determinar la superficie. Prueba otra zona del modelo.":"Could not determine the surface. Try another area of the model.",
    "No se pudo proyectar en esa zona. Prueba una superficie más plana.":"Could not project onto that area. Try a flatter surface.",
    "No se pudo proyectar en esa superficie. Prueba otra zona del modelo.":"Could not project onto that surface. Try another area of the model.",
    "Primero carga un GLB y haz clic en la superficie para colocar el estampado.":"First load a GLB and click its surface to place the print.",
    "Estampado actualizado con el diseño transparente, sin fondo ni controles de selección.":"Print updated with transparent artwork, without background or selection controls.",
    "Estampado colocado con el arte transparente, sin el fondo del lienzo.":"Print placed with transparent artwork, without the canvas background.",
    "Estampado reposicionado: se sustituyó la colocación anterior.":"Print repositioned: the previous placement was replaced.",
    "No hay estampados que eliminar.":"There are no prints to remove.",
    "Selecciona un archivo .GLB con texturas integradas.":"Select a .GLB file with embedded textures.",
    "Cargando modelo…":"Loading model…",
    "Arrastra para girar y haz clic en la superficie para estampar.":"Drag to rotate and click the surface to apply the print.",
    "No se pudo leer el GLB o sus texturas.":"Could not read the GLB or its textures.",
    "Vista restablecida. El modelo y los estampados se han conservado.":"View reset. The model and prints have been preserved.",
    "Carga primero un modelo GLB.":"Load a GLB model first.",
    "Visor listo. Carga un modelo .GLB; no se utilizan maquetas geométricas ficticias.":"Viewer ready. Load a .GLB model; no fake mockups are used.",
    "Malla":"Mesh","material ":"material "
  };
  const reverse = Object.fromEntries(Object.entries(translations).map(([es,en])=>[en,es]));
  let language = "es";
  const storageKey = "printstudio-language";
  function translate(value) {
    if (typeof value !== "string") return value;
    const dict = language === "en" ? translations : reverse;
    if (dict[value] !== undefined) return dict[value];
    if (language === "en") {
      let m = value.match(/^Formato actualizado: (.*)\. El diseño se ha conservado\.$/);
      if (m) return "Format updated: " + m[1] + ". Your design has been preserved.";
      m = value.match(/^Fondo eliminado en (.*) píxeles\.$/);
      if (m) return "Background removed from " + m[1] + " pixels.";
      m = value.match(/^Modelo cargado: (.*)\. Arrastra para girar y haz clic en la superficie para estampar\.$/);
      if (m) return "Model loaded: " + m[1] + ". " + translations["Arrastra para girar y haz clic en la superficie para estampar."];
      m = value.match(/^Se han eliminado (.*) estampado\(s\)\. El modelo y el lienzo 2D se mantienen\.$/);
      if (m) return m[1] + " print(s) removed. The model and 2D canvas remain unchanged.";
      m = value.match(/^No se pudo guardar el proyecto: (.*)$/);
      if (m) return "Could not save project: " + m[1];
      m = value.match(/^No se pudo abrir el proyecto: (.*)$/);
      if (m) return "Could not open project: " + m[1];
      m = value.match(/^Error al exportar: (.*)$/);
      if (m) return "Export error: " + m[1];
      m = value.match(/^PNG exportado: (.*)$/);
      if (m) return "PNG exported: " + m[1];
    } else {
      let m = value.match(/^Format updated: (.*)\. Your design has been preserved\.$/);
      if (m) return "Formato actualizado: " + translate(m[1]) + ". El diseño se ha conservado.";
      m = value.match(/^Background removed from (.*) pixels\.$/);
      if (m) return "Fondo eliminado en " + m[1] + " píxeles.";
      m = value.match(/^Model loaded: (.*)\. Drag to rotate and click the surface to apply the print\.$/);
      if (m) return "Modelo cargado: " + m[1] + ". Arrastra para girar y haz clic en la superficie para estampar.";
      m = value.match(/^(.*) print\(s\) removed\. The model and 2D canvas remain unchanged\.$/);
      if (m) return "Se han eliminado " + m[1] + " estampado(s). El modelo y el lienzo 2D se mantienen.";
      m = value.match(/^Could not save project: (.*)$/);
      if (m) return "No se pudo guardar el proyecto: " + m[1];
      m = value.match(/^Could not open project: (.*)$/);
      if (m) return "No se pudo abrir el proyecto: " + m[1];
      m = value.match(/^Export error: (.*)$/);
      if (m) return "Error al exportar: " + m[1];
      m = value.match(/^PNG exported: (.*)$/);
      if (m) return "PNG exportado: " + m[1];
    }
    return value;
  }
  function translateDom() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(node.parentElement.tagName)) continue;
      nodes.push(node);
    }
    nodes.forEach(node => {
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (!trimmed) return;
      const result = translate(trimmed);
      if (result !== trimmed) node.nodeValue = original.replace(trimmed, result);
    });
    const attrs = [
      ["#textValue","placeholder"],["#canvasScale","aria-label"],
      ["#languageSelect","aria-label"]
    ];
    attrs.forEach(([selector,attr]) => {
      const el=document.querySelector(selector);
      if(el && el.hasAttribute(attr)) el.setAttribute(attr,translate(el.getAttribute(attr)));
    });
    document.title=translate(document.title);
    document.documentElement.lang=language;
  }
  function setLanguage(next) {
    language = next === "en" ? "en" : "es";
    try { localStorage.setItem(storageKey, language); } catch (_) {}
    const select=document.getElementById("languageSelect");
    if(select && select.value!==language) select.value=language;
    translateDom();
    window.dispatchEvent(new CustomEvent("printstudio:languagechange",{detail:{language}}));
  }
  window.printStudioTranslate=translate;
  window.printStudioLanguage=()=>language;
  window.setPrintStudioLanguage=setLanguage;
  function init() {
    const select=document.getElementById("languageSelect");
    let saved="es";
    try { saved=localStorage.getItem(storageKey)||"es"; } catch (_) {}
    if(select) select.addEventListener("change",()=>setLanguage(select.value));
    setLanguage(saved);
    const observer=new MutationObserver(()=>translateDom());
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
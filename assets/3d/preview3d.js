import * as THREE from "../vendor/three.module.min.js";
import {GLTFLoader} from "./loaders/GLTFLoader.js";
import {DecalGeometry} from "./geometries/DecalGeometry.js";
const host=document.getElementById("threePreview"),canvas=document.getElementById("canvas"),fileInput=document.getElementById("modelFile"),colorInput=document.getElementById("garmentColor"),sizeInput=document.getElementById("printSize"),status=document.getElementById("threeStatus");
const scene=new THREE.Scene();scene.background=new THREE.Color("#202a38");
const camera=new THREE.PerspectiveCamera(35,1,.01,1000),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;host.replaceChildren(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x697386,2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,5);scene.add(key);const fill=new THREE.DirectionalLight(0xc8d8ff,1.4);fill.position.set(4,1,3);scene.add(fill);
let root=null,meshes=[],materials=[],decals=[],lastModelBuffer=null,lastModelName="",target=new THREE.Vector3(),distance=4,yaw=-.25,pitch=.08,down=null,drag=false,lx=0,ly=0;
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
const say=s=>{status.dataset.message=s;status.textContent=window.printStudioTranslate?window.printStudioTranslate(s):s};
window.addEventListener("printstudio:languagechange",()=>{if(status.dataset.message)status.textContent=window.printStudioTranslate?window.printStudioTranslate(status.dataset.message):status.dataset.message});
function resize(){let w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function frame(){camera.position.set(target.x+distance*Math.sin(yaw)*Math.cos(pitch),target.y+distance*Math.sin(pitch),target.z+distance*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(target);renderer.render(scene,camera);requestAnimationFrame(frame)}
function removePrints(showMessage=true){
  const textures=new Set();
  decals.forEach(d=>{
    scene.remove(d);
    d.geometry.dispose();
    if(d.material.map)textures.add(d.material.map);
    d.material.dispose();
  });
  textures.forEach(t=>t.dispose());
  const count=decals.length;
  decals=[];
  if(showMessage)say(count?"Se han eliminado "+count+" estampado(s). El modelo y el lienzo 2D se mantienen.":"No hay estampados que eliminar.");
}
function clear(){
  removePrints(false);
  if(root){
    scene.remove(root);
    const geometries=new Set(),modelMaterials=new Set(),textures=new Set();
    root.traverse(o=>{
      if(!o.isMesh)return;
      if(o.geometry)geometries.add(o.geometry);
      (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{
        if(!m)return;
        modelMaterials.add(m);
        for(const key in m)if(m[key]?.isTexture)textures.add(m[key]);
      });
    });
    geometries.forEach(g=>g.dispose());
    modelMaterials.forEach(m=>m.dispose());
    textures.forEach(t=>t.dispose());
  }
  root=null;meshes=[];materials=[];
}
function fit(){
  if(!root)return;
  root.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(root),s=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3());
  const max=Math.max(s.x,s.y,s.z)||1;
  yaw=-.25;pitch=.08;target.copy(c);distance=max*2.7;
  camera.near=Math.max(max/1000,.001);camera.far=Math.max(max*100,10);camera.updateProjectionMatrix();
}
function materialLabel(value){
  const raw=String(value||"Malla");
  if(window.printStudioTranslate){
    const direct=window.printStudioTranslate(raw);
    if(direct!==raw)return direct;
    return raw.split(/([\s_.:/\\-]+)/).map(part=>{
      if(!part||/^[\s_.:/\\-]+$/.test(part)||/^\d+$/.test(part))return part;
      const translated=window.printStudioTranslate(part);
      return translated!==part?translated:part;
    }).join("");
  }
  return raw;
}
function populateMaterials(){materials=[];materialSelect.innerHTML="";let all=document.createElement("option");all.value="-1";all.textContent=materialLabel("Todos los materiales");materialSelect.appendChild(all);let seen=new Set();meshes.forEach(mesh=>(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach((mat,i)=>{if(!mat||seen.has(mat))return;seen.add(mat);materials.push(mat);let op=document.createElement("option");op.value=String(materials.length-1);const meshName=mesh.name||"Malla",matName=mat.name||("material "+(i+1));op.textContent=materialLabel(meshName)+(matName?" · "+materialLabel(matName):"");op.title="Nombre GLB: "+meshName+" · "+matName;materialSelect.appendChild(op)}));if(materials.length)materialSelect.value="0";}
window.addEventListener("printstudio:languagechange",()=>{if(root)populateMaterials()});
function syncMaterialColor(){const idx=Number(materialSelect.value),targets=idx<0?materials:[materials[idx]].filter(Boolean),m=targets.find(x=>x?.color);if(m)colorInput.value="#"+m.color.getHexString()}
function recolor(hex){if(!root)return;let c=new THREE.Color(hex),idx=Number(materialSelect.value),targets=idx<0?materials:[materials[idx]].filter(Boolean);targets.forEach(m=>{if(m.color)m.color.copy(c);m.needsUpdate=true})}
function printArtwork(){return typeof window.createPrintTextureCanvas==="function"?window.createPrintTextureCanvas():canvas}
function tex(){let artwork=printArtwork(),t=new THREE.CanvasTexture(artwork);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.needsUpdate=true;return t}
function place(x,y){
 if(!root)return;
 root.updateMatrixWorld(true);
 const r=renderer.domElement.getBoundingClientRect();
 if(!r.width||!r.height)return;
 pointer.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height*2-1));
 ray.setFromCamera(pointer,camera);
 const hits=ray.intersectObjects(meshes,false);
 if(!hits.length){say("Haz clic sobre la superficie del producto.");return}
 const h=hits[0];
 if(!h.face){say("No se pudo determinar la superficie. Prueba otra zona del modelo.");return}
 if(!h.object.geometry.attributes.normal)h.object.geometry.computeVertexNormals();
 const n=h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize();
 const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n);
 const e=new THREE.Euler().setFromQuaternion(q),baseSize=Number(sizeInput.value||.7),artwork=printArtwork(),v=baseSize*(Number(artwork.printScale)||1);
 try{
  const g=new DecalGeometry(h.object,h.point.clone().addScaledVector(n,.002),e,new THREE.Vector3(v,v*(artwork.height/artwork.width),Math.max(.04,v*.3)));
  if(!g.attributes.position||g.attributes.position.count===0){g.dispose();say("No se pudo proyectar en esa zona. Prueba una superficie más plana.");return}
  // Un solo estampado activo: un nuevo clic sustituye la posición anterior.
  // Así evitamos que los clics repetidos acumulen copias superpuestas.
  const hadPreviousPrint=decals.length>0;
  removePrints(false);
  const m=new THREE.MeshBasicMaterial({map:tex(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:THREE.DoubleSide});
  const d=new THREE.Mesh(g,m);scene.add(d);decals.push(d);
  say(hadPreviousPrint?"Estampado reposicionado: se sustituyó la colocación anterior.":"Estampado colocado con el arte transparente, sin el fondo del lienzo.");
 }catch(err){console.error(err);say("No se pudo proyectar en esa superficie. Prueba otra zona del modelo.")}
}
function update(){if(!decals.length){say("Primero carga un GLB y haz clic en la superficie para colocar el estampado.");return}const oldTextures=new Set();const t=tex();decals.forEach(d=>{if(d.material.map)oldTextures.add(d.material.map);d.material.map=t;d.material.needsUpdate=true});oldTextures.forEach(old=>{if(old!==t)old.dispose()});say("Estampado actualizado con el diseño transparente, sin fondo ni controles de selección.")}
function openLibraryDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open("PrintStudioModelLibrary",1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("models"))db.createObjectStore("models",{keyPath:"id"})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function libraryRequest(mode,action,value){const db=await openLibraryDB();return new Promise((resolve,reject)=>{const tx=db.transaction("models",mode),store=tx.objectStore("models"),req=action==="all"?store.getAll():action==="put"?store.put(value):action==="delete"?store.delete(value):store.get(value);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error)})}
function bytesToBase64(buffer){let binary="",bytes=new Uint8Array(buffer),chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)}
function base64ToBytes(value){const binary=atob(value),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes.buffer}
async function refreshLibrary(){const host=document.getElementById("modelLibraryList");try{const models=await libraryRequest("readonly","all");host.replaceChildren();if(!models.length){host.textContent="Aún no hay modelos guardados.";return}models.sort((a,b)=>a.name.localeCompare(b.name)).forEach(model=>{const row=document.createElement("div");row.style.cssText="display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:7px 0;border-bottom:1px solid #29364d";const title=document.createElement("span");title.style.flex="1";title.textContent=model.name+" · "+model.category;const load=document.createElement("button");load.className="btn";load.textContent="Cargar";load.dataset.load=model.id;const del=document.createElement("button");del.className="btn";del.textContent="Eliminar";del.dataset.delete=model.id;row.append(title,load,del);host.append(row)})}catch(error){console.error(error);host.textContent="No se pudo acceder a la biblioteca local."}}
function loadGlbBuffer(buffer,name){say("Cargando modelo…");lastModelBuffer=buffer.slice(0);lastModelName=name;new GLTFLoader().parse(buffer.slice(0),"",g=>{clear();root=g.scene;scene.add(root);root.traverse(o=>{if(o.isMesh)meshes.push(o)});populateMaterials();fit();syncMaterialColor();say("Modelo cargado: "+name+". Arrastra para girar y haz clic en la superficie para estampar.")},err=>{console.error(err);say("No se pudo leer el GLB o sus texturas.")})}
fileInput.addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;if(!f.name.toLowerCase().endsWith(".glb")){say("Selecciona un archivo .GLB con texturas integradas.");return}const rd=new FileReader();rd.onload=()=>loadGlbBuffer(rd.result,f.name);rd.onerror=()=>say("No se pudo leer el GLB o sus texturas.");rd.readAsArrayBuffer(f)});
document.getElementById("saveModelToLibrary").addEventListener("click",async()=>{if(!lastModelBuffer){say("Carga primero un modelo GLB.");return}try{const name=(document.getElementById("libraryModelName").value||lastModelName.replace(/\.glb$/i,"")).trim();if(!name){say("Escribe un nombre para el modelo.");return}const id=crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random();await libraryRequest("readwrite","put",{id,name,category:document.getElementById("libraryCategory").value,fileName:lastModelName,buffer:lastModelBuffer.slice(0),savedAt:Date.now()});await refreshLibrary();say("Modelo guardado en Mi biblioteca 3D.")}catch(error){console.error(error);say("No se pudo guardar el modelo en la biblioteca local.")}});
document.getElementById("modelLibraryList").addEventListener("click",async e=>{const id=e.target.dataset.load||e.target.dataset.delete;if(!id)return;try{if(e.target.dataset.delete){await libraryRequest("readwrite","delete",id);await refreshLibrary();return}const model=await libraryRequest("readonly","get",id);if(model)loadGlbBuffer(model.buffer,model.fileName||model.name+".glb")}catch(error){console.error(error);say("No se pudo recuperar el modelo de la biblioteca.")}});
document.getElementById("exportModelLibrary").addEventListener("click",async()=>{try{const models=await libraryRequest("readonly","all"),payload=models.map(m=>({id:m.id,name:m.name,category:m.category,fileName:m.fileName,savedAt:m.savedAt,glb:bytesToBase64(m.buffer)}));const blob=new Blob([JSON.stringify({format:"PrintStudio-3D-Library",version:1,models:payload})],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="PrintStudio-biblioteca-3D.json";a.click();URL.revokeObjectURL(url);say("Copia de seguridad de la biblioteca exportada.")}catch(error){console.error(error);say("No se pudo exportar la biblioteca.")}});
document.getElementById("importModelLibrary").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.format!=="PrintStudio-3D-Library"||!Array.isArray(data.models))throw new Error("Formato no válido");for(const m of data.models){if(!m.name||!m.glb)continue;await libraryRequest("readwrite","put",{id:m.id||String(Date.now()+Math.random()),name:m.name,category:m.category||"other",fileName:m.fileName||m.name+".glb",buffer:base64ToBytes(m.glb),savedAt:m.savedAt||Date.now()})}await refreshLibrary();say("Biblioteca 3D importada correctamente.")}catch(error){console.error(error);say("No se pudo importar la biblioteca. Comprueba el archivo JSON.")}finally{e.target.value=""}});
refreshLibrary();
colorInput.addEventListener("input",e=>recolor(e.target.value));materialSelect.addEventListener("change",syncMaterialColor);document.getElementById("updatePrintBtn").addEventListener("click",update);
document.getElementById("reset3d").addEventListener("click",()=>{if(root){fit();say("Vista restablecida. El modelo y los estampados se han conservado.")}else say("Carga primero un modelo GLB.")});
document.getElementById("clearPrintsBtn").addEventListener("click",()=>removePrints(true));
host.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,m:0};drag=true;lx=e.clientX;ly=e.clientY;host.setPointerCapture(e.pointerId)});
host.addEventListener("pointermove",e=>{if(!drag)return;let dx=e.clientX-lx,dy=e.clientY-ly;down.m+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.008;pitch=Math.max(-1.35,Math.min(1.35,pitch+dy*.006));lx=e.clientX;ly=e.clientY});
host.addEventListener("pointerup",e=>{if(drag&&down&&down.m<7)place(e.clientX,e.clientY);drag=false;down=null});host.addEventListener("pointercancel",()=>{drag=false;down=null});
host.addEventListener("wheel",e=>{e.preventDefault();distance=Math.max(.15,Math.min(1000,distance*(e.deltaY>0?1.08:.92)))},{passive:false});
window.addEventListener("resize",resize);window.updatePrintStudio3D=update;resize();frame();say("Visor listo. Carga un modelo .GLB; no se utilizan maquetas geométricas ficticias.");
(function(){
'use strict';
let scene,camera,renderer,root,texture,printMaterial,garmentMaterial,frameId=0;
let dragging=false,lastX=0,lastY=0,rotationY=-0.25,rotationX=0.03,zoom=1.0;
let currentProduct='shirt',currentColor='#e7e9ed',host;
const T=window.THREE;
function shape(points){const s=new T.Shape();s.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)s.lineTo(points[i][0],points[i][1]);s.closePath();return s}
function material(color,roughness){return new T.MeshStandardMaterial({color,roughness:roughness==null?.78:roughness,metalness:0.01})}
function addMesh(g,m,x,y,z){const o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);root.add(o);return o}
function shirtGeometry(isHoodie){
 const p=[[-.72,-1.25],[.72,-1.25],[.72,.66],[1.05,.22],[1.34,.58],[.92,1.12],[.48,.91],[.28,1.24],[-.28,1.24],[-.48,.91],[-.92,1.12],[-1.34,.58],[-1.05,.22],[-.72,.66]];
 const g=new T.ExtrudeGeometry(shape(p),{depth:.16,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.055,bevelThickness:.045,curveSegments:12});
 g.computeVertexNormals();addMesh(g,garmentMaterial,0,0,-.08);
 if(isHoodie){
  const hood= new T.ExtrudeGeometry(shape([[-.36,1.05],[-.32,1.43],[-.2,1.65],[0,1.72],[.2,1.65],[.32,1.43],[.36,1.05],[.22,.98],[0,1.12],[-.22,.98]]),{depth:.13,bevelEnabled:true,bevelSegments:4,bevelSize:.035,bevelThickness:.03});
  addMesh(hood,material(currentColor,.9),0,0,.04);
  const pocket=new T.Mesh(new T.BoxGeometry(.74,.34,.035),material(currentColor,.88));pocket.position.set(0,-.65,.145);root.add(pocket);
  const seam=new T.Mesh(new T.BoxGeometry(.76,.018,.012),material('#aab1bb',.9));seam.position.set(0,-.48,.17);root.add(seam);
 }
}
function buildProduct(kind){
 currentProduct=kind;root=new T.Group();scene.add(root);
 garmentMaterial=material(currentColor,kind==='mug'?.22:.88);
 if(kind==='shirt'||kind==='hoodie'){
  shirtGeometry(kind==='hoodie');
  texture=new T.CanvasTexture(document.getElementById('canvas'));texture.encoding=T.sRGBEncoding;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  printMaterial=new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:false});
  const art=new T.Mesh(new T.PlaneGeometry(1.08,1.3),printMaterial);art.position.set(0,-.02,.185);root.add(art);
 }else if(kind==='mug'){
  const body=new T.Mesh(new T.CylinderGeometry(.72,.68,1.12,96,1,false),material(currentColor,.2));body.rotation.z=Math.PI/2;body.position.set(-.08,0,0);root.add(body);
  const handle=new T.Mesh(new T.TorusGeometry(.34,.095,18,64,Math.PI*2),material(currentColor,.2));handle.position.set(.7,.02,0);handle.rotation.y=Math.PI/2;root.add(handle);
  texture=new T.CanvasTexture(document.getElementById('canvas'));texture.encoding=T.sRGBEncoding;texture.wrapS=T.RepeatWrapping;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const print=new T.Mesh(new T.CylinderGeometry(.724,.684,1.0,96,1,true,Math.PI*.12,Math.PI*1.45),new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:false}));
  print.rotation.z=Math.PI/2;print.position.set(-.08,0,0);root.add(print);
 }else if(kind==='tote'){
  const body=addMesh(new T.BoxGeometry(1.65,1.8,.18),material(currentColor,.95),0,-.05,0);
  const edge=addMesh(new T.BoxGeometry(1.68,1.82,.04),material('#b8b2a7',.98),0,-.05,-.105);
  const curve=new T.CatmullRomCurve3([new T.Vector3(-.48,.82,0),new T.Vector3(-.46,1.48,0),new T.Vector3(0,1.58,0),new T.Vector3(.46,1.48,0),new T.Vector3(.48,.82,0)]);
  addMesh(new T.TubeGeometry(curve,48,.055,12,false),material(currentColor,.98));
  texture=new T.CanvasTexture(document.getElementById('canvas'));texture.colorSpace=T.SRGBColorSpace;
  const art=new T.Mesh(new T.PlaneGeometry(1.25,1.4),new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:false}));art.position.set(0,-.04,.103);root.add(art);
 }else{
  addMesh(new T.BoxGeometry(1.85,1.85,.16),material('#aeb7c5',.85));
  texture=new T.CanvasTexture(document.getElementById('canvas'));texture.colorSpace=T.SRGBColorSpace;
  const art=new T.Mesh(new T.PlaneGeometry(1.72,1.72),new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide}));art.position.z=.09;root.add(art);
 }
}
function resize(){if(!renderer||!host)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function draw(){
 if(!renderer)return;
 root.rotation.y=rotationY;root.rotation.x=rotationX;
 camera.position.set(0,0,4.4/zoom);camera.lookAt(0,0,0);
 renderer.render(scene,camera);frameId=requestAnimationFrame(draw);
}
function init(){
 if(!T||!document.getElementById('threePreview'))return;
 host=document.getElementById('threePreview');
 try{
  scene=new T.Scene();scene.background=new T.Color('#1b2940');
  camera=new T.PerspectiveCamera(34,1,.1,100);
  renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;host.appendChild(renderer.domElement);
  scene.add(new T.HemisphereLight(0xffffff,0x536078,2.0));
  const key=new T.DirectionalLight(0xffffff,3.0);key.position.set(-3,4,5);scene.add(key);
  const fill=new T.DirectionalLight(0xb7caff,1.3);fill.position.set(4,1,3);scene.add(fill);
  const rim=new T.DirectionalLight(0xffffff,2);rim.position.set(0,3,-4);scene.add(rim);
  buildProduct(document.getElementById('product').value);resize();
  host.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture(e.pointerId)});
  host.addEventListener('pointermove',e=>{if(!dragging)return;rotationY+=(e.clientX-lastX)*.009;rotationX=Math.max(-.35,Math.min(.35,rotationX+(e.clientY-lastY)*.005));lastX=e.clientX;lastY=e.clientY});
  host.addEventListener('pointerup',()=>dragging=false);host.addEventListener('pointercancel',()=>dragging=false);
  host.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.6,zoom*(e.deltaY>0?.94:1.06)))},{passive:false});
  window.addEventListener('resize',resize);
  const colorInput=document.getElementById('garmentColor');
  if(colorInput)colorInput.addEventListener('input',e=>{currentColor=e.target.value;scene.remove(root);buildProduct(currentProduct)});
  const reset=document.getElementById('reset3d');if(reset)reset.addEventListener('click',()=>{rotationY=-.25;rotationX=.03;zoom=1});
  window.updatePrintStudio3D=()=>{const wanted=document.getElementById('product').value;if(wanted!==currentProduct){scene.remove(root);buildProduct(wanted)}if(texture){texture.needsUpdate=true}};
  window.updatePrintStudio3D();draw();
  document.getElementById('threeStatus').textContent='Vista 3D activa · arrastra para girar · rueda para acercar';
 }catch(err){console.error('PrintStudio 3D:',err);document.getElementById('threeStatus').textContent='No se pudo iniciar el visor 3D en este navegador.'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
// Simulador frontal POD por perfiles. No usa GLB ni modifica el editor 2D.
const host=document.getElementById("productPreviewHost");
const canvas=document.getElementById("productPreviewCanvas");
const ctx=canvas.getContext("2d");
const product=document.getElementById("product");
const color=document.getElementById("productColor");
const status=document.getElementById("productPreviewStatus");
const phoneModel=document.getElementById("phoneCaseModel");

const PROFILES={
 shirt:{zone:{x:166,y:166,w:188,h:206},label:"Camiseta · vista frontal"},
 hoodie:{zone:{x:185,y:164,w:150,h:178},label:"Hoodie · pecho frontal"},
 mug:{zone:{x:155,y:207,w:185,h:138},label:"Taza · panel frontal de referencia"},
 tote:{zone:{x:157,y:213,w:206,h:205},label:"Bolsa · panel frontal"},
 "phone-case":{zone:{x:184,y:162,w:152,h:272},label:"Funda · reverso de referencia"}
};

function hexRgb(hex){const n=parseInt(String(hex||"#e7e9ed").replace("#",""),16);return[(n>>16)&255,(n>>8)&255,n&255]}
function shade(hex,f){return "#"+hexRgb(hex).map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,"0")).join("")}
function gradient(c,x1,y1,x2,y2,base){const g=c.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,shade(base,1.17));g.addColorStop(.48,base);g.addColorStop(1,shade(base,.78));return g}
function path(c,commands){c.beginPath();for(const [m,...v] of commands)c[m](...v)}
function fabricSeam(c,commands,alpha=.28){c.save();c.strokeStyle="rgba(255,255,255,"+alpha+")";c.lineWidth=1.5;c.lineCap="round";path(c,commands);c.stroke();c.restore()}
function shirt(c,base,isHoodie=false){
 c.save();c.shadowColor="#0007";c.shadowBlur=18;c.shadowOffsetY=13;
 if(isHoodie){
  // Capucha colocada detrás del cuerpo, con abertura sombreada y sin línea central artificial.
  c.fillStyle=gradient(c,205,40,315,160,shade(base,.83));
  path(c,[["moveTo",211,91],["quadraticCurveTo",202,37,260,25],["quadraticCurveTo",318,37,309,91],["quadraticCurveTo",300,143,260,151],["quadraticCurveTo",220,143,211,91],["closePath"]]);c.fill();
  c.shadowColor="transparent";c.fillStyle=shade(base,.48);
  path(c,[["moveTo",226,83],["quadraticCurveTo",260,48,294,83],["quadraticCurveTo",292,124,260,132],["quadraticCurveTo",228,124,226,83],["closePath"]]);c.fill();
 }
 c.fillStyle=gradient(c,65,100,455,480,base);c.strokeStyle=shade(base,.66);c.lineWidth=2.5;
 path(c,[["moveTo",177,94],["lineTo",218,73],["quadraticCurveTo",260,103,302,73],["lineTo",343,94],["lineTo",448,166],["quadraticCurveTo",454,171,449,181],["lineTo",405,245],["lineTo",354,214],["lineTo",354,465],["quadraticCurveTo",260,485,166,465],["lineTo",166,214],["lineTo",115,245],["lineTo",71,181],["quadraticCurveTo",66,171,72,166],["closePath"]]);c.fill();c.stroke();
 c.shadowColor="transparent";
 // Cuello y costuras sutiles.
 c.fillStyle=shade(base,.56);c.beginPath();c.ellipse(260,97,43,23,0,0,Math.PI*2);c.fill();
 c.fillStyle="#101827";c.beginPath();c.ellipse(260,94,34,17,0,0,Math.PI*2);c.fill();
 fabricSeam(c,[["moveTo",181,101],["quadraticCurveTo",260,139,339,101]],.4);
 fabricSeam(c,[["moveTo",178,218],["lineTo",178,452]],.16);
 fabricSeam(c,[["moveTo",342,218],["lineTo",342,452]],.16);
 if(isHoodie){
  // Bolsillo tipo canguro: contorno redondeado y volumen, sin rectángulo rígido.
  c.fillStyle=gradient(c,205,365,315,433,shade(base,.92));c.strokeStyle=shade(base,.68);c.lineWidth=2;
  path(c,[["moveTo",199,360],["quadraticCurveTo",260,374,321,360],["lineTo",309,425],["quadraticCurveTo",260,440,211,425],["closePath"]]);c.fill();c.stroke();
  fabricSeam(c,[["moveTo",210,368],["quadraticCurveTo",260,379,310,368]],.32);
  // Cordones discretos, simétricos y cortos.
  c.strokeStyle=shade(base,.43);c.lineWidth=3;c.lineCap="round";
  c.beginPath();c.moveTo(244,111);c.quadraticCurveTo(240,139,238,153);c.moveTo(276,111);c.quadraticCurveTo(280,139,282,153);c.stroke();
  c.fillStyle=shade(base,.48);c.beginPath();c.arc(238,155,3,0,Math.PI*2);c.arc(282,155,3,0,Math.PI*2);c.fill();
  // Puños y bajo diferenciados sin crear líneas dominantes.
  c.fillStyle=shade(base,.88);c.fillRect(166,448,188,19);
 }else{
  c.fillStyle=shade(base,.88);c.fillRect(166,454,188,12);
 }
 c.restore();
}
function mug(c,base){
 c.save();c.shadowColor="#0008";c.shadowBlur=17;c.shadowOffsetY=12;
 // Asa completa detrás del cuerpo; el hueco se pinta con el fondo del escenario.
 c.lineCap="round";c.lineJoin="round";c.strokeStyle=shade(base,.78);c.lineWidth=31;
 c.beginPath();c.moveTo(352,224);c.bezierCurveTo(444,202,449,350,354,350);c.stroke();
 c.strokeStyle=shade(base,1.12);c.lineWidth=22;
 c.beginPath();c.moveTo(352,224);c.bezierCurveTo(423,212,427,337,354,339);c.stroke();
 c.fillStyle=gradient(c,120,150,390,420,base);c.strokeStyle=shade(base,.68);c.lineWidth=3;
 path(c,[["moveTo",126,169],["quadraticCurveTo",250,154,374,169],["lineTo",359,391],["quadraticCurveTo",250,425,141,391],["closePath"]]);c.fill();c.stroke();
 c.shadowColor="transparent";
 c.fillStyle=shade(base,1.08);c.beginPath();c.ellipse(250,170,124,15,0,0,Math.PI*2);c.fill();
 c.strokeStyle="#ffffff55";c.lineWidth=2;c.beginPath();c.ellipse(250,171,111,8,0,0,Math.PI*2);c.stroke();
 fabricSeam(c,[["moveTo",151,385],["quadraticCurveTo",250,411,349,385]],.22);
 c.restore();
}
function tote(c,base){
 c.save();c.shadowColor="#0008";c.shadowBlur=17;c.shadowOffsetY=13;
 // Asas detrás del panel, del mismo tejido/color que la bolsa.
 c.strokeStyle=shade(base,.88);c.lineWidth=23;c.lineCap="round";c.lineJoin="round";
 c.beginPath();c.moveTo(190,178);c.lineTo(202,82);c.quadraticCurveTo(260,28,318,82);c.lineTo(330,178);c.stroke();
 c.strokeStyle=shade(base,1.12);c.lineWidth=14;c.beginPath();c.moveTo(190,178);c.lineTo(202,82);c.quadraticCurveTo(260,28,318,82);c.lineTo(330,178);c.stroke();
 c.fillStyle=gradient(c,145,155,380,475,base);c.strokeStyle=shade(base,.68);c.lineWidth=3;
 path(c,[["moveTo",143,158],["quadraticCurveTo",260,170,377,158],["lineTo",352,459],["quadraticCurveTo",260,478,168,459],["closePath"]]);c.fill();c.stroke();
 c.shadowColor="transparent";
 fabricSeam(c,[["moveTo",158,178],["quadraticCurveTo",260,190,362,178]],.32);
 fabricSeam(c,[["moveTo",174,445],["quadraticCurveTo",260,461,346,445]],.2);
 c.restore();
}
function phoneCase(c,base){
 c.save();c.shadowColor="#0009";c.shadowBlur=22;c.shadowOffsetY=15;
 const x=150,y=45,w=220,h=430,r=34;
 c.fillStyle="#111827";c.beginPath();c.roundRect(x-5,y-5,w+10,h+10,r+5);c.fill();
 c.fillStyle=gradient(c,x,y,x+w,y+h,base);c.strokeStyle=shade(base,.58);c.lineWidth=3;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();c.stroke();
 c.shadowColor="transparent";
 // Isla de cámara elevada, fuera de la zona imprimible.
 c.fillStyle=shade(base,.68);c.beginPath();c.roundRect(x+17,y+17,88,91,20);c.fill();
 c.fillStyle="#111827";[[x+40,y+41],[x+78,y+41],[x+40,y+80]].forEach(([cx,cy])=>{c.beginPath();c.arc(cx,cy,13,0,Math.PI*2);c.fill();c.fillStyle="#60718a";c.beginPath();c.arc(cx-3,cy-3,4,0,Math.PI*2);c.fill();c.fillStyle="#111827"});
 c.fillStyle="#ffffff35";c.beginPath();c.roundRect(x+15,y+125,w-30,h-145,18);c.strokeStyle="#ffffff25";c.lineWidth=1;c.stroke();
 c.restore();
}
function drawArtwork(zone){
 const art=window.createPrintTextureCanvas?.();
 if(!art||art.width<2||art.height<2)return;
 const pad=7,box={x:zone.x+pad,y:zone.y+pad,w:zone.w-pad*2,h:zone.h-pad*2};
 // Contain mantiene intacta la composición completa y la proporción del lienzo.
 const ratio=Math.min(box.w/art.width,box.h/art.height);
 const w=art.width*ratio,h=art.height*ratio;
 ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();
 ctx.drawImage(art,box.x+(box.w-w)/2,box.y+(box.h-h)/2,w,h);
 ctx.restore();
}
function draw(){
 if(!host||!canvas||!ctx)return;
 const d=Math.min(window.devicePixelRatio||1,2),w=canvas.width/d,h=canvas.height/d;
 ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
 const bg=ctx.createRadialGradient(w/2,h*.4,12,w/2,h/2,Math.max(w,h)*.72);
 bg.addColorStop(0,"#293a53");bg.addColorStop(1,"#101827");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 const scale=Math.min((w-28)/520,(h-28)/520),ox=(w-520*scale)/2,oy=(h-520*scale)/2;
 ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
 const p=product.value,base=color.value;
 if(p==="mug")mug(ctx,base);
 else if(p==="tote")tote(ctx,base);
 else if(p==="phone-case")phoneCase(ctx,base);
 else if(p==="hoodie")shirt(ctx,base,true);
 else shirt(ctx,base,false);
 const profile=PROFILES[p]||PROFILES.shirt;
 drawArtwork(profile.zone);
 ctx.restore();
 ctx.fillStyle="#edf2fbbd";ctx.font="12px system-ui";ctx.textAlign="center";
 ctx.fillText((profile.label||"Vista frontal")+" · SIMULACIÓN",w/2,h-13);
 if(p==="phone-case"&&phoneModel?.value==="generic")status.textContent="Funda genérica de demostración. Falta seleccionar modelo y plantilla del proveedor para producción.";
}
function resize(){
 if(!host||!canvas)return;
 const r=host.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));draw();
}
product?.addEventListener("change",draw);
color?.addEventListener("input",draw);
phoneModel?.addEventListener("change",draw);
window.addEventListener("resize",resize);
window.addEventListener("printstudio:designchange",()=>{draw();if(status&&product.value!=="phone-case")status.textContent="Vista actualizada con la composición completa del lienzo."});
if(host&&"ResizeObserver"in window)new ResizeObserver(resize).observe(host);
resize();
// Ages Patchouli's book_brown.png / crafting.png into the worn survival notebook (kubejs/assets/zc_recipes/textures/gui).
// node docs/tools/age_book.js <book_brown.png from the Patchouli jar> caderno.png book   (or <crafting.png> caderno_crafting.png crafting)
const P=require('./png_rgba.js');const [,,src,dst,mode]=process.argv;const img=P.read(src);
let s=12345;const r=()=>{s=(s*1103515245+12345)>>>0;return (s>>>8)/16777216};
// value noise
const N=(x,y,sc)=>{const xi=Math.floor(x/sc),yi=Math.floor(y/sc),fx=x/sc-xi,fy=y/sc-yi;const h=(a,b)=>{let t=(a*374761393+b*668265263)>>>0;t=(t^(t>>>13))*1274126177>>>0;return (t&0xffff)/65535};
 const l=(a,b,t)=>a+(b-a)*(t*t*(3-2*t));return l(l(h(xi,yi),h(xi+1,yi),fx),l(h(xi,yi+1),h(xi+1,yi+1),fx),fy)};
const W=img.w,H=img.h,lim=mode==='crafting'?[W,H]:[272,182];
const at=(x,y)=>(y*W+x)*4;
const isPaper=(q)=>img.data[q+3]>0&&img.data[q]>200&&img.data[q+1]>190&&img.data[q+2]>150;
// distance from nearest non-paper pixel (for edge darkening), cheap: scan radius 6
const paper=new Uint8Array(W*H);for(let y=0;y<lim[1];y++)for(let x=0;x<lim[0];x++)paper[y*W+x]=isPaper(at(x,y))?1:0;
const edge=(x,y)=>{for(let d=1;d<=7;d++)for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=lim[0]||Y>=lim[1]||!paper[Y*W+X])return d}return 8};
// stains: [cx, cy, radius, ring?]
// stains only where Patchouli never draws: the bottom-right corner of the right page (one faint mug ring)
const stains=mode==='crafting'?[]:[[240,160,9,true]];
for(let y=0;y<lim[1];y++)for(let x=0;x<lim[0];x++){const q=at(x,y);if(!img.data[q+3])continue;
 let R=img.data[q],G=img.data[q+1],B=img.data[q+2];
 if(paper[y*W+x]){
  // yellow/grey the paper with blotchy noise
  const n=N(x,y,9)*0.6+N(x,y,3)*0.4;
  R=R*0.93-8+n*10; G=G*0.88-6+n*8; B=B*0.72-4+n*6;
  // dirty edges
  const e=edge(x,y);if(e<8){const k=(8-e)/8;R-=k*34;G-=k*38;B-=k*36}
  // stains
  for(const [cx,cy,rad,ring] of stains){const d=Math.hypot(x-cx,(y-cy)*1.1)+ (N(x,y,4)-0.5)*4;
   let a=0;if(ring){if(Math.abs(d-rad)<1.3)a=0.22;else if(d<rad)a=0.04}else if(d<rad)a=0.16*(1-d/rad)+0.05;
   R=R*(1-a)+120*a;G=G*(1-a)+85*a;B=B*(1-a)+45*a}
  // specks
  if(r()<0.0015){R-=24;G-=27;B-=27}
 }else if(mode!=='crafting'&&R<120&&G<100){
  // leather: scuffs and lighter wear
  const n=N(x,y,5);if(n>0.72){R+=18;G+=14;B+=10}
  if(r()<0.02){R+=26;G+=20;B+=14}
 }
 img.data[q]=Math.max(0,Math.min(255,R));img.data[q+1]=Math.max(0,Math.min(255,G));img.data[q+2]=Math.max(0,Math.min(255,B))}
P.write(dst,img);

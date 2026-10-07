// minimal RGBA PNG read/write (8-bit, color types 2/6/3/0/4, non-interlaced)
const zlib=require('zlib'),fs=require('fs');
const CRC=(()=>{const t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c}return b=>{let c=-1;for(const x of b)c=t[(c^x)&255]^(c>>>8);return (c^-1)>>>0}})();
function read(p){const b=fs.readFileSync(p);let o=8,w,h,ct,bd,pal,trns,idat=[];while(o<b.length){const len=b.readUInt32BE(o),type=b.toString('ascii',o+4,o+8),d=b.subarray(o+8,o+8+len);o+=12+len;
if(type==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);bd=d[8];ct=d[9];if(d[12])throw 'interlaced'}else if(type==='PLTE')pal=d;else if(type==='tRNS')trns=d;else if(type==='IDAT')idat.push(d)}
if(bd!==8)throw 'bitdepth '+bd+' '+p;const ch={0:1,2:3,3:1,4:2,6:4}[ct];const raw=zlib.inflateSync(Buffer.concat(idat));const out=Buffer.alloc(w*h*4);const stride=w*ch;let prev=Buffer.alloc(stride);
for(let y=0;y<h;y++){const f=raw[y*(stride+1)],line=Buffer.from(raw.subarray(y*(stride+1)+1,(y+1)*(stride+1)));for(let i=0;i<stride;i++){const a=i>=ch?line[i-ch]:0,b2=prev[i],c=i>=ch?prev[i-ch]:0;let v=line[i];
if(f===1)v+=a;else if(f===2)v+=b2;else if(f===3)v+=(a+b2)>>1;else if(f===4){const pp=a+b2-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b2),pc=Math.abs(pp-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?b2:c}line[i]=v&255}
for(let x=0;x<w;x++){const q=(y*w+x)*4,s=x*ch;let r,g,bb,al=255;if(ct===6){r=line[s];g=line[s+1];bb=line[s+2];al=line[s+3]}else if(ct===2){r=line[s];g=line[s+1];bb=line[s+2]}else if(ct===0){r=g=bb=line[s]}else if(ct===4){r=g=bb=line[s];al=line[s+1]}else{const i=line[s];r=pal[i*3];g=pal[i*3+1];bb=pal[i*3+2];al=trns&&i<trns.length?trns[i]:255}out[q]=r;out[q+1]=g;out[q+2]=bb;out[q+3]=al}prev=line}
return {w,h,data:out}}
function write(p,img){const {w,h,data}=img;const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;data.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4)}
const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(CRC(td));return Buffer.concat([l,td,c])};
const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;
fs.writeFileSync(p,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]))}
function blank(w,h){return {w,h,data:Buffer.alloc(w*h*4)}}
function scale(img,s,bg){const o=blank(img.w*s,img.h*s);for(let y=0;y<o.h;y++)for(let x=0;x<o.w;x++){const si=((y/s|0)*img.w+(x/s|0))*4,di=(y*o.w+x)*4;const a=img.data[si+3]/255;const chk=bg||((((x/s|0)+(y/s|0))&1)?[90,90,90]:[60,60,60]);for(let k=0;k<3;k++)o.data[di+k]=Math.round(img.data[si+k]*a+chk[k]*(1-a));o.data[di+3]=255}return o}
module.exports={read,write,blank,scale};

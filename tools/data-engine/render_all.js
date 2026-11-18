const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const err=[];p.on('pageerror',e=>err.push(e.message));
await p.goto('file:///home/user/learning-simulator/kompetensi/index.html');await p.waitForTimeout(800);
const semua=JSON.parse(fs.readFileSync(__dirname+'/dosier_semua.json','utf8'));let n=0,gagal=[];const pakai=new Set();
await p.evaluate(()=>{tna.internal=false;});
for(const r of semua){
  let bytes;
  try{ bytes=await p.evaluate(async(r)=>{const ab=await XL.build(dsDokumen(r)).arrayBuffer();const u=new Uint8Array(ab);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s);},r); }
  catch(e){ gagal.push(r.jabatan.kode+': '+e.message.slice(0,120)); continue; }
  const base=r.jabatan.jobTitle.replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'');let fn=base+'.xlsx';if(pakai.has(fn))fn=base+'_'+r.jabatan.kode+'.xlsx';pakai.add(fn);
  fs.writeFileSync(path.join(__dirname,'dokumen_jabatan',fn),Buffer.from(bytes,'base64'));n++;}
console.log('dokumen',n,'gagal',gagal,'err',err.slice(0,2));await b.close();})();

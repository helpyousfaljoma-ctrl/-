const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,mode,out,...ts]=process.argv;
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
 pg.on('console',m=>console.log('PAGE',m.text()));pg.on('pageerror',e=>console.log('ERR',e.message));
 await pg.goto('file://'+__dirname+'/board.html');await pg.evaluate(()=>window.ready);
 fs.writeFileSync(__dirname+'/timeline.json',JSON.stringify(await pg.evaluate(()=>window.TIMELINE())));
 if(mode==='stills'){for(const t of ts){await pg.evaluate(t=>renderAt(+t),t);await pg.screenshot({path:`${out}/s_${t}.png`})}}
 else{const fps=30,dur=+ts[0];const n=Math.ceil(dur*fps);fs.mkdirSync(out,{recursive:true});
  for(let i=0;i<n;i++){await pg.evaluate(t=>renderAt(t),i/fps);await pg.screenshot({path:`${out}/f_${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:93});if(i%150==0)console.log(i,'/',n)}}
 await b.close();})();

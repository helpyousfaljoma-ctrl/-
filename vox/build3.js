function build(){
const chk=(s,col='#4C9A5B')=>svg(s,s,`<path class="draw" d="M${s*.15},${s*.55} L${s*.4},${s*.8} L${s*.87},${s*.2}" stroke="${col}" stroke-width="${s*.17}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
const xx=(s,col='#E5383B')=>svg(s,s,`<path class="draw" d="M${s*.18},${s*.18} L${s*.82},${s*.82}" stroke="${col}" stroke-width="${s*.16}" fill="none" stroke-linecap="round"/><path class="draw" d="M${s*.82},${s*.18} L${s*.18},${s*.82}" stroke="${col}" stroke-width="${s*.16}" fill="none" stroke-linecap="round"/>`);
const disc=col=>`<div style="width:100%;height:100%;border-radius:50%;background:${col};border:10px solid #fff;box-sizing:border-box"></div>`;
const repeatSVG=(s,col)=>svg(s,s,`<g fill="none" stroke="${col}" stroke-width="${s*.1}" stroke-linecap="round"><path d="M${s*.2},${s*.45} A${s*.3},${s*.3} 0 0 1 ${s*.75},${s*.3}"/><path d="M${s*.8},${s*.55} A${s*.3},${s*.3} 0 0 1 ${s*.25},${s*.7}"/></g>
 <polygon points="${s*.62},${s*.14} ${s*.88},${s*.2} ${s*.7},${s*.44}" fill="${col}"/><polygon points="${s*.38},${s*.86} ${s*.12},${s*.8} ${s*.3},${s*.56}" fill="${col}"/>`);
const bookSVG=s=>svg(s,s,`<g ${STK}><rect x="${s*.15}" y="${s*.1}" width="${s*.62}" height="${s*.8}" rx="8" fill="#3D5A80"/></g><rect x="${s*.15}" y="${s*.1}" width="${s*.1}" height="${s*.8}" fill="#2B4160"/><rect x="${s*.35}" y="${s*.25}" width="${s*.3}" height="${s*.07}" fill="#FFD23F"/>`);
function QH(i,n,label){
  E({x:540,y:900,w:900,h:1150,t:C[i][0]-0.05,a:'pop',d:0.5,sh:false,z:0,float:false,sfx:null,html:`<div class="h" style="font-size:1150px;color:rgba(20,20,20,.07)">${n}</div>`});
  E({x:840,y:350,w:190,h:190,t:C[i][0]-0.02,a:'slam',d:0.3,shake:22,z:4,sfx:'boom',html:numCard(n,'#FFD23F').replace('font-size:150px;padding-top:24px','font-size:120px;padding-top:18px')});
  E({x:450,y:350,w:520,h:120,t:C[i][0]+0.1,a:'slideR',d:0.35,z:4,html:`<div class="tag" style="font-size:80px;background:#141414;color:#fff">${label}</div>`});
  FLASH.push({t:C[i][0]-0.02,a:0.5});GLITCH.push({t:C[i][0]-0.04});
}
// ===================== HOOK A (dark) =====================
scene(0,'#141414');
E({x:540,y:470,w:900,h:260,t:0,a:'slam',from:1.2,d:0.25,sh:false,sfx:'boom',shake:26,html:`<div class="h" style="font-size:250px;color:#fff">مهارتك</div>`});
E({x:540,y:770,w:820,h:300,t:0,a:'slam',from:1.3,d:0.3,r:-4,z:2,sfx:null,html:`<div style="background:#FFD23F;height:100%;border-radius:10px 26px 14px 22px;display:flex;align-items:center;justify-content:center"><div class="h" style="font-size:240px;color:#E5383B;padding-top:30px;text-shadow:6px 6px 0 #141414">بتنباع؟</div></div>`});
GLITCH.push({t:0.08});
E({x:300,y:1110,w:440,h:220,t:T(0,0.1),a:'slideL',d:0.4,r:-3,html:card(`<div style="position:absolute;top:0;left:0;right:0;height:44px;background:#3D5A80"></div>
 <div style="position:absolute;right:26px;top:66px;width:120px;height:120px;border-radius:50%;background:#9FC5E8;overflow:hidden"><div style="position:absolute;left:36px;top:20px;width:48px;height:48px;border-radius:50%;background:#141414"></div><div style="position:absolute;left:14px;top:76px;width:92px;height:70px;border-radius:50px 50px 0 0;background:#141414"></div></div>
 <div class="h" style="position:absolute;right:170px;top:86px;font-size:84px">موظف</div>`,torn(440,220,4))});
E({x:790,y:1090,w:200,h:200,t:T(0,0.38),a:'pop',d:0.4,html:gearSVG(200)});
E({x:790,y:1240,w:250,h:96,t:T(0,0.44),a:'pop',z:2,html:'<div class="tag" style="font-size:66px;background:#2A9D8F;color:#fff">مهارة</div>'});
E({x:150,y:640,w:170,h:170,t:T(0,0.72),a:'slam',d:0.22,z:5,shake:10,sfx:'thud',html:disc('#4C9A5B')});
E({x:150,y:640,w:120,h:120,t:T(0,0.74),a:'draw',d:0.2,z:6,sh:false,html:chk(120,'#fff')});
E({x:930,y:930,w:170,h:170,t:T(0,0.88),a:'slam',d:0.22,z:5,shake:10,sfx:'thud',html:disc('#E5383B')});
E({x:930,y:930,w:120,h:120,t:T(0,0.9),a:'draw',d:0.2,z:6,sh:false,html:xx(120,'#fff')});
PUNCH.push({t:T(0,0.72),amp:0.04});
// ===================== HOOK B (yellow, drops from top) =====================
scene(C[1][0]-0.18,'#FFD23F',-1,true);FLASH.push({t:C[1][0]-0.18,a:0.35});GLITCH.push({t:C[1][0]-0.16});
E({x:540,y:600,w:600,h:720,t:T(1,0.2),a:'slam',d:0.28,shake:24,sfx:'boom',sh:false,html:`<div class="h" style="font-size:760px;color:#141414;text-shadow:14px 14px 0 #E5383B">3</div>`});
E({x:540,y:1010,w:440,h:150,t:T(1,0.3),a:'pop',r:-3,z:3,html:'<div class="tag" style="font-size:104px;background:#141414;color:#fff">أسئلة</div>'});
const hw=E({x:250,y:1200,w:200,h:230,t:T(1,0.62),a:'pop',z:3,html:watchSVG(200)});hw.pie={t:T(1,0.66),d:0.9,to:1};
E({x:670,y:1210,w:480,h:120,t:T(1,0.72),a:'slideR',d:0.35,r:2,z:3,html:'<div class="tag" style="font-size:80px;background:#E5383B;color:#fff">خلال دقيقة</div>'});
SFX.push({t:T(1,0.55),k:'riser',d:C[2][0]-T(1,0.55)});
// ===================== Q1 =====================
scene(C[2][0]-0.3,'#E3EAF0',1);
QH(2,'1','السؤال الأول');
E({x:290,y:930,w:400,h:620,t:C[3][0],a:'slideUp',d:0.45,r:-2,html:phoneHTML(400,620,`<div style="height:80px;background:#2A9D8F;font-family:Cairo;font-weight:800;font-size:36px;text-align:center;line-height:80px;color:#fff;direction:rtl">الرسائل</div>`)});
['ممكن مساعدة؟','بتعملها إلي؟','بس هالمرة!'].forEach((s,i)=>E({x:290+(i%2?-20:20),y:800+i*105,w:300,h:84,t:T(3,0.14+i*0.12),a:'pop',d:0.3,z:3,sfx:'ping',
  html:`<div class="bub" style="font-size:36px;padding:14px 22px 10px;${i%2?'background:#DCF8C6;border-radius:28px 28px 8px 28px':'background:#EEF1F5;border-radius:28px 28px 28px 8px'}">${s}</div>`}));
E({x:770,y:650,w:340,h:150,t:T(3,0.52),a:'stamp',d:0.22,r:-8,z:5,shake:12,html:'<div class="h" style="font-size:96px;color:#E5383B;border:10px solid #E5383B;border-radius:16px;padding:20px 20px 2px;background:rgba(255,255,255,.7)">مجاناً</div>'});
E({x:770,y:1020,w:400,h:420,t:T(3,0.7),a:'pop',d:0.4,r:3,html:`<div style="width:100%;height:100%;background:#FBF8F0;border-radius:18px;overflow:hidden;border:8px solid #fff;box-sizing:border-box">
 <div class="h" style="background:#E5383B;color:#fff;font-size:60px;padding:18px 0 4px">بالشهر</div><div style="position:absolute;left:36px;right:36px;top:128px;bottom:34px;background-image:radial-gradient(circle,#C9D2DC 13px,transparent 14px);background-size:47px 62px"></div></div>`});
E({x:770,y:1060,w:400,h:300,t:T(3,0.8),a:'draw',d:0.5,z:3,sh:false,html:svg(400,300,[[83,62],[224,124],[318,248]].map(([x,y])=>`<circle class="draw" cx="${x}" cy="${y}" r="27" fill="none" stroke="#E5383B" stroke-width="10"/>`).join(''))});
[0.82,0.9,0.98].forEach(f=>SFX.push({t:T(3,f),k:'pop'}));
E({x:540,y:900,w:300,h:300,t:C[4][0],a:'slam',d:0.25,z:6,shake:14,html:`<div style="position:relative;width:100%;height:100%">${disc('#2A9D8F')}<div style="position:absolute;inset:40px">${repeatSVG(220,'#fff')}</div></div>`});
E({x:540,y:1110,w:460,h:120,t:C[4][0]+0.15,a:'pop',z:7,r:-3,html:'<div class="tag" style="font-size:84px;background:#FFD23F;color:#141414">تكرر الطلب</div>'});
// ---- pattern break: dark "market signal" ----
scene(C[5][0]-0.15,'#141414',1,true);FLASH.push({t:C[5][0]-0.1,a:0.45,c:'#4C9A5B'});GLITCH.push({t:C[5][0]-0.12});
E({x:540,y:520,w:900,h:190,t:C[5][0]+0.05,a:'slam',d:0.25,shake:18,sfx:'boom',sh:false,html:'<div class="h" style="font-size:170px;color:#FFD23F">إشارة سوق</div>'});
[120,220,330,450].forEach((h,i)=>E({x:330+i*140,y:1150-h/2,w:110,h,t:C[5][0]+0.12+i*0.09,a:'slideUp',d:0.4,sfx:i?null:'swoosh',float:false,html:`<div style="width:100%;height:100%;background:${i==3?'#FFD23F':'#4C9A5B'};border-radius:14px;border:8px solid #fff;box-sizing:border-box"></div>`}));
[0,1,2,3].forEach(i=>SFX.push({t:C[5][0]+0.3+i*0.09,k:'pop'}));
E({x:540,y:1265,w:420,h:120,t:C[6][0],a:'pop',sh:false,html:'<div class="h" style="font-size:100px;color:#8D99AE">مجاملة</div>'});
E({x:540,y:1265,w:440,h:60,t:C[6][0]+0.2,a:'draw',d:0.25,z:3,sh:false,html:svg(440,60,'<path class="draw" d="M8,40 C140,20 300,44 432,18" stroke="#E5383B" stroke-width="16" fill="none" stroke-linecap="round"/>')});
// ===================== Q2 =====================
scene(C[7][0]-0.27,'#F2E3D5',-1);
QH(7,'2','السؤال الثاني');
const o12=C[12][0]-0.1;
E({x:540,y:1010,w:200,h:520,t:C[8][0],a:'pop',d:0.4,z:1,out:o12,float:false,html:svg(200,520,`<g ${STK}><rect x="88" y="10" width="24" height="470" fill="#141414"/><path d="M30,520 L170,520 L140,470 L60,470 Z" fill="#141414"/><circle cx="100" cy="14" r="22" fill="#E5383B"/></g>`)});
const pan=(cls,icon,label,col)=>`<div class="pan ${cls}" style="position:absolute;${cls=='pl'?'left':'right'}:-80px;top:30px;width:280px;transform-origin:50% 0;transform:scale(0)">
 <svg width="280" height="84" style="display:block"><path d="M140,0 L30,84 M140,0 L250,84" stroke="#141414" stroke-width="6" fill="none"/></svg>
 <div style="position:relative;width:280px;height:250px;background:#FBF8F0;border:8px solid #fff;border-radius:16px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;box-shadow:0 12px 14px rgba(0,0,0,.25)">${icon}<div class="h" style="font-size:52px;color:${col}">${label}</div>
 ${cls=='pl'?[0,1,2].map(i=>`<div class="cn${i}" style="position:absolute;top:-52px;left:${40+i*62}px;transform:translateY(-900px)">${coinSVG(84)}</div>`).join(''):''}</div></div>`;
E({x:540,y:760,w:820,h:60,t:C[8][0]+0.05,a:'pop',d:0.35,z:3,sh:false,out:o12,float:false,html:`<div class="beam" style="position:absolute;inset:0;transform-origin:50% 50%"><div style="position:absolute;left:0;right:0;top:18px;height:24px;background:#141414;border-radius:12px"></div>
 ${pan('pl',boltSVG(120),'مشكلة بتوجع','#E5383B')}${pan('pr',starSVG(120),'شي حلو','#3D5A80')}</div>`,
 upd(t,w){const tl=T(10,0.5);let a=-9*eOutBack((t-tl)/0.6,1.6);if(t<tl)a=0;if(t>C[9][0]&&t<tl)a=3*Math.exp(-(t-C[9][0])*3)*Math.sin((t-C[9][0])*9);
  w.querySelector('.beam').style.transform=`rotate(${a.toFixed(2)}deg)`;
  const pl=w.querySelector('.pl'),pr=w.querySelector('.pr');
  pl.style.transform=`rotate(${(-a).toFixed(2)}deg) scale(${Math.max(0,eOutBack((t-T(8,0.35))/0.35)).toFixed(3)})`;
  pr.style.transform=`rotate(${(-a).toFixed(2)}deg) scale(${t<C[9][0]?0:eOutBack((t-C[9][0])/0.35).toFixed(3)})`;
  const g=eOutCubic((t-C[11][0]-0.1)/0.5);pr.style.filter=t>C[11][0]+0.1?`grayscale(${g}) opacity(${1-0.45*g})`:'';
  [0,1,2].forEach(i=>{const u=(t-T(10,0.08+i*0.12))/0.5;w.querySelector('.cn'+i).style.transform=`translateY(${(-(1-eBounce(u))*900).toFixed(1)}px)`});}});
SFX.push({t:C[8][0]+0.05,k:'swoosh'});SFX.push({t:C[9][0],k:'pop'});[0,1,2].forEach(i=>SFX.push({t:T(10,0.08+i*0.12),k:'coin'}));SFX.push({t:T(10,0.5),k:'thud',d:0.2});
E({x:290,y:640,w:400,h:110,t:T(10,0.6),a:'pop',r:-5,z:5,out:o12,html:'<div class="tag" style="font-size:70px;background:#4C9A5B;color:#fff">الناس بتدفع</div>'});
E({x:540,y:570,w:360,h:140,t:C[12][0],a:'slam',d:0.25,shake:16,z:5,sfx:'boom',html:'<div class="tag" style="font-size:96px;background:#E5383B;color:#fff">مثال</div>'});FLASH.push({t:C[12][0],a:0.4});
E({x:540,y:820,w:880,h:290,t:C[13][0],a:'slideR',d:0.45,r:-1.5,html:card(`<div style="position:absolute;right:36px;top:36px">${docSVG(160,210,'#2A9D8F')}</div>
 <div class="c" style="position:absolute;right:226px;left:30px;top:44px;font-size:52px;line-height:1.35">"ساعدني أعمل سيرة ذاتية<br>تجيب <span style="background:#FFD23F;padding:0 8px">مقابلات</span>"</div>`,torn(880,290,5),'#FFFDF6')});
E({x:320,y:985,w:440,h:150,t:C[14][0],a:'stamp',d:0.22,r:-7,z:6,shake:16,html:'<div class="h" style="font-size:92px;color:#4C9A5B;border:10px solid #4C9A5B;border-radius:16px;padding:20px 22px 4px;background:rgba(255,255,255,.8)">بتنباع أكتر</div>'});
E({x:540,y:1200,w:720,h:190,t:T(14,0.42),a:'slideL',d:0.45,r:2,html:card(`<div style="position:absolute;right:36px;top:26px">${brushSVG(136)}</div>
 <div class="c" style="position:absolute;right:196px;left:30px;top:56px;font-size:50px;color:#8D99AE">"علمني التصميم"</div>`,torn(720,190,5),'#EDEAE4')});
// ===================== Q3 (drops from top) =====================
scene(C[15][0]-0.27,'#DDEBE7',-1,true);
QH(15,'3','السؤال الثالث');
const o17=C[17][0]-0.02;
E({x:540,y:850,w:520,h:520,t:C[16][0]+0.05,a:'pop',d:0.4,out:o17,html:`<div style="position:relative;width:100%;height:100%">${svg(520,520,`<circle cx="260" cy="260" r="232" fill="#FBF8F0" stroke="#fff" stroke-width="16"/><circle cx="260" cy="260" r="200" fill="none" stroke="#D8DEE6" stroke-width="44"/>
 <circle class="ring" cx="260" cy="260" r="200" fill="none" stroke="#E5383B" stroke-width="44" stroke-linecap="round" transform="rotate(-90 260 260)" pathLength="1" style="stroke-dasharray:0 1"/>`)}
 <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="h cnt" style="font-size:230px;padding-top:30px">0</div><div class="h" style="font-size:70px;margin-top:-10px">دقيقة</div></div></div>`,
 upd(t,w){const p=eInOut((t-T(16,0.12))/(T(16,0.5)-T(16,0.12)));w.querySelector('.ring').style.strokeDasharray=`${p.toFixed(4)} 1`;w.querySelector('.cnt').textContent=Math.round(30*p)}});
SFX.push({t:T(16,0.12),k:'tick',d:T(16,0.5)-T(16,0.12)});PUNCH.push({t:T(16,0.5),amp:0.04});
E({x:850,y:630,w:300,h:110,t:T(16,0.52),a:'pop',r:8,z:3,out:o17,html:'<div class="tag" style="font-size:72px;background:#FFD23F;color:#141414">أو أقل</div>'});
E({x:240,y:1200,w:200,h:200,t:T(16,0.66),a:'pop',z:3,out:o17,html:bookSVG(200)});
E({x:240,y:1200,w:230,h:230,t:T(16,0.76),a:'draw',d:0.28,z:4,sh:false,out:o17,html:xx(230)});
E({x:650,y:1210,w:480,h:104,t:T(16,0.82),a:'pop',z:3,out:o17,html:'<div class="tag" style="font-size:62px;background:#141414;color:#fff">بلا تعلم جديد</div>'});
const tg=C[17][0]+0.4;
E({x:540,y:800,w:560,h:240,t:C[17][0]+0.05,a:'pop',d:0.35,html:`<div class="trk" style="position:relative;width:100%;height:100%;border-radius:120px;background:#B8BEC7;border:10px solid #fff;box-sizing:border-box">
 <div class="h lbl" style="position:absolute;left:50px;top:40px;font-size:140px;color:#fff;opacity:0">نعم</div><div class="knob" style="position:absolute;left:14px;top:14px;width:192px;height:192px;border-radius:50%;background:#fff;box-shadow:0 6px 10px rgba(0,0,0,.3)"></div></div>`,
 upd(t,w){const p=t<tg?0:eOutBack((t-tg)/0.35,1.4);w.querySelector('.knob').style.transform=`translateX(${(p*320).toFixed(1)}px)`;w.querySelector('.trk').style.background=p>0.4?'#4C9A5B':'#B8BEC7';w.querySelector('.lbl').style.opacity=clamp(p)}});
SFX.push({t:tg-0.15,k:'ding'});FLASH.push({t:tg+0.05,a:0.4,c:'#4C9A5B'});PUNCH.push({t:tg,amp:0.05});SHAKES.push({t:tg+0.05,amp:12});
E({x:540,y:1090,w:230,h:230,t:C[18][0],a:'drop',d:0.55,z:5,html:boxSVG(230)});
E({x:540,y:1265,w:660,h:112,t:T(18,0.4),a:'pop',r:-2,z:6,html:'<div class="tag" style="font-size:72px;background:#E5383B;color:#fff">خدمة جاهزة للبيع</div>'});
// ===================== SUMMARY (dark) =====================
scene(C[19][0]-0.27,'#141414',1);GLITCH.push({t:C[19][0]-0.2});
E({x:540,y:360,w:540,h:160,t:C[19][0],a:'slam',d:0.25,shake:18,sfx:'boom',html:'<div class="tag" style="font-size:116px;background:#FFD23F;color:#141414">الخلاصة</div>'});FLASH.push({t:C[19][0],a:0.45});
E({x:540,y:560,w:940,h:110,t:C[20][0],a:'pop',sh:false,html:'<div class="h" style="font-size:80px;color:#fff">مهارتك القابلة للبيع =</div>'});
[['طلب متكرر','#2A9D8F',repeatSVG(150,'#fff'),'#fff',0],['مشكلة مؤلمة','#E5383B',boltSVG(150).replace('#E5383B','#FFD23F'),'#fff',0.36],['نتيجة سريعة','#FFD23F',watchSVG(130),'#141414',0.7]].forEach(([s,col,ic,tc,f],i)=>{
  E({x:890-i*350,y:860,w:310,h:350,t:T(21,f),a:'drop',d:0.5,r:(i-1)*-3,html:`<div style="width:100%;height:100%;background:${col};border:10px solid #fff;border-radius:26px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">${ic}<div class="h" style="font-size:54px;color:${tc}">${s}</div></div>`});
  if(i<2)E({x:715-i*350,y:860,w:80,h:100,t:T(21,f+0.22),a:'pop',z:3,sh:false,html:'<div class="h" style="font-size:120px;color:#fff">+</div>'});});
E({x:540,y:1190,w:640,h:160,t:C[21][1]-0.2,a:'slam',d:0.25,r:-3,z:5,shake:20,sfx:'boom',html:'<div class="tag" style="font-size:104px;background:#4C9A5B;color:#fff;padding-top:24px">= مهارة بتنباع</div>'});
FLASH.push({t:C[21][1]-0.2,a:0.35,c:'#FFD23F'});PUNCH.push({t:C[21][1]-0.2,amp:0.05});
// ===================== CTA (yellow, rises from bottom) =====================
scene(C[22][0]-0.27,'#FFD23F',1,true);
const o24=C[24][0]-0.05;
E({x:540,y:340,w:700,h:150,t:C[22][0],a:'slam',d:0.25,sh:false,out:o24,sfx:'pop',html:'<div class="h" style="font-size:140px">إذا بدك...</div>'});
E({x:540,y:540,w:640,h:120,t:C[23][0],a:'pop',r:-2,out:o24,html:'<div class="tag" style="font-size:76px;background:#141414;color:#fff">اكتب بالتعليقات</div>'});
E({x:540,y:800,w:940,h:250,t:C[23][0]-0.05,a:'slideUp',d:0.45,out:o24,html:`<div style="width:100%;height:100%;background:#fff;border:9px solid #141414;border-radius:125px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:22px;direction:rtl;position:relative">
 <div class="h ty" style="font-size:150px;padding-top:26px;min-width:10px"></div><div class="caret" style="width:9px;height:130px;background:#E5383B"></div>
 <div style="position:absolute;left:26px;top:26px;width:180px;height:180px;border-radius:50%;background:#E5383B;display:flex;align-items:center;justify-content:center">${svg(90,90,'<path d="M78,45 L14,45 M40,16 L12,45 L40,74" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')}</div></div>`,text:'مهارتي',typeT:T(23,0.32)});
PUNCH.push({t:T(23,0.95),amp:0.05});SFX.push({t:C[23][1]-0.05,k:'ping'});
E({x:540,y:790,w:800,h:900,t:C[24][0],a:'slideUp',d:0.5,r:-1.5,z:2,html:card(`<div style="position:absolute;top:0;left:0;right:0;height:112px;background:#141414;display:flex;align-items:center;justify-content:center"><div class="h" style="font-size:68px;color:#FFD23F;padding-top:10px">ورقة تقييم مهارتك</div></div>
 ${['طلب متكرر؟','مشكلة مؤلمة؟','نتيجة سريعة؟'].map((s,i)=>`<div style="position:absolute;right:50px;top:${150+i*78}px;display:flex;align-items:center;gap:20px;direction:rtl"><div style="width:46px;height:46px;border:6px solid #141414;border-radius:8px;box-sizing:border-box"></div><div class="c" style="font-size:46px">${s}</div></div>`).join('')}
 <div style="position:absolute;left:50px;right:50px;top:400px;height:5px;background:#141414;opacity:.2"></div><div class="h" style="position:absolute;left:0;right:0;top:420px;font-size:50px;color:#3D5A80">التقييم من 10</div>`,torn(800,900,5),'#FFFDF6')});
[0,1,2].forEach(i=>{E({x:867,y:513+i*78,w:60,h:60,t:T(24,0.3+i*0.07),a:'draw',d:0.18,z:4,sh:false,html:chk(60)});SFX.push({t:T(24,0.3+i*0.07),k:'pop'})});
[[0.62,8,'#2A9D8F'],[0.72,6,'#FFD23F'],[0.82,9,'#E5383B']].forEach(([f,v,col],i)=>E({x:540,y:860+i*76,w:640,h:52,t:T(24,f),a:'wipe',d:0.35,z:3,sh:false,html:`<div style="display:flex;align-items:center;gap:16px;direction:rtl;height:100%"><div style="flex:0 0 ${v*50}px;height:38px;background:${col};border-radius:8px;border:4px solid #141414;box-sizing:border-box"></div><div class="h" style="font-size:46px;padding-top:6px">${v}/10</div></div>`}));
['خدمة ١','خدمة ٢','خدمة ٣'].forEach((s,i)=>E({x:790-i*250,y:1150,w:220,h:150,t:C[25][0]+0.1+i*0.22,a:'drop',d:0.5,r:(1-i)*7,z:5,html:card(`<div class="h" style="font-size:58px;padding-top:50px">${s}</div>`,torn(220,150,4),['#BEE3DB','#FFE6A7','#F8C8C8'][i])}));
E({x:540,y:1000,w:700,h:210,t:C[26][0]+0.2,a:'stamp',d:0.22,r:-7,z:9,shake:22,html:'<div class="h" style="font-size:128px;color:#E5383B;border:12px solid #E5383B;border-radius:20px;padding:26px 30px 4px;background:rgba(255,255,255,.85)">مو من الصفر</div>'});
PUNCH.push({t:C[26][0]+0.4,amp:0.05});
// ===================== HUD: 3-segment progress =====================
cur=hud;
const QS=[[C[2][0],C[7][0]],[C[7][0],C[15][0]],[C[15][0],C[19][0]-0.3]];
E({x:540,y:205,w:720,h:36,t:C[2][0],a:'pop',sh:false,float:false,sfx:null,out:C[19][0]-0.3,outKind:'fade',html:`<div style="display:flex;gap:14px;height:100%;direction:rtl">${[0,1,2].map(i=>`<div style="flex:1;border:5px solid #141414;border-radius:18px;background:#fff;overflow:hidden;box-sizing:border-box;box-shadow:0 4px 8px rgba(0,0,0,.25)"><div class="f${i}" style="height:100%;width:0;background:#E5383B;float:right"></div></div>`).join('')}</div>`,
 upd(t,w){QS.forEach(([a,b],i)=>{w.querySelector('.f'+i).style.width=(clamp((t-a)/(b-a))*100).toFixed(1)+'%'})}});
TILT.push([0,0],[C[1][0]-0.18,-2],[C[2][0]-0.3,1.2],[C[5][0]-0.15,-1.5],[C[7][0]-0.27,1],[C[12][0],-1],[C[15][0]-0.27,1.3],[C[17][0],0],[C[19][0]-0.27,-1.2],[C[22][0]-0.27,1],[C[24][0],-0.8]);
}

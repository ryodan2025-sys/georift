// ═══════════════════════════════════════════════════════
//  SHIPS.JS  –  Gemi tanımları, unlock, skin, hangar
// ═══════════════════════════════════════════════════════

const SHIP_DEFS=[
  {id:'vanguard',name:'VANGUARD',desc:'Hızlı ve ölümcül. Az can, yüksek ödül.',
   w:34,h:42,speed:370,lives:2,defaultWeapon:'spread',scoreMultiplier:1.4,
   passive:'combo_bonus',passiveLabel:'⚡ Combo +%30',dashStyle:'blink',unlockScore:0,
   stats:{hiz:5,zirh:2,ates:4},skins:['#00ffcc','#ff6600','#ff00aa']},
  {id:'titan',name:'TITAN',desc:'Ağır zırhlı savaş gemisi. Yavaş ama yıkılmaz.',
   w:44,h:52,speed:200,lives:5,defaultWeapon:'missile',scoreMultiplier:1.0,
   passive:'wave_shield',passiveLabel:'🛡 Her 5 Dalgada Kalkan',dashStyle:'shockwave',unlockScore:3000,
   stats:{hiz:2,zirh:5,ates:3},skins:['#4488ff','#aa44ff','#44ffaa']},
  {id:'ghost',name:'GHOST',desc:'Gizli avcı. Mermilerin %15\'i geçer.',
   w:30,h:40,speed:300,lives:3,defaultWeapon:'laser',scoreMultiplier:1.2,
   passive:'dodge',passiveLabel:'👻 Hayalet Zırhı',dashStyle:'ghost',unlockScore:8000,
   stats:{hiz:4,zirh:3,ates:5},skins:['#cc44ff','#00ffff','#ffff00']},
];

function getUnlockedShips(){
  try{return JSON.parse(localStorage.getItem('gr_unlocked')||'["vanguard"]');}
  catch(e){return['vanguard'];}
}
function saveUnlockedShips(a){try{localStorage.setItem('gr_unlocked',JSON.stringify(a));}catch(e){}}
function checkUnlocks(total){
  const u=getUnlockedShips();let ch=false;
  for(const s of SHIP_DEFS){
    if(!u.includes(s.id)&&total>=s.unlockScore){u.push(s.id);ch=true;showWaveText('🔓 '+s.name+' AÇILDI!');}
  }
  if(ch) saveUnlockedShips(u);
}

let selectedShipId =localStorage.getItem('gr_lastShip')||'vanguard';
let selectedSkinIdx=parseInt(localStorage.getItem('gr_lastSkin')||'0');
function getSelectedShip(){return SHIP_DEFS.find(s=>s.id===selectedShipId)||SHIP_DEFS[0];}
function getShipSkinColor(ship,idx){return(ship.skins||['#00ffcc'])[idx%(ship.skins?.length||1)];}
function saveLastShip(){
  localStorage.setItem('gr_lastShip',selectedShipId);
  localStorage.setItem('gr_lastSkin',String(selectedSkinIdx));
}
function getTotalBestScore(){
  try{const a=JSON.parse(localStorage.getItem('gr_scores')||'[]');return a.length?a[0].s:0;}
  catch(e){return 0;}
}

// ── HANGAR ────────────────────────────────────────────
const HS={active:false,idx:0,skinIdx:0,rot:0,raf:null};

function openHangar(){
  initAudio(); sfxMenuClick();
  HS.active=true;
  HS.idx=Math.max(0,SHIP_DEFS.findIndex(s=>s.id===selectedShipId));
  HS.skinIdx=selectedSkinIdx; HS.rot=0;
  document.getElementById('menuOverlay').classList.add('hidden');
  document.getElementById('hangarOverlay').classList.remove('hidden');
  buildHangarList();
  cancelAnimationFrame(HS.raf);
  (function hl(){if(!HS.active)return;HS.rot+=0.013;drawHangarPreview();HS.raf=requestAnimationFrame(hl);})();
}

function closeHangar(launch){
  HS.active=false; cancelAnimationFrame(HS.raf); HS.raf=null;
  const ship=SHIP_DEFS[HS.idx];
  selectedShipId=ship.id; selectedSkinIdx=HS.skinIdx; saveLastShip();
  document.getElementById('hangarOverlay').classList.add('hidden');
  if(launch){ startGame(); }
  else { document.getElementById('menuOverlay').classList.remove('hidden'); }
}

function buildHangarList(){
  const u=getUnlockedShips();
  const el=document.getElementById('hangarShipList'); el.innerHTML='';
  SHIP_DEFS.forEach((s,i)=>{
    const ok=u.includes(s.id), sel=i===HS.idx;
    const d=document.createElement('div');
    d.className='ship-btn'+(sel?' sel':'')+(!ok?' locked':'');
    d.innerHTML=`<span class="sname">${ok?s.name:'🔒 '+s.name}</span>`
      +(!ok?`<span class="slock">Gerekli: ${s.unlockScore.toLocaleString()}</span>`:'');
    d.addEventListener('click',()=>{
      if(!ok){sfxMenuClick();return;}
      HS.idx=i; HS.skinIdx=0; sfxMenuClick();
      buildHangarList(); updateHangarDetail();
    });
    el.appendChild(d);
  });
  updateHangarDetail();
}

function updateHangarDetail(){
  const s=SHIP_DEFS[HS.idx];
  const ok=getUnlockedShips().includes(s.id);
  document.getElementById('hShipName').textContent=s.name;
  document.getElementById('hShipDesc').textContent=s.desc;
  document.getElementById('hPassive').textContent=s.passiveLabel;
  document.getElementById('hMult').textContent='Çarpan: x'+s.scoreMultiplier.toFixed(1);
  const lbl={hiz:'Hız',zirh:'Zırh',ates:'Ateş'};
  document.getElementById('hStats').innerHTML=Object.entries(s.stats).map(([k,v])=>
    `<div class="hstat-row"><span class="hstat-lbl">${lbl[k]}</span><span class="hstat-bar">${'▓'.repeat(v)}${'░'.repeat(5-v)}</span></div>`
  ).join('');
  const sk=document.getElementById('hangarSkins'); sk.innerHTML='';
  (s.skins||['#00ffcc']).forEach((col,si)=>{
    const b=document.createElement('button');
    b.className='skbtn'+(si===HS.skinIdx?' active':'');
    b.style.cssText=`background:${col};box-shadow:${si===HS.skinIdx?'0 0 10px '+col:'none'}`;
    b.addEventListener('click',()=>{HS.skinIdx=si;sfxMenuClick();updateHangarDetail();});
    sk.appendChild(b);
  });
  const lb=document.getElementById('hangarLaunch');
  lb.disabled=!ok; lb.textContent=ok?'UÇUŞA GEÇ':'🔒 KİLİTLİ';
  document.getElementById('hangarWelcome').textContent='Hoş geldin, '+getSelectedShip().name+' pilotu!';
}

function drawHangarPreview(){
  const el=document.getElementById('hangarCanvas'); if(!el)return;
  const pc=el.getContext('2d');
  pc.clearRect(0,0,el.width,el.height);
  const s=SHIP_DEFS[HS.idx], col=getShipSkinColor(s,HS.skinIdx);
  const cx=el.width/2, cy=el.height/2+8, w=s.w, h=s.h;
  pc.save(); pc.translate(cx,cy); pc.rotate(HS.rot);
  const fH=14+8*Math.sin(Date.now()/80);
  const fG=pc.createLinearGradient(0,h/2,0,h/2+fH);
  fG.addColorStop(0,'rgba(0,200,255,0.9)'); fG.addColorStop(1,'transparent');
  pc.fillStyle=fG; pc.beginPath(); pc.ellipse(0,h/2+fH/2,8,fH/2,0,0,Math.PI*2); pc.fill();
  pc.fillStyle='#0a0a1a'; pc.strokeStyle=col; pc.lineWidth=2.5; pc.shadowColor=col; pc.shadowBlur=20;
  pc.beginPath(); pc.moveTo(0,-h/2); pc.lineTo(w/2,h/2); pc.lineTo(w/3,h/2-8);
  pc.lineTo(0,h/4); pc.lineTo(-w/3,h/2-8); pc.lineTo(-w/2,h/2); pc.closePath(); pc.fill(); pc.stroke();
  pc.fillStyle=col+'22';
  pc.beginPath(); pc.moveTo(-w/3,4); pc.lineTo(-w*.65,h/2); pc.lineTo(-w/4,h/2-8); pc.closePath(); pc.fill(); pc.stroke();
  pc.beginPath(); pc.moveTo(w/3,4); pc.lineTo(w*.65,h/2); pc.lineTo(w/4,h/2-8); pc.closePath(); pc.fill(); pc.stroke();
  pc.fillStyle=col; pc.beginPath(); pc.ellipse(0,-4,7,11,0,0,Math.PI*2); pc.fill();
  pc.restore();
}

// Buton listener'ları (DOM'da statik, güvenli)
document.getElementById('hangarLaunch').addEventListener('click',()=>closeHangar(true));
document.getElementById('hangarBack').addEventListener('click',()=>{sfxMenuClick();closeHangar(false);});

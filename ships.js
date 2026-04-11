// ═══════════════════════════════════════════════════════
//  SHIPS.JS  –  Gemi tanımları, unlock, skin, hangar mantığı
//  HTML artık index.html'de statik olarak mevcut.
// ═══════════════════════════════════════════════════════

const SHIP_DEFS = [
  {
    id:'vanguard', name:'VANGUARD',
    desc:'Hızlı ve ölümcül. Az can, yüksek risk, yüksek ödül.',
    w:34,h:42, speed:370, lives:2,
    defaultWeapon:'spread', scoreMultiplier:1.4,
    passive:'combo_bonus', passiveLabel:'⚡ Combo Bonusu (+%30)',
    dashStyle:'blink', unlockScore:0,
    stats:{hiz:5,zirh:2,ates:4},
    skins:['#00ffcc','#ff6600','#ff00aa'],
  },
  {
    id:'titan', name:'TITAN',
    desc:'Ağır zırhlı savaş gemisi. Yavaş ama yıkılmaz.',
    w:44,h:52, speed:200, lives:5,
    defaultWeapon:'missile', scoreMultiplier:1.0,
    passive:'wave_shield', passiveLabel:'🛡 Her 5 Dalgada Kalkan',
    dashStyle:'shockwave', unlockScore:3000,
    stats:{hiz:2,zirh:5,ates:3},
    skins:['#4488ff','#aa44ff','#44ffaa'],
  },
  {
    id:'ghost', name:'GHOST',
    desc:'Gizli avcı. Mermilerin %15\'i hayaletin içinden geçer.',
    w:30,h:40, speed:300, lives:3,
    defaultWeapon:'laser', scoreMultiplier:1.2,
    passive:'dodge', passiveLabel:'👻 Hayalet Zırhı (%15 dodge)',
    dashStyle:'ghost', unlockScore:8000,
    stats:{hiz:4,zirh:3,ates:5},
    skins:['#cc44ff','#00ffff','#ffff00'],
  },
];

// ── UNLOCK ────────────────────────────────────────────
function getUnlockedShips(){
  try{ return JSON.parse(localStorage.getItem('gr_unlocked')||'["vanguard"]'); }
  catch(e){ return ['vanguard']; }
}
function saveUnlockedShips(arr){
  try{ localStorage.setItem('gr_unlocked',JSON.stringify(arr)); }catch(e){}
}
function checkUnlocks(totalScore){
  const unlocked=getUnlockedShips(); let changed=false;
  for(const ship of SHIP_DEFS){
    if(!unlocked.includes(ship.id)&&totalScore>=ship.unlockScore){
      unlocked.push(ship.id); changed=true;
      showWaveText('🔓 '+ship.name+' AÇILDI!');
    }
  }
  if(changed) saveUnlockedShips(unlocked);
}

// ── SEÇİLİ GEMİ & SKİN ───────────────────────────────
let selectedShipId  = localStorage.getItem('gr_lastShip')||'vanguard';
let selectedSkinIdx = parseInt(localStorage.getItem('gr_lastSkin')||'0');

function getSelectedShip(){ return SHIP_DEFS.find(s=>s.id===selectedShipId)||SHIP_DEFS[0]; }
function getShipSkinColor(ship,idx){ return (ship.skins||['#00ffcc'])[idx%(ship.skins?.length||1)]; }
function saveLastShip(){
  localStorage.setItem('gr_lastShip',selectedShipId);
  localStorage.setItem('gr_lastSkin',String(selectedSkinIdx));
}
function getTotalBestScore(){
  try{ const a=JSON.parse(localStorage.getItem('gr_scores')||'[]'); return a.length?a[0].s:0; }
  catch(e){ return 0; }
}

// ── HANGAR STATE ──────────────────────────────────────
const hangarState={active:false,selectedIdx:0,skinIdx:0,rotation:0,raf:null};

function openHangar(){
  initAudio(); sfxMenuClick();
  hangarState.active=true;
  hangarState.selectedIdx=Math.max(0,SHIP_DEFS.findIndex(s=>s.id===selectedShipId));
  hangarState.skinIdx=selectedSkinIdx;
  hangarState.rotation=0;
  document.getElementById('menuOverlay').classList.add('hidden');
  document.getElementById('hangarOverlay').classList.remove('hidden');
  renderHangarUI();
  cancelAnimationFrame(hangarState.raf);
  (function hl(){
    if(!hangarState.active) return;
    hangarState.rotation+=0.013;
    drawHangarPreview();
    hangarState.raf=requestAnimationFrame(hl);
  })();
}

function closeHangar(launch){
  hangarState.active=false;
  cancelAnimationFrame(hangarState.raf); hangarState.raf=null;
  const ship=SHIP_DEFS[hangarState.selectedIdx];
  selectedShipId=ship.id;
  selectedSkinIdx=hangarState.skinIdx;
  saveLastShip();
  document.getElementById('hangarOverlay').classList.add('hidden');
  if(launch){ startGame(); }
  else { document.getElementById('menuOverlay').classList.remove('hidden'); }
}

function renderHangarUI(){
  const unlocked=getUnlockedShips();
  const listEl=document.getElementById('hangarShipList');
  listEl.innerHTML='';
  SHIP_DEFS.forEach((ship,idx)=>{
    const ok=unlocked.includes(ship.id);
    const sel=idx===hangarState.selectedIdx;
    const div=document.createElement('div');
    div.className='hangar-ship-btn'+(sel?' selected':'')+(!ok?' locked':'');
    div.innerHTML=`<span class="hship-name">${ok?ship.name:'🔒 '+ship.name}</span>`
      +(!ok?`<span class="hship-lock">Gerekli: ${ship.unlockScore.toLocaleString()} puan</span>`:'');
    div.addEventListener('click',()=>{
      if(!ok) return;
      hangarState.selectedIdx=idx;
      hangarState.skinIdx=0;
      renderHangarUI();
    });
    listEl.appendChild(div);
  });
  renderHangarDetail();
}

function renderHangarDetail(){
  const ship=SHIP_DEFS[hangarState.selectedIdx];
  const ok=getUnlockedShips().includes(ship.id);
  document.getElementById('hangarShipName').textContent=ship.name;
  document.getElementById('hangarShipDesc').textContent=ship.desc;
  document.getElementById('hangarPassive').textContent=ship.passiveLabel;
  document.getElementById('hangarMult').textContent='Skor Çarpanı: x'+ship.scoreMultiplier.toFixed(1);
  const statLabels={hiz:'Hız',zirh:'Zırh',ates:'Ateş'};
  document.getElementById('hangarStats').innerHTML=Object.entries(ship.stats).map(([k,v])=>
    `<div class="stat-row"><span class="stat-label">${statLabels[k]}</span><span class="stat-bar">${'▓'.repeat(v)}${'░'.repeat(5-v)}</span></div>`
  ).join('');
  const skinEl=document.getElementById('hangarSkins');
  skinEl.innerHTML='';
  (ship.skins||['#00ffcc']).forEach((col,si)=>{
    const b=document.createElement('button');
    b.className='skin-btn'+(si===hangarState.skinIdx?' skin-active':'');
    b.style.background=col;
    b.style.boxShadow=si===hangarState.skinIdx?`0 0 10px ${col}`:'none';
    b.addEventListener('click',()=>{ hangarState.skinIdx=si; renderHangarDetail(); sfxMenuClick(); });
    skinEl.appendChild(b);
  });
  const launchBtn=document.getElementById('hangarLaunch');
  launchBtn.disabled=!ok;
  launchBtn.textContent=ok?'UÇUŞA GEÇ':'🔒 KİLİTLİ';
  document.getElementById('hangarWelcome').textContent='Hoş geldin, '+getSelectedShip().name+' pilotu!';
}

function drawHangarPreview(){
  const pc_el=document.getElementById('hangarCanvas'); if(!pc_el) return;
  const pc=pc_el.getContext('2d');
  const W=pc_el.width,H=pc_el.height;
  pc.clearRect(0,0,W,H);
  const ship=SHIP_DEFS[hangarState.selectedIdx];
  const col=getShipSkinColor(ship,hangarState.skinIdx);
  const cx=W/2,cy=H/2+8,w=ship.w,h=ship.h;
  pc.save(); pc.translate(cx,cy); pc.rotate(hangarState.rotation);
  // Alev
  const fH=14+8*Math.sin(Date.now()/80);
  const fG=pc.createLinearGradient(0,h/2,0,h/2+fH);
  fG.addColorStop(0,'rgba(0,200,255,0.9)'); fG.addColorStop(1,'transparent');
  pc.fillStyle=fG; pc.beginPath(); pc.ellipse(0,h/2+fH/2,8,fH/2,0,0,Math.PI*2); pc.fill();
  // Gövde
  pc.fillStyle='#0a0a1a'; pc.strokeStyle=col; pc.lineWidth=2.5;
  pc.shadowColor=col; pc.shadowBlur=20;
  pc.beginPath(); pc.moveTo(0,-h/2); pc.lineTo(w/2,h/2); pc.lineTo(w/3,h/2-8);
  pc.lineTo(0,h/4); pc.lineTo(-w/3,h/2-8); pc.lineTo(-w/2,h/2); pc.closePath(); pc.fill(); pc.stroke();
  // Kanatlar
  pc.fillStyle=col+'22';
  pc.beginPath(); pc.moveTo(-w/3,4); pc.lineTo(-w*0.65,h/2); pc.lineTo(-w/4,h/2-8); pc.closePath(); pc.fill(); pc.stroke();
  pc.beginPath(); pc.moveTo(w/3,4); pc.lineTo(w*0.65,h/2); pc.lineTo(w/4,h/2-8); pc.closePath(); pc.fill(); pc.stroke();
  // Kokpit
  pc.fillStyle=col; pc.beginPath(); pc.ellipse(0,-4,7,11,0,0,Math.PI*2); pc.fill();
  pc.restore();
}

// ── BUTON LISTENER'LARI (DOM hazır olduğunda bağlan) ──
document.getElementById('hangarLaunch').addEventListener('click',()=>closeHangar(true));
document.getElementById('hangarBack').addEventListener('click',()=>{ sfxMenuClick(); closeHangar(false); });

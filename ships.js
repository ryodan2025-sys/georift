// ═══════════════════════════════════════════════════════
//  SHIPS.JS  –  Gemi tanımları, unlock, skin, hangar
//  Yeni gemi eklemek için SHIP_DEFS dizisine obje ekle.
// ═══════════════════════════════════════════════════════

// ── GEMİ TANIMLARI ────────────────────────────────────
// stats: 1-5 arası (bar chart için)
const SHIP_DEFS = [
  {
    id: 'vanguard',
    name: 'VANGUARD',
    desc: 'Hızlı ve ölümcül. Az canı olan için yüksek risk.',
    w: 34, h: 42,
    speed: 370,
    lives: 2,
    defaultWeapon: 'spread',
    scoreMultiplier: 1.4,
    passive: 'combo_bonus',       // combo'dan %30 ekstra puan
    passiveLabel: '⚡ Combo Bonusu',
    dashStyle: 'blink',           // yıldız izli blink
    unlockScore: 0,               // baştan açık
    stats: { hiz:5, zirh:2, ates:4 },
    skins: ['#00ffcc','#ff6600','#ff00aa'],
  },
  {
    id: 'titan',
    name: 'TITAN',
    desc: 'Ağır zırhlı savaş gemisi. Yavaş ama yıkılmaz.',
    w: 44, h: 52,
    speed: 200,
    lives: 5,
    defaultWeapon: 'missile',
    scoreMultiplier: 1.0,
    passive: 'wave_shield',       // her 5 dalgada bir kalkan
    passiveLabel: '🛡 Dalga Kalkanı',
    dashStyle: 'shockwave',       // kalkan patlaması
    unlockScore: 3000,
    stats: { hiz:2, zirh:5, ates:3 },
    skins: ['#4488ff','#aa44ff','#44ffaa'],
  },
  {
    id: 'ghost',
    name: 'GHOST',
    desc: 'Gizli avcı. Bazı mermiler hayaletin içinden geçer.',
    w: 30, h: 40,
    speed: 300,
    lives: 3,
    defaultWeapon: 'laser',
    scoreMultiplier: 1.2,
    passive: 'dodge',             // %15 mermi geçirme
    passiveLabel: '👻 Hayalet Zırhı',
    dashStyle: 'ghost',           // yarı saydam yanıp sönme
    unlockScore: 8000,
    stats: { hiz:4, zirh:3, ates:5 },
    skins: ['#cc44ff','#00ffff','#ffff00'],
  },
];

// ── UNLOCK SİSTEMİ ────────────────────────────────────
function getUnlockedShips(){
  try { return JSON.parse(localStorage.getItem('gr_unlocked') || '["vanguard"]'); }
  catch(e){ return ['vanguard']; }
}
function saveUnlockedShips(arr){
  try { localStorage.setItem('gr_unlocked', JSON.stringify(arr)); } catch(e){}
}
function checkUnlocks(totalScore){
  const unlocked = getUnlockedShips();
  let changed = false;
  for(const ship of SHIP_DEFS){
    if(!unlocked.includes(ship.id) && totalScore >= ship.unlockScore){
      unlocked.push(ship.id);
      changed = true;
      showWaveText(`🔓 ${ship.name} AÇILDI!`);
    }
  }
  if(changed) saveUnlockedShips(unlocked);
}

// ── SEÇİLİ GEMİ & SKİN ───────────────────────────────
let selectedShipId   = localStorage.getItem('gr_lastShip') || 'vanguard';
let selectedSkinIdx  = parseInt(localStorage.getItem('gr_lastSkin') || '0');

function getSelectedShip(){ return SHIP_DEFS.find(s=>s.id===selectedShipId) || SHIP_DEFS[0]; }
function getShipSkinColor(ship, idx){
  return (ship.skins || ['#00ffcc'])[idx % (ship.skins?.length || 1)];
}
function saveLastShip(){
  localStorage.setItem('gr_lastShip', selectedShipId);
  localStorage.setItem('gr_lastSkin', String(selectedSkinIdx));
}

// ── TOPLAM SKOR (unlock için) ─────────────────────────
function getTotalBestScore(){
  try {
    const arr = JSON.parse(localStorage.getItem('gr_scores') || '[]');
    return arr.length ? arr[0].s : 0;
  } catch(e){ return 0; }
}

// ═══════════════════════════════════════════════════════
//  HANGAR EKRani  –  canvas üzerine çizilen seçim ekranı
// ═══════════════════════════════════════════════════════
let hangarState = {
  active: false,
  selectedIdx: 0,
  skinIdx: 0,
  rotation: 0,
  raf: null,
};

function openHangar(){
  hangarState.active = true;
  hangarState.selectedIdx = SHIP_DEFS.findIndex(s=>s.id===selectedShipId) || 0;
  hangarState.skinIdx = selectedSkinIdx;
  hangarState.rotation = 0;

  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('hangarOverlay').classList.remove('hidden');

  renderHangarUI();
  if(hangarState.raf) cancelAnimationFrame(hangarState.raf);
  (function hangarLoop(){
    if(!hangarState.active){ return; }
    hangarState.rotation += 0.012;
    drawHangarPreview();
    hangarState.raf = requestAnimationFrame(hangarLoop);
  })();
}

function closeHangar(launch){
  hangarState.active = false;
  if(hangarState.raf){ cancelAnimationFrame(hangarState.raf); hangarState.raf=null; }
  document.getElementById('hangarOverlay').classList.add('hidden');

  // Son seçimi kaydet
  const ship = SHIP_DEFS[hangarState.selectedIdx];
  selectedShipId  = ship.id;
  selectedSkinIdx = hangarState.skinIdx;
  saveLastShip();

  if(launch){
    startGame();
  } else {
    document.getElementById('overlay').classList.remove('hidden');
  }
}

function renderHangarUI(){
  const unlocked = getUnlockedShips();
  const totalBest = getTotalBestScore();
  const hEl = document.getElementById('hangarShipList');
  hEl.innerHTML = '';

  SHIP_DEFS.forEach((ship, idx)=>{
    const isUnlocked = unlocked.includes(ship.id);
    const isSelected = idx === hangarState.selectedIdx;
    const btn = document.createElement('div');
    btn.className = 'hangar-ship-btn' + (isSelected?' selected':'') + (!isUnlocked?' locked':'');
    btn.innerHTML = `
      <span class="hship-name">${isUnlocked ? ship.name : '🔒 '+ship.name}</span>
      ${!isUnlocked ? `<span class="hship-lock">Gerekli: ${ship.unlockScore.toLocaleString()} skor</span>` : ''}
    `;
    btn.addEventListener('click', ()=>{
      if(!isUnlocked) return;
      hangarState.selectedIdx = idx;
      hangarState.skinIdx = selectedSkinIdx; // sıfırla skin
      renderHangarUI();
      renderHangarDetail();
    });
    hEl.appendChild(btn);
  });

  renderHangarDetail();
}

function renderHangarDetail(){
  const ship = SHIP_DEFS[hangarState.selectedIdx];
  const unlocked = getUnlockedShips();
  const isUnlocked = unlocked.includes(ship.id);

  document.getElementById('hangarShipName').textContent = ship.name;
  document.getElementById('hangarShipDesc').textContent = ship.desc;
  document.getElementById('hangarPassive').textContent  = ship.passiveLabel;
  document.getElementById('hangarMult').textContent     = `Skor Çarpanı: x${ship.scoreMultiplier.toFixed(1)}`;

  // Stat barlar
  const statEl = document.getElementById('hangarStats');
  const statLabels = {hiz:'Hız', zirh:'Zırh', ates:'Ateş'};
  statEl.innerHTML = Object.entries(ship.stats).map(([k,v])=>`
    <div class="stat-row">
      <span class="stat-label">${statLabels[k]}</span>
      <span class="stat-bar">${'▓'.repeat(v)}${'░'.repeat(5-v)}</span>
    </div>
  `).join('');

  // Skin butonları
  const skinEl = document.getElementById('hangarSkins');
  skinEl.innerHTML = '';
  (ship.skins||['#00ffcc']).forEach((col, si)=>{
    const b = document.createElement('button');
    b.className = 'skin-btn' + (si===hangarState.skinIdx?' skin-active':'');
    b.style.background = col;
    b.style.boxShadow = si===hangarState.skinIdx ? `0 0 10px ${col}` : 'none';
    b.addEventListener('click',()=>{ hangarState.skinIdx=si; renderHangarDetail(); });
    skinEl.appendChild(b);
  });

  // Launch butonu
  const launchBtn = document.getElementById('hangarLaunch');
  launchBtn.disabled = !isUnlocked;
  launchBtn.textContent = isUnlocked ? 'UÇUŞA GEÇ' : '🔒 KİLİTLİ';

  // Hoş geldin mesajı
  const lastShipName = getSelectedShip().name;
  document.getElementById('hangarWelcome').textContent =
    `Hoş geldin, ${lastShipName} pilotu!`;
}

// ── HANGAR KANVASı – Dönen gemi önizlemesi ────────────
function drawHangarPreview(){
  const previewCanvas = document.getElementById('hangarCanvas');
  if(!previewCanvas) return;
  const pc = previewCanvas.getContext('2d');
  const W = previewCanvas.width, H = previewCanvas.height;

  pc.clearRect(0,0,W,H);

  const ship = SHIP_DEFS[hangarState.selectedIdx];
  const col  = getShipSkinColor(ship, hangarState.skinIdx);
  const cx=W/2, cy=H/2+10;
  const rot = hangarState.rotation;

  pc.save();
  pc.translate(cx, cy);
  pc.rotate(rot);

  // Motor alevi (dönen gemide aşağıya baksın)
  const flameH = 16 + 8*Math.sin(Date.now()/80);
  const fGrad = pc.createLinearGradient(0, ship.h/2, 0, ship.h/2+flameH);
  fGrad.addColorStop(0, 'rgba(0,200,255,0.9)');
  fGrad.addColorStop(0.5,'rgba(0,120,255,0.5)');
  fGrad.addColorStop(1, 'transparent');
  pc.fillStyle = fGrad;
  pc.beginPath();
  pc.ellipse(0, ship.h/2+flameH/2, 8, flameH/2, 0, 0, Math.PI*2);
  pc.fill();

  // Gemi gövdesi
  const w=ship.w, h=ship.h;
  pc.fillStyle='#0a0a1a';
  pc.strokeStyle=col;
  pc.lineWidth=2.5;
  pc.shadowColor=col;
  pc.shadowBlur=22;
  pc.beginPath();
  pc.moveTo(0,-h/2);
  pc.lineTo(w/2, h/2);
  pc.lineTo(w/3, h/2-8);
  pc.lineTo(0,   h/4);
  pc.lineTo(-w/3,h/2-8);
  pc.lineTo(-w/2,h/2);
  pc.closePath();
  pc.fill();
  pc.stroke();

  // Kanat
  pc.fillStyle=col+'22';
  pc.beginPath(); pc.moveTo(-w/3,4); pc.lineTo(-w*0.65,h/2); pc.lineTo(-w/4,h/2-8); pc.closePath(); pc.fill(); pc.stroke();
  pc.beginPath(); pc.moveTo( w/3,4); pc.lineTo( w*0.65,h/2); pc.lineTo( w/4,h/2-8); pc.closePath(); pc.fill(); pc.stroke();

  // Kokpit
  pc.fillStyle=col;
  pc.beginPath(); pc.ellipse(0,-4,7,11,0,0,Math.PI*2); pc.fill();

  pc.restore();
}

// ── HTML INJECT (hangar overlay) ─────────────────────
// Bu fonksiyonu index.html yüklendiğinde çağır
function injectHangarHTML(){
  const div = document.createElement('div');
  div.id = 'hangarOverlay';
  div.className = 'hidden';
  div.innerHTML = `
    <div class="hangar-wrap">
      <div class="hangar-header">
        <div class="title-sub">— HANGAR —</div>
        <div id="hangarWelcome" class="hangar-welcome"></div>
      </div>
      <div class="hangar-body">
        <div class="hangar-left">
          <div id="hangarShipList"></div>
        </div>
        <div class="hangar-center">
          <canvas id="hangarCanvas" width="160" height="160"></canvas>
          <div id="hangarSkins" class="hangar-skins"></div>
        </div>
        <div class="hangar-right">
          <div id="hangarShipName" class="hangar-ship-name"></div>
          <div id="hangarShipDesc" class="hangar-ship-desc"></div>
          <div id="hangarPassive" class="hangar-passive"></div>
          <div id="hangarMult" class="hangar-mult"></div>
          <div id="hangarStats" class="hangar-stats"></div>
        </div>
      </div>
      <div class="hangar-footer">
        <button class="btn" id="hangarLaunch">UÇUŞA GEÇ</button>
        <button class="btn btn-back" id="hangarBack">GERİ</button>
      </div>
    </div>
  `;
  document.getElementById('gameWrapper').appendChild(div);

  document.getElementById('hangarLaunch').addEventListener('click',()=>closeHangar(true));
  document.getElementById('hangarBack').addEventListener('click',()=>closeHangar(false));
}

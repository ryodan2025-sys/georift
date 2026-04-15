// ═══════════════════════════════════════════════════════
//  ENVIRONMENT.JS  –  Yıldızlar, asteroitler, partiküller  v8.1
// ═══════════════════════════════════════════════════════

// ── YILDIZ KATMANLARı (3 derinlik) ───────────────────
// Layer 0: çok uzak, küçük, yavaş, soluk
// Layer 1: orta mesafe
// Layer 2: yakın, büyük, hızlı, parlak
let starLayers = [];

function initStars(){
  stars = []; // eski uyumluluk
  starLayers = [
    [], // uzak
    [], // orta
    [], // yakın
  ];
  const counts = [90, 50, 18];
  const speeds = [0.04, 0.14, 0.36];
  const sizes  = [0.35, 0.9, 1.8];
  const alphas = [0.28, 0.55, 0.85];

  for(let li=0; li<3; li++){
    for(let i=0; i<counts[li]; i++){
      starLayers[li].push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: sizes[li] * (0.7 + Math.random()*0.6),
        speed: speeds[li] * (0.8 + Math.random()*0.4),
        baseAlpha: alphas[li],
        twinkle: Math.random()*Math.PI*2,
        twinkleSpeed: 0.4 + Math.random()*1.2,
        // Uzak katmana %8 renkli yıldız
        color: (li===0 && Math.random()<0.08) ? (Math.random()<0.5 ? '#aaccff' : '#ffccaa') : '#ffffff',
      });
    }
  }
  // Eski stars dizisini doldur (updateStars uyumluluğu)
  stars = starLayers.flat();
}

function updateStars(dt){
  const s = dt/1000;
  for(let li=0; li<3; li++){
    for(const st of starLayers[li]){
      st.y += st.speed * dt * 60/1000;
      st.twinkle += st.twinkleSpeed * s;
      if(st.y > canvas.height + 4){
        st.y = -4;
        st.x = Math.random()*canvas.width;
      }
    }
  }
}

function drawStars(){
  for(let li=0; li<3; li++){
    for(const st of starLayers[li]){
      const flicker = 0.7 + 0.3 * Math.sin(st.twinkle);
      ctx.globalAlpha = st.baseAlpha * flicker;
      ctx.fillStyle = st.color;
      // Yakın katmanda küçük cross (artı) şekli
      if(li===2 && st.r > 2){
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha *= 0.35;
        ctx.fillRect(st.x-st.r*2, st.y-0.5, st.r*4, 1);
        ctx.fillRect(st.x-0.5, st.y-st.r*2, 1, st.r*4);
      } else {
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI*2); ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ── PARTİKÜL HAVUZU (FPS FİX) ────────────────────────
// Havuz sistemi: new obje yaratmak yerine hazır havuzdan al
const PARTICLE_POOL_SIZE = 400;
const _pool = [];
for(let i=0; i<PARTICLE_POOL_SIZE; i++){
  _pool.push({x:0,y:0,vx:0,vy:0,life:0,decay:1,r:1,color:'#fff',_active:false});
}
let _poolHead = 0;

function _getParticle(){
  // Havuzda ilk boş olanı bul (döngüsel)
  for(let i=0; i<PARTICLE_POOL_SIZE; i++){
    const idx = (_poolHead + i) % PARTICLE_POOL_SIZE;
    if(!_pool[idx]._active){
      _poolHead = (idx+1) % PARTICLE_POOL_SIZE;
      return _pool[idx];
    }
  }
  // Havuz doluysa en eski aktif olanı geri dön
  const p = _pool[_poolHead];
  _poolHead = (_poolHead+1) % PARTICLE_POOL_SIZE;
  return p;
}

// CAP: tek bir explode çağrısında MAX 18 partikül
const EXPLODE_MAX = 18;

function explode(x, y, color, count=20){
  const capped = Math.min(count, EXPLODE_MAX);
  // Aynı kareye çok fazla partikül eklenmesini engelle
  let activeCount = 0;
  for(const p of _pool) if(p._active) activeCount++;
  // Havuz %80+ doluysa yeni ekleme yapma
  if(activeCount > PARTICLE_POOL_SIZE * 0.80) return;

  for(let i=0; i<capped; i++){
    const angle = Math.random()*Math.PI*2;
    const speed = Math.random()*180 + 40;
    const p = _getParticle();
    p.x = x; p.y = y;
    p.vx = Math.cos(angle)*speed;
    p.vy = Math.sin(angle)*speed;
    p.life = 1;
    p.decay = Math.random()*1.8 + 1.0;
    p.r = Math.random()*3 + 0.8;
    p.color = color;
    p._active = true;
  }
  // Global particles dizisi havuzdaki aktif partikülleri gösterir
  particles = _pool.filter(p=>p._active);
}

// particles dizisini havuzla senkronize tutan güncelleme
function updateParticles(s){
  for(const p of _pool){
    if(!p._active) continue;
    p.x += p.vx*s; p.y += p.vy*s;
    p.vx *= 0.93; p.vy *= 0.93;
    p.life -= p.decay*s;
    if(p.life <= 0) p._active = false;
  }
  particles = _pool.filter(p=>p._active);
}

// ── ASTEROİTLER ──────────────────────────────────────
function spawnAsteroid(){
  const r=18+Math.random()*22;
  asteroids.push({x:r+Math.random()*(canvas.width-r*2),y:-r*2,r,hp:2,maxHp:2,
    vy:80+Math.random()*60,vx:(Math.random()-0.5)*40,rot:0,rotSpeed:(Math.random()-0.5)*2,
    points:Array.from({length:8},(_,i)=>{const a=i/8*Math.PI*2;return{a,r:r*(0.7+Math.random()*0.5)};})
  });
}

function drawAsteroid(a){
  ctx.save();
  ctx.translate(a.x,a.y); ctx.rotate(a.rot);
  ctx.fillStyle='#554433'; ctx.strokeStyle='#aa8855'; ctx.lineWidth=2;
  ctx.shadowColor='#aa8855'; ctx.shadowBlur=6;
  ctx.beginPath();
  a.points.forEach((p,i)=>{ const x=Math.cos(p.a)*p.r,y=Math.sin(p.a)*p.r; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ── POWER-UPLAR ──────────────────────────────────────
const POWERUP_TYPES=[
  {type:'shield',color:'#00aaff',label:'🛡'},
  {type:'rapid', color:'#ffcc00',label:'⚡'},
  {type:'life',  color:'#ff4466',label:'❤'},
  {type:'weapon',color:'#aa44ff',label:'🔫'},
];

function spawnPowerup(x,y){
  if(Math.random()>0.28) return;
  const t=POWERUP_TYPES[Math.floor(Math.random()*POWERUP_TYPES.length)];
  powerups.push({...t,x,y,vy:90,r:15});
}

function applyPowerup(p){
  explode(p.x,p.y,p.color,10); // azaltıldı
  try{sfxPowerup();}catch(e){}
  if(p.type==='shield'){ shieldActive=true; setTimeout(()=>shieldActive=false,6000); }
  else if(p.type==='rapid'){ rapidFire=5000; }
  else if(p.type==='life'){ lives=Math.min(lives+1,5); renderLives(); }
  else if(p.type==='weapon'){ applyWeaponPowerup(); }
}

function drawPowerups(){
  for(const p of powerups){
    ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=14;ctx.strokeStyle=p.color;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=0.16+0.08*Math.sin(Date.now()/200);ctx.fillStyle=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.font=`${p.r*1.3}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.label,p.x,p.y);ctx.restore();
  }
}

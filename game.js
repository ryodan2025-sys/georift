// ═══════════════════════════════════════════════════════
//  GAME.JS  –  Ana döngü, oyun durumu, update & draw
//  Diğer modüller: ships.js, player.js, weapons.js,
//  enemies.js, passives.js, environment.js,
//  missions.js, scoreboard.js, input.js
// ═══════════════════════════════════════════════════════

const canvas    = document.getElementById('c');
const ctx       = canvas.getContext('2d');
const wrapper   = document.getElementById('gameWrapper');
const jBase     = document.getElementById('joystickBase');
const jKnob     = document.getElementById('joystickKnob');
const touchZone = document.getElementById('touchZone');
const slowFlash = document.getElementById('slowmoFlash');

// ── SCANLINE PATERNİ ──────────────────────────────────
let scanlinePattern=null;
function buildScanlinePattern(){
  const off=document.createElement('canvas'); off.width=2; off.height=3;
  const c=off.getContext('2d'); c.fillStyle='#000'; c.fillRect(0,2,2,1);
  scanlinePattern=ctx.createPattern(off,'repeat');
}
function resize(){
  const W=window.innerWidth, H=window.innerHeight;
  wrapper.style.width=W+'px'; wrapper.style.height=H+'px';
  canvas.width=W; canvas.height=H;
  buildScanlinePattern();
  if(stars&&stars.length) initStars();
}
setTimeout(resize,0);
window.addEventListener('resize',resize);
if(window.visualViewport) window.visualViewport.addEventListener('resize',resize);

// ── OYUN DURUMU ───────────────────────────────────────
let state='menu';
let score=0, wave=1, lives=3;
let enemies=[], bullets=[], eBullets=[], particles=[], powerups=[], stars=[], asteroids=[];
let player, lastTime=0, shootCooldown=0, enemySpawnTimer=0;
let bossActive=false, boss=null;
let waveEnemiesLeft=0, waveKilled=0;
let invincible=0, shieldActive=false, rapidFire=0;
let wavePhase='spawning', waveEnemyCount=0, waveSpawnInterval=2000, waveCooldown=0;
let combo=0, comboTimer=0;
let currentWeapon='standard', weaponTimer=0;
let dashCooldown=0, dashActive=0, dashVx=0, dashVy=0;
let slowmo=0, shakeAmt=0, shipLevel=1;
let sessionKills=0;
let asteroidTimer=0;

// ── ÇARPIŞMA ─────────────────────────────────────────
function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){
  return ax-aw/2<bx+bw/2&&ax+aw/2>bx-bw/2&&ay-ah/2<by+bh/2&&ay+ah/2>by-bh/2;
}
function circleRect(cx,cy,cr,rx,ry,rw,rh){
  return Math.abs(cx-rx)<rw/2+cr&&Math.abs(cy-ry)<rh/2+cr;
}

// ── COMBO ────────────────────────────────────────────
function addCombo(){ combo++; comboTimer=2500; updateComboUI(); if(combo>=8) checkDailyMission('combo8',1); }
function resetCombo(){ combo=0; comboTimer=0; updateComboUI(); }
function updateComboUI(){
  const el=document.getElementById('comboEl');
  if(combo>=2){
    el.textContent=`x${combo} COMBO!`; el.style.opacity='1';
    el.style.fontSize=`clamp(${12+combo}px,${3+combo*0.5}vw,${20+combo*2}px)`;
    el.style.color=combo>=8?'#ff0088':combo>=4?'#ff8800':'#ffcc00';
    el.style.textShadow=`0 0 15px ${combo>=8?'#ff0088':combo>=4?'#ff8800':'#ffcc00'}`;
  } else { el.style.opacity='0'; }
}
function comboMultiplier(){ return 1+Math.floor(combo/2)*0.5; }

// ── EKRAN SARSINTISI & YAVAŞLAMA ─────────────────────
function triggerShake(amt){ shakeAmt=Math.min(amt,6); }
function triggerSlowmo(dur){ slowmo=dur; slowFlash.style.background='rgba(255,255,255,0.08)'; setTimeout(()=>slowFlash.style.background='rgba(255,255,255,0)',120); }

// ── UI ───────────────────────────────────────────────
function renderLives(){
  const bar=document.getElementById('livesBar'); bar.innerHTML='';
  for(let i=0;i<lives;i++){const h=document.createElement('span');h.className='heart';h.textContent='♥';bar.appendChild(h);}
}

function showWaveText(text){
  const el=document.getElementById('wave-indicator'); el.textContent=text; el.style.opacity='1';
  setTimeout(()=>el.style.opacity='0',2000);
}

// ── DALGA SİSTEMİ ─────────────────────────────────────
function startWave(){
  waveEnemyCount=5+wave*2; waveKilled=0; waveEnemiesLeft=waveEnemyCount;
  waveSpawnInterval=Math.max(500,1700-wave*70); enemySpawnTimer=0; wavePhase='spawning';
  showWaveText(`DALGA ${wave}`);
}

// ── OYUNCU HASAR / ÖLÜM ───────────────────────────────
function hitPlayer(){
  if(invincible>0) return;
  lives--; renderLives(); invincible=1900; resetCombo();
  explode(player.x,player.y,'#ff4466',16); triggerShake(4);
  if(lives<=0) gameOver();
}

function gameOver(){
  saveScore(score,wave);
  state='menu';
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('overlayScore').style.display='block';
  document.getElementById('overlayScore').textContent=`SKOR: ${score.toLocaleString()}\nDALGA: ${wave}  |  KİLL: ${sessionKills}`;
  const sb=document.getElementById('scoreboardEl');
  sb.style.display='block'; sb.textContent=renderScoreboard();
  document.getElementById('startBtn').textContent='YENİDEN OYNA';
  jBase.style.display='none'; jKnob.style.display='none';
}

// ── OYUNU BAŞLAT ──────────────────────────────────────
function startGame(){
  const ship = getSelectedShip();
  score=0; wave=1; lives=ship.lives; sessionKills=0;
  enemies=[]; bullets=[]; eBullets=[]; particles=[]; powerups=[]; asteroids=[];
  player=createPlayer(); shootCooldown=0; invincible=0; shieldActive=false; rapidFire=0;
  bossActive=false; boss=null; wavePhase='spawning';
  combo=0; comboTimer=0; weaponTimer=0; asteroidTimer=0;
  dashCooldown=0; dashActive=0; slowmo=0; shakeAmt=0; shipLevel=1;
  dailyRewardsGiven={};
  passiveWaveTracker=0;

  // Geminin başlangıç silahı
  currentWeapon = ship.defaultWeapon || 'standard';
  document.getElementById('weaponEl').textContent=WEAPON_NAMES[currentWeapon];
  document.getElementById('weaponEl').style.color=WEAPON_COLORS[currentWeapon];

  state='playing';
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('scoreEl').textContent='0';
  document.getElementById('waveEl').textContent='1';
  renderLives(); initStars(); startWave(); renderDailyUI();
  lastTime=performance.now();
  requestAnimationFrame(loop);
}

// Menü "BAŞLAT" butonu → Hangar açar
document.getElementById('startBtn').addEventListener('click',()=>{
  openHangar();
});

// ── ANA DÖNGÜ ─────────────────────────────────────────
function loop(ts){
  if(state!=='playing') return;
  const rawDt=Math.min(ts-lastTime,50); lastTime=ts;
  const dt=slowmo>0?rawDt*0.35:rawDt;
  if(slowmo>0) slowmo-=rawDt;
  update(dt,rawDt);
  draw();
  requestAnimationFrame(loop);
}

// ── GÜNCELLEME ────────────────────────────────────────
function update(dt, rawDt){
  const ms=dt, s=dt/1000;

  updateStars(dt);
  if(shakeAmt>0) shakeAmt*=0.82;

  // Silah zamanlayıcısı
  if(weaponTimer>0){ weaponTimer-=rawDt; if(weaponTimer<=0) resetWeapon(); }
  if(rapidFire>0) rapidFire-=rawDt;

  // Combo zamanlayıcısı
  if(comboTimer>0){ comboTimer-=rawDt; if(comboTimer<=0) resetCombo(); }

  // Dash
  if(dashCooldown>0) dashCooldown-=rawDt;
  if(dashActive>0){
    dashActive-=rawDt;
    player.x+=dashVx*700*s;
    player.y+=dashVy*700*s;
  }

  // Oyuncu hareketi
  let mx=0,my=0;
  if(keys['ArrowLeft']||keys['KeyA']) mx-=1;
  if(keys['ArrowRight']||keys['KeyD']) mx+=1;
  if(keys['ArrowUp']||keys['KeyW']) my-=1;
  if(keys['ArrowDown']||keys['KeyS']) my+=1;
  if(joystick.active){mx+=joystick.dx;my+=joystick.dy;}
  const mLen=Math.hypot(mx,my); if(mLen>1){mx/=mLen;my/=mLen;}
  if(dashActive<=0){ player.x+=mx*player.speed*s; player.y+=my*player.speed*s; }
  player.x=Math.max(player.w/2,Math.min(canvas.width-player.w/2,player.x));
  player.y=Math.max(player.h/2,Math.min(canvas.height-player.h/2,player.y));

  // Ateş
  const isMoving=joystick.active&&joystick.moving;
  const isKeyFire=keys['Space']||keys['KeyZ'];
  const fireCd=currentWeapon==='laser'?80:rapidFire>0?90:220;
  if(shootCooldown>0) shootCooldown-=rawDt;
  if((isMoving||isKeyFire)&&shootCooldown<=0){ fireWeapon(); shootCooldown=fireCd; }
  if(invincible>0) invincible-=rawDt;

  // Mermiler (homing)
  bullets=bullets.filter(b=>{
    if(b.homing&&enemies.length>0){
      let closest=null,cd=999999;
      for(const e of enemies){ const d=Math.hypot(e.x-b.x,e.y-b.y); if(d<cd){cd=d;closest=e;} }
      if(closest){ const ang=Math.atan2(closest.y-b.y,closest.x-b.x); b.vx+=(Math.cos(ang)*300-b.vx)*s*3; b.vy+=(Math.sin(ang)*400-b.vy)*s*1; }
    }
    b.x+=(b.vx||0)*s; b.y+=b.vy*s; return b.y>-30&&b.y<canvas.height+10;
  });

  // Düşman mermileri
  eBullets=eBullets.filter(b=>{
    b.x+=(b.vx||0)*s; b.y+=b.vy*s;
    if(b.y>canvas.height+20) return false;
    if(invincible<=0&&shieldActive&&circleRect(b.x,b.y,6,player.x,player.y,player.w*1.9,player.h*1.9)){
      b.vy=-Math.abs(b.vy); b.color='#00aaff'; explode(b.x,b.y,'#00aaff',4); return true;
    }
    // Ghost pasif: %15 dodge
    if(invincible<=0&&!shieldActive&&rectsOverlap(player.x,player.y,player.w,player.h,b.x,b.y,b.w||8,b.h||12)){
      if(passiveDodgeCheck()) return false; // mermi geçti
      hitPlayer(); return false;
    }
    return true;
  });

  // Asteroitler
  asteroidTimer-=rawDt;
  if(asteroidTimer<=0){ spawnAsteroid(); asteroidTimer=Math.max(3000,8000-wave*300); }
  asteroids=asteroids.filter(a=>{
    a.x+=a.vx*s; a.y+=a.vy*s; a.rot+=a.rotSpeed*s;
    if(a.y>canvas.height+60) return false;
    bullets=bullets.filter(b=>{
      if(circleRect(b.x,b.y,a.r,a.x,a.y,a.r*2,a.r*2)){
        a.hp-=b.dmg;
        if(a.hp<=0){
          explode(a.x,a.y,'#aa8855',15); score+=200+wave*30;
          if(a.r>14){ for(let i=0;i<2;i++) asteroids.push({x:a.x+(i?1:-1)*20,y:a.y,r:a.r*0.55,hp:1,maxHp:1,vy:a.vy+30,vx:(Math.random()-0.5)*80,rot:0,rotSpeed:(Math.random()-0.5)*3,points:Array.from({length:7},(_,j)=>{const ang=j/7*Math.PI*2;return{a:ang,r:(a.r*0.55)*(0.7+Math.random()*0.5)};})});}
          return false;
        }
        return false;
      }
      return true;
    });
    if(a.hp>0&&invincible<=0&&!shieldActive&&circleRect(a.x,a.y,a.r,player.x,player.y,player.w,player.h)){ hitPlayer(); explode(a.x,a.y,'#aa8855',12); a.hp=0; return false; }
    return a.hp>0;
  });

  // Dalga makinesi
  if(!bossActive){
    if(wavePhase==='spawning'){
      if(waveEnemiesLeft>0){
        enemySpawnTimer-=rawDt;
        if(enemySpawnTimer<=0){
          const r=Math.random();
          if(r<0.06&&wave>=2){ spawnElite(); waveEnemiesLeft=Math.max(0,waveEnemiesLeft-2); }
          else if(r<0.15&&wave>=2){ spawnFormation(); waveEnemiesLeft=Math.max(0,waveEnemiesLeft-4); }
          else { spawnEnemy(); waveEnemiesLeft--; }
          enemySpawnTimer=waveSpawnInterval;
        }
      } else { wavePhase='waiting'; }
    } else if(wavePhase==='waiting'){
      if(enemies.length===0){
        if(wave%3===0){ spawnBoss(); wavePhase='boss'; }
        else{
          wave++; document.getElementById('waveEl').textContent=wave;
          waveCooldown=1800; wavePhase='cooldown';
          checkDailyMission('wave5',1);
          onWavePassive();
        }
      }
    }
  }
  // Cooldown her durumda çalışsın (boss ölünce aynı frame'de devreye girsin)
  if(wavePhase==='cooldown'){
    waveCooldown-=rawDt; if(waveCooldown<=0) startWave();
  }

  // Boss
  if(bossActive&&boss){
    if(boss.y<110) boss.y+=boss.speed*s;
    boss.x+=boss.dx*(boss.speed*0.85)*s;
    if(boss.x>canvas.width-boss.w/2||boss.x<boss.w/2) boss.dx*=-1;
    boss.shootTimer-=rawDt;
    if(boss.hitFlash>0) boss.hitFlash-=rawDt;
    if(boss.shootTimer<=0){
      boss.shootTimer=Math.max(320,850-wave*28);
      const phase2=boss.hp<boss.maxHp*0.5;
      for(let a=-1;a<=1;a++) eBullets.push({x:boss.x+a*25,y:boss.y+boss.h/2,vx:a*90,vy:230,color:'#cc00ff'});
      if(wave>=2||phase2) eBullets.push({x:boss.x,y:boss.y+boss.h/2,vx:0,vy:310,color:'#ff00cc'});
      if(phase2){ for(let i=0;i<4;i++){const a2=i/4*Math.PI*2;eBullets.push({x:boss.x,y:boss.y,vx:Math.cos(a2)*160,vy:Math.sin(a2)*160+100,color:'#ff0044'});} }
    }
    bullets=bullets.filter(b=>{
      if(rectsOverlap(boss.x,boss.y,boss.w,boss.h,b.x,b.y,b.w,b.h)){
        boss.hp-=b.dmg; boss.hitFlash=80; explode(b.x,b.y,'#cc00ff',5);
        if(boss.hp<=0){
          triggerShake(5); triggerSlowmo(600);
          explode(boss.x,boss.y,'#cc00ff',60); explode(boss.x,boss.y,'#ffffff',30);
          score+=Math.floor((3000+wave*600)*comboMultiplier());
          spawnPowerup(boss.x,boss.y); spawnPowerup(boss.x+40,boss.y);
          bossActive=false; boss=null;
          wave++; document.getElementById('waveEl').textContent=wave;
          waveCooldown=2200; wavePhase='cooldown';
          checkDailyMission('wave5',1);
          onWavePassive();
        }
        return false;
      }
      return true;
    });
    if(invincible<=0&&!shieldActive&&rectsOverlap(player.x,player.y,player.w,player.h,boss.x,boss.y,boss.w,boss.h)) hitPlayer();
  }

  // Düşmanlar
  enemies=enemies.filter(e=>{
    e.y+=e.dy*s;
    if(e.zigzag) e.x+=e.dx*Math.sin(Date.now()/400+e.zigPhase)*1.2;
    if(e.hitFlash>0) e.hitFlash-=rawDt;
    e.x=Math.max(e.w/2,Math.min(canvas.width-e.w/2,e.x));
    if(Math.random()<e.shootRate*ms){
      const angle=Math.atan2(player.y-e.y,player.x-e.x);
      eBullets.push({x:e.x,y:e.y+e.h/2,vx:Math.cos(angle)*e.bulletSpeed*0.4,vy:e.bulletSpeed,color:e.color});
    }
    let alive=true;
    bullets=bullets.filter(b=>{
      if(!alive) return true;
      if(!rectsOverlap(e.x,e.y,e.w,e.h,b.x,b.y,b.w,b.h)) return true;
      if(e.ability==='reflect'&&e.hp>1){ b.vy=Math.abs(b.vy)*0.8; b.color='#ffff00'; e.hitFlash=80; explode(b.x,b.y,'#ffff00',4); return true; }
      if(e.ability==='shield'&&e.shieldHp>0){ e.shieldHp-=b.dmg; e.hitFlash=80; explode(b.x,b.y,'#00ccff',4); return false; }
      e.hp-=b.dmg; e.hitFlash=80; explode(b.x,b.y,e.color,5);
      if(e.hp<=0){
        explode(e.x,e.y,e.color,22);
        const rawPts=(e.score+wave*20)*comboMultiplier();
        const pts = applyPassiveScore(Math.floor(rawPts)); // gemi pasifi + çarpanı
        score+=pts; sessionKills++; waveKilled++;
        checkDailyMission('kill100',1); checkDailyMission('score5k',pts);
        addCombo(); spawnPowerup(e.x,e.y);
        if(e.ability==='split'){
          for(let si=0;si<2;si++){
            const nt=ENEMY_TYPES[0];
            enemies.push({...nt,x:e.x+(si?30:-30),y:e.y,hp:1,maxHp:1,dy:e.dy+20,dx:0,zigPhase:0,hitFlash:0,isElite:false,score:50});
          }
        }
        alive=false;
      }
      return false;
    });
    if(!alive) return false;
    if(invincible<=0&&!shieldActive&&rectsOverlap(player.x,player.y,player.w,player.h,e.x,e.y,e.w,e.h)){
      hitPlayer(); explode(e.x,e.y,e.color,15); resetCombo(); return false;
    }
    return e.y<canvas.height+60;
  });

  // Power-uplar
  powerups=powerups.filter(p=>{
    p.y+=p.vy*s;
    if(rectsOverlap(player.x,player.y,player.w*1.4,player.h*1.4,p.x,p.y,p.r*2,p.r*2)){applyPowerup(p);return false;}
    return p.y<canvas.height+30;
  });

  // Partiküller
  particles=particles.filter(p=>{p.x+=p.vx*s;p.y+=p.vy*s;p.vx*=0.95;p.vy*=0.95;p.life-=p.decay*s;return p.life>0;});

  // Skor & gemi seviyesi
  document.getElementById('scoreEl').textContent=score.toLocaleString();
  renderDailyUI();
  updateShipLevel();
}

// ── ÇİZİM ────────────────────────────────────────────
function draw(){
  ctx.save();
  if(shakeAmt>0.5){ ctx.translate((Math.random()-0.5)*shakeAmt*2,(Math.random()-0.5)*shakeAmt*2); }

  const bg=ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#000008'); bg.addColorStop(1,'#000020');
  ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height);

  drawStars();

  // Nebula
  ctx.save(); ctx.globalAlpha=0.055;
  const neb=ctx.createRadialGradient(canvas.width*0.7,canvas.height*0.3,10,canvas.width*0.7,canvas.height*0.3,200);
  neb.addColorStop(0,'#aa00ff'); neb.addColorStop(1,'transparent');
  ctx.fillStyle=neb; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();

  // Partiküller
  for(const p of particles){
    ctx.save(); ctx.globalAlpha=p.life; ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=7;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  for(const a of asteroids) drawAsteroid(a);
  drawPowerups();
  for(const e of enemies) drawEnemy(e);
  if(bossActive&&boss) drawBoss(boss);

  for(const b of eBullets){
    ctx.save(); ctx.shadowColor=b.color; ctx.shadowBlur=10; ctx.fillStyle=b.color;
    ctx.beginPath(); ctx.arc(b.x,b.y,5,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  for(const b of bullets) drawBullet(b);

  if(state==='playing') drawPlayer(player);

  ctx.save(); ctx.globalAlpha=0.022; ctx.fillStyle=scanlinePattern||'transparent'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  ctx.restore();
}

// ── BAŞLANGIÇ (menü döngüsü) ──────────────────────────
injectHangarHTML();   // hangar HTML'sini DOM'a ekle
resize();             // canvas boyutunu hemen set et
initStars();
(function menuLoop(){
  if(state!=='menu') return;
  updateStars(16); draw(); requestAnimationFrame(menuLoop);
})();

// ═══════════════════════════════════════════════════════
//  GAME.JS  –  Ana döngü | pause | ses | zorluk | efektler
// ═══════════════════════════════════════════════════════

const canvas    = document.getElementById('c');
const ctx       = canvas.getContext('2d');
const wrapper   = document.getElementById('gameWrapper');
const jBase     = document.getElementById('joystickBase');
const jKnob     = document.getElementById('joystickKnob');
const touchZone = document.getElementById('touchZone');
const slowFlash = document.getElementById('slowmoFlash');

// ── CANVAS BOYUTU ─────────────────────────────────────
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
window.addEventListener('resize',resize);
if(window.visualViewport) window.visualViewport.addEventListener('resize',resize);

// ── OYUN DURUMU ───────────────────────────────────────
// state: 'menu' | 'playing' | 'paused' | 'gameover'
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
let sessionKills=0, asteroidTimer=0;

// Görsel efektler
let screenFlashColor=null, screenFlashAmt=0;
let chromAberration=0; // chromatic aberration şiddeti
let nebulaAngle=0;     // dönen nebula

// ── ÇARPIŞMA ─────────────────────────────────────────
function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){
  return ax-aw/2<bx+bw/2&&ax+aw/2>bx-bw/2&&ay-ah/2<by+bh/2&&ay+ah/2>by-bh/2;
}
function circleRect(cx,cy,cr,rx,ry,rw,rh){
  return Math.abs(cx-rx)<rw/2+cr&&Math.abs(cy-ry)<rh/2+cr;
}

// ── COMBO ─────────────────────────────────────────────
function addCombo(){
  combo++; comboTimer=2800; updateComboUI();
  sfxCombo(combo);
  if(combo>=8) checkDailyMission('combo8',1);
}
function resetCombo(){ combo=0; comboTimer=0; updateComboUI(); }
function updateComboUI(){
  const el=document.getElementById('comboEl');
  if(combo>=2){
    el.textContent=`x${combo} COMBO!`; el.style.opacity='1';
    el.style.fontSize=`clamp(${12+combo}px,${3+combo*0.5}vw,${20+combo*2}px)`;
    const c=combo>=8?'#ff0088':combo>=4?'#ff8800':'#ffcc00';
    el.style.color=c; el.style.textShadow=`0 0 15px ${c},0 0 30px ${c}`;
  } else { el.style.opacity='0'; }
}
function comboMultiplier(){ return 1+Math.floor(combo/2)*0.5; }

// ── EKRAN EFEKTLERİ ───────────────────────────────────
function triggerShake(amt){ shakeAmt=Math.max(shakeAmt,Math.min(amt,10)); }
function triggerSlowmo(dur){
  slowmo=dur;
  slowFlash.style.background='rgba(255,255,255,0.1)';
  setTimeout(()=>slowFlash.style.background='rgba(255,255,255,0)',150);
}
function triggerFlash(color,amt){
  screenFlashColor=color; screenFlashAmt=amt;
}
function triggerChromatic(amt){ chromAberration=Math.max(chromAberration,amt); }

// ── UI ────────────────────────────────────────────────
function renderLives(){
  const bar=document.getElementById('livesBar'); bar.innerHTML='';
  for(let i=0;i<lives;i++){const h=document.createElement('span');h.className='heart';h.textContent='♥';bar.appendChild(h);}
}
function showWaveText(text){
  const el=document.getElementById('wave-indicator'); el.textContent=text; el.style.opacity='1';
  setTimeout(()=>el.style.opacity='0',2200);
}

// ── PAUSE ─────────────────────────────────────────────
function pauseGame(){
  if(state!=='playing') return;
  state='paused';
  document.getElementById('pauseOverlay').classList.remove('hidden');
  if(audioReady) musicGain.gain.setTargetAtTime(0.1,AC.currentTime,0.3);
}
function resumeGame(){
  if(state!=='paused') return;
  state='playing';
  document.getElementById('pauseOverlay').classList.add('hidden');
  if(audioReady) musicGain.gain.setTargetAtTime(0.38,AC.currentTime,0.3);
  lastTime=performance.now();
  requestAnimationFrame(loop);
}
function quitToMenu(){
  state='menu';
  document.getElementById('pauseOverlay').classList.add('hidden');
  document.getElementById('overlay').classList.remove('hidden');
  jBase.style.display='none'; jKnob.style.display='none';
  stopMusic(); startMenuMusic();
  menuLoop();
}

// Pause butonu (sağ üst)
document.getElementById('pauseBtn').addEventListener('click',()=>{
  initAudio();
  sfxMenuClick();
  if(state==='playing') pauseGame(); else if(state==='paused') resumeGame();
});
document.getElementById('resumeBtn').addEventListener('click',()=>{ sfxMenuClick(); resumeGame(); });
document.getElementById('quitBtn').addEventListener('click',()=>{ sfxMenuClick(); quitToMenu(); });

// ESC tuşu
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){
    if(state==='playing') pauseGame();
    else if(state==='paused') resumeGame();
  }
});

// ── DALGA SİSTEMİ ─────────────────────────────────────
function startWave(){
  waveEnemyCount=6+wave*3; waveKilled=0; waveEnemiesLeft=waveEnemyCount;
  waveSpawnInterval=Math.max(350,1600-wave*80); enemySpawnTimer=0; wavePhase='spawning';
  showWaveText(`DALGA ${wave}`);
  sfxWaveStart();
}

// ── OYUNCU HASAR ──────────────────────────────────────
function hitPlayer(){
  if(invincible>0) return;
  lives--; renderLives(); invincible=2000; resetCombo();
  explode(player.x,player.y,'#ff4466',20); triggerShake(6);
  triggerFlash('#ff0000',0.35); triggerChromatic(8);
  sfxPlayerHit();
  if(lives<=0) gameOver();
}

function gameOver(){
  saveScore(score,wave);
  state='menu';
  stopMusic(); startMenuMusic();
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
  initAudio();
  const ship=getSelectedShip();
  score=0; wave=1; lives=ship.lives; sessionKills=0;
  enemies=[]; bullets=[]; eBullets=[]; particles=[]; powerups=[]; asteroids=[];
  player=createPlayer(); shootCooldown=0; invincible=0; shieldActive=false; rapidFire=0;
  bossActive=false; boss=null; wavePhase='spawning';
  combo=0; comboTimer=0; weaponTimer=0; asteroidTimer=8000;
  dashCooldown=0; dashActive=0; slowmo=0; shakeAmt=0; shipLevel=1;
  screenFlashAmt=0; chromAberration=0; nebulaAngle=0;
  dailyRewardsGiven={};
  passiveWaveTracker=0;
  currentWeapon=ship.defaultWeapon||'standard';
  document.getElementById('weaponEl').textContent=WEAPON_NAMES[currentWeapon];
  document.getElementById('weaponEl').style.color=WEAPON_COLORS[currentWeapon];
  state='playing';
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('scoreEl').textContent='0';
  document.getElementById('waveEl').textContent='1';
  renderLives(); initStars(); startWave(); renderDailyUI();
  stopMusic(); startGameMusic();
  lastTime=performance.now();
  requestAnimationFrame(loop);
}

document.getElementById('startBtn').addEventListener('click',()=>{
  initAudio(); sfxMenuClick(); openHangar();
});

// ── ANA DÖNGÜ ─────────────────────────────────────────
let menuLoopActive=false;
function loop(ts){
  if(state!=='playing') return;
  const rawDt=Math.min(ts-lastTime,50); lastTime=ts;
  const dt=slowmo>0?rawDt*0.35:rawDt;
  if(slowmo>0) slowmo-=rawDt;
  update(dt,rawDt);
  draw();
  requestAnimationFrame(loop);
}
function menuLoop(){
  if(menuLoopActive) return;
  menuLoopActive=true;
  (function ml(){
    if(state!=='menu'){menuLoopActive=false;return;}
    updateStars(16); draw(); requestAnimationFrame(ml);
  })();
}

// ── GÜNCELLEME ────────────────────────────────────────
function update(dt,rawDt){
  const ms=dt, s=dt/1000;

  updateStars(dt);
  nebulaAngle+=s*0.05;
  if(shakeAmt>0) shakeAmt*=0.80;
  if(chromAberration>0) chromAberration*=0.88;
  if(screenFlashAmt>0) screenFlashAmt*=0.82;

  // Silah zamanlayıcısı
  if(weaponTimer>0){ weaponTimer-=rawDt; if(weaponTimer<=0) resetWeapon(); }
  if(rapidFire>0) rapidFire-=rawDt;
  if(comboTimer>0){ comboTimer-=rawDt; if(comboTimer<=0) resetCombo(); }

  // Dash
  if(dashCooldown>0) dashCooldown-=rawDt;
  if(dashActive>0){ dashActive-=rawDt; player.x+=dashVx*720*s; player.y+=dashVy*720*s; }

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
  const fireCd=currentWeapon==='laser'?70:rapidFire>0?80:200;
  if(shootCooldown>0) shootCooldown-=rawDt;
  if((isMoving||isKeyFire)&&shootCooldown<=0){ fireWeapon(); shootCooldown=fireCd; }
  if(invincible>0) invincible-=rawDt;

  // Mermiler (homing)
  bullets=bullets.filter(b=>{
    if(b.homing&&enemies.length>0){
      let cl=null,cd=999999;
      for(const e of enemies){const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<cd){cd=d;cl=e;}}
      if(cl){const ang=Math.atan2(cl.y-b.y,cl.x-b.x);b.vx+=(Math.cos(ang)*320-b.vx)*s*3;b.vy+=(Math.sin(ang)*420-b.vy)*s*1;}
    }
    b.x+=(b.vx||0)*s; b.y+=b.vy*s; return b.y>-40&&b.y<canvas.height+20;
  });

  // Düşman mermileri
  eBullets=eBullets.filter(b=>{
    b.x+=(b.vx||0)*s; b.y+=b.vy*s;
    if(b.y>canvas.height+20||b.y<-20) return false;
    if(invincible<=0&&shieldActive&&circleRect(b.x,b.y,7,player.x,player.y,player.w*2,player.h*2)){
      b.vy=-Math.abs(b.vy); b.color='#00aaff'; explode(b.x,b.y,'#00aaff',5); return true;
    }
    if(invincible<=0&&!shieldActive&&rectsOverlap(player.x,player.y,player.w,player.h,b.x,b.y,b.w||8,b.h||12)){
      if(passiveDodgeCheck()) return false;
      hitPlayer(); return false;
    }
    return true;
  });

  // Asteroitler
  asteroidTimer-=rawDt;
  if(asteroidTimer<=0){ spawnAsteroid(); asteroidTimer=Math.max(2000,7000-wave*250); }
  asteroids=asteroids.filter(a=>{
    a.x+=a.vx*s; a.y+=a.vy*s; a.rot+=a.rotSpeed*s;
    if(a.y>canvas.height+70) return false;
    bullets=bullets.filter(b=>{
      if(!circleRect(b.x,b.y,a.r,a.x,a.y,a.r*2,a.r*2)) return true;
      a.hp-=b.dmg;
      if(a.hp<=0){
        explode(a.x,a.y,'#aa8855',18); score+=200+wave*30;
        if(a.r>14){for(let i=0;i<2;i++) asteroids.push({x:a.x+(i?1:-1)*20,y:a.y,r:a.r*0.55,hp:1,maxHp:1,vy:a.vy+35,vx:(Math.random()-0.5)*90,rot:0,rotSpeed:(Math.random()-0.5)*3,points:Array.from({length:7},(_,j)=>{const ang=j/7*Math.PI*2;return{a:ang,r:(a.r*0.55)*(0.7+Math.random()*0.5)};})});}
        return false;
      }
      return false;
    });
    if(a.hp>0&&invincible<=0&&!shieldActive&&circleRect(a.x,a.y,a.r,player.x,player.y,player.w,player.h)){
      hitPlayer(); explode(a.x,a.y,'#aa8855',14); a.hp=0; return false;
    }
    return a.hp>0;
  });

  // ── DALGA MAKİNESİ ────────────────────────────────
  if(!bossActive){
    if(wavePhase==='spawning'){
      if(waveEnemiesLeft>0){
        enemySpawnTimer-=rawDt;
        if(enemySpawnTimer<=0){
          const r=Math.random();
          if(r<0.05&&wave>=3){ spawnSwarm(); waveEnemiesLeft=Math.max(0,waveEnemiesLeft-5); }
          else if(r<0.1&&wave>=2){ spawnElite(); waveEnemiesLeft=Math.max(0,waveEnemiesLeft-2); }
          else if(r<0.22&&wave>=2){ spawnFormation(); waveEnemiesLeft=Math.max(0,waveEnemiesLeft-4); }
          else { spawnEnemy(); waveEnemiesLeft--; }
          enemySpawnTimer=waveSpawnInterval;
        }
      } else { wavePhase='waiting'; }
    } else if(wavePhase==='waiting'){
      if(enemies.length===0){
        if(wave%3===0){ spawnBoss(); wavePhase='boss'; }
        else{
          wave++; document.getElementById('waveEl').textContent=wave;
          waveCooldown=1600; wavePhase='cooldown';
          checkDailyMission('wave5',1); onWavePassive();
        }
      }
    }
  }
  // Cooldown bağımsız çalışır (boss ölümünden hemen sonra da)
  if(wavePhase==='cooldown'){
    waveCooldown-=rawDt; if(waveCooldown<=0) startWave();
  }

  // Boss güncelleme (enemies.js'den)
  if(bossActive&&boss) updateBoss(s,rawDt);

  // ── DÜŞMANLAR ─────────────────────────────────────
  enemies=enemies.filter(e=>{
    e.y+=e.dy*s;
    if(e.zigzag) e.x+=e.dx*Math.sin(Date.now()/380+e.zigPhase)*1.4;
    if(e.hitFlash>0) e.hitFlash-=rawDt;
    e.x=Math.max(e.w/2,Math.min(canvas.width-e.w/2,e.x));

    // Stealth: görünürlük zamanlayıcısı
    if(e.shape==='stealth'){
      e.stealthTimer-=rawDt;
      if(e.stealthTimer<=0){ e.stealthVisible=!e.stealthVisible; e.stealthTimer=e.stealthVisible?1500:2500; }
    }

    // Ateş
    if(e.stealthVisible||e.isElite){
      if(Math.random()<e.shootRate*ms){
        const angle=Math.atan2(player.y-e.y,player.x-e.x);
        eBullets.push({x:e.x,y:e.y+e.h/2,vx:Math.cos(angle)*e.bulletSpeed*0.45,vy:e.bulletSpeed,color:e.color});
      }
    }

    let alive=true;
    bullets=bullets.filter(b=>{
      if(!alive) return true;
      // Stealth: görünmezken mermi geçer
      if(e.shape==='stealth'&&!e.stealthVisible&&e.hitFlash<=0) return true;
      if(!rectsOverlap(e.x,e.y,e.w,e.h,b.x,b.y,b.w,b.h)) return true;
      if(e.ability==='reflect'&&e.hp>1){ b.vy=Math.abs(b.vy)*0.85; b.color='#ffff00'; e.hitFlash=80; explode(b.x,b.y,'#ffff00',5); return true; }
      if(e.ability==='shield'&&e.shieldHp>0){ e.shieldHp-=b.dmg; e.hitFlash=80; explode(b.x,b.y,'#00ccff',5); return false; }
      e.hp-=b.dmg; e.hitFlash=80; explode(b.x,b.y,e.color,6); sfxEnemyHit();
      if(e.hp<=0){
        explode(e.x,e.y,e.color,28); sfxEnemyDie();
        // Bomber patlaması
        if(e.ability==='bomb'){
          triggerShake(4); triggerFlash('#ff6600',0.2);
          for(let i=0;i<8;i++){
            const ang=i/8*Math.PI*2;
            eBullets.push({x:e.x,y:e.y,vx:Math.cos(ang)*180,vy:Math.sin(ang)*180,color:'#ff6600'});
          }
        }
        const rawPts=(e.score+wave*25)*comboMultiplier();
        const pts=applyPassiveScore(Math.floor(rawPts));
        score+=pts; sessionKills++; waveKilled++;
        checkDailyMission('kill100',1); checkDailyMission('score5k',pts);
        addCombo(); spawnPowerup(e.x,e.y);
        if(e.ability==='split'){
          for(let si=0;si<2;si++){
            const nt=ENEMY_TYPES[0];
            enemies.push({...nt,x:e.x+(si?32:-32),y:e.y,hp:2,maxHp:2,dy:e.dy+25,dx:0,zigPhase:0,hitFlash:0,isElite:false,score:60,stealthTimer:0,stealthVisible:true,shootCd:0});
          }
        }
        alive=false;
      }
      return false;
    });
    if(!alive) return false;
    if(invincible<=0&&!shieldActive&&rectsOverlap(player.x,player.y,player.w,player.h,e.x,e.y,e.w,e.h)){
      hitPlayer(); explode(e.x,e.y,e.color,18); resetCombo(); return false;
    }
    return e.y<canvas.height+70;
  });

  // Power-uplar
  powerups=powerups.filter(p=>{
    p.y+=p.vy*s;
    if(rectsOverlap(player.x,player.y,player.w*1.5,player.h*1.5,p.x,p.y,p.r*2,p.r*2)){applyPowerup(p);return false;}
    return p.y<canvas.height+35;
  });

  // Partiküller
  particles=particles.filter(p=>{p.x+=p.vx*s;p.y+=p.vy*s;p.vx*=0.94;p.vy*=0.94;p.life-=p.decay*s;return p.life>0;});

  // Skor & gemi seviyesi
  document.getElementById('scoreEl').textContent=score.toLocaleString();
  renderDailyUI();
  updateShipLevel();
}

// ── ÇİZİM ─────────────────────────────────────────────
function draw(){
  ctx.save();

  // Ekran sarsıntısı
  if(shakeAmt>0.5) ctx.translate((Math.random()-0.5)*shakeAmt*2.5,(Math.random()-0.5)*shakeAmt*2.5);

  // Arka plan gradyanı
  const bg=ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#000008'); bg.addColorStop(0.5,'#00000f'); bg.addColorStop(1,'#000022');
  ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height);

  drawStars();
  drawNebula();

  // Partiküller (arka)
  for(const p of particles){
    ctx.save(); ctx.globalAlpha=p.life*0.9; ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=9;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  for(const a of asteroids) drawAsteroid(a);
  drawPowerups();
  for(const e of enemies) drawEnemy(e);
  if(bossActive&&boss) drawBoss(boss);

  for(const b of eBullets){
    ctx.save(); ctx.shadowColor=b.color; ctx.shadowBlur=12; ctx.fillStyle=b.color;
    ctx.beginPath(); ctx.arc(b.x,b.y,5.5,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  for(const b of bullets) drawBullet(b);
  if(state==='playing'||state==='paused') drawPlayer(player);

  // Chromatic aberration
  if(chromAberration>1){
    ctx.save();
    ctx.globalAlpha=chromAberration/20*0.3;
    ctx.globalCompositeOperation='screen';
    const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
    ctx.putImageData(imgData,chromAberration,0);
    ctx.restore();
  }

  // Ekran flaşı
  if(screenFlashAmt>0.01){
    ctx.save(); ctx.globalAlpha=screenFlashAmt;
    ctx.fillStyle=screenFlashColor||'#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  // Scanlines
  ctx.save(); ctx.globalAlpha=0.025; ctx.fillStyle=scanlinePattern||'transparent'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();

  // CRT köşe karartma (vignette)
  drawVignette();

  ctx.restore();
}

// ── DÖNEN NEBULA ──────────────────────────────────────
function drawNebula(){
  ctx.save();
  const cx=canvas.width*0.65, cy=canvas.height*0.28;
  const r=Math.min(canvas.width,canvas.height)*0.55;
  const px=cx+Math.cos(nebulaAngle)*30, py=cy+Math.sin(nebulaAngle*0.7)*20;
  const neb=ctx.createRadialGradient(px,py,10,px,py,r);
  neb.addColorStop(0,'rgba(120,0,200,0.07)');
  neb.addColorStop(0.5,'rgba(0,80,160,0.04)');
  neb.addColorStop(1,'transparent');
  ctx.fillStyle=neb; ctx.fillRect(0,0,canvas.width,canvas.height);
  // İkinci nebula
  const neb2=ctx.createRadialGradient(canvas.width*0.2,canvas.height*0.7,5,canvas.width*0.2,canvas.height*0.7,r*0.7);
  neb2.addColorStop(0,'rgba(0,160,120,0.05)');
  neb2.addColorStop(1,'transparent');
  ctx.fillStyle=neb2; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
}

// ── VİGNETTE ──────────────────────────────────────────
function drawVignette(){
  ctx.save();
  const vg=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.height*0.35,canvas.width/2,canvas.height/2,canvas.height*0.85);
  vg.addColorStop(0,'transparent'); vg.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
}

// ── BAŞLANGIÇ ─────────────────────────────────────────
injectHangarHTML();
injectPauseHTML();
resize();
initStars();
startMenuMusic();
menuLoop();

// ── PAUSE HTML INJECT ─────────────────────────────────
function injectPauseHTML(){
  const div=document.createElement('div');
  div.id='pauseOverlay'; div.className='pause-overlay hidden';
  div.innerHTML=`
    <div class="pause-box">
      <div class="pause-title">— DURAKLATILDI —</div>
      <button class="btn" id="resumeBtn">DEVAM ET</button>
      <button class="btn btn-back" id="quitBtn">ANA MENÜ</button>
      <div class="pause-mute" id="muteBtn">🔊 SES</div>
    </div>`;
  document.getElementById('gameWrapper').appendChild(div);
  document.getElementById('muteBtn').addEventListener('click',()=>{
    initAudio();
    const m=toggleMute();
    document.getElementById('muteBtn').textContent=m?'🔇 SESSIZ':'🔊 SES';
  });
}

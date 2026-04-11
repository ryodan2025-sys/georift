// ═══════════════════════════════════════════════════════
//  GAME.JS  –  Ana döngü, menü, pause, update, draw
//  Tüm overlay HTML'ler index.html'de statik.
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
let state='menu'; // 'menu'|'playing'|'paused'
let score=0,wave=1,lives=3;
let enemies=[],bullets=[],eBullets=[],particles=[],powerups=[],stars=[],asteroids=[];
let player,lastTime=0,shootCooldown=0,enemySpawnTimer=0;
let bossActive=false,boss=null;
let waveEnemiesLeft=0,waveKilled=0;
let invincible=0,shieldActive=false,rapidFire=0;
let wavePhase='spawning',waveEnemyCount=0,waveSpawnInterval=2000,waveCooldown=0;
let combo=0,comboTimer=0;
let currentWeapon='standard',weaponTimer=0;
let dashCooldown=0,dashActive=0,dashVx=0,dashVy=0;
let slowmo=0,shakeAmt=0,shipLevel=1;
let sessionKills=0,asteroidTimer=0;
let screenFlashColor='#fff',screenFlashAmt=0;
let nebulaAngle=0;

// ── ÇARPIŞMA ─────────────────────────────────────────
function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){
  return ax-aw/2<bx+bw/2&&ax+aw/2>bx-bw/2&&ay-ah/2<by+bh/2&&ay+ah/2>by-bh/2;
}
function circleRect(cx,cy,cr,rx,ry,rw,rh){
  return Math.abs(cx-rx)<rw/2+cr&&Math.abs(cy-ry)<rh/2+cr;
}

// ── COMBO ────────────────────────────────────────────
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

// ── EKRAN EFEKTLERİ ──────────────────────────────────
function triggerShake(amt){ shakeAmt=Math.max(shakeAmt,Math.min(amt,10)); }
function triggerSlowmo(dur){
  slowmo=dur;
  slowFlash.style.background='rgba(255,255,255,0.10)';
  setTimeout(()=>slowFlash.style.background='rgba(255,255,255,0)',150);
}
function triggerFlash(col,amt){ screenFlashColor=col; screenFlashAmt=amt; }

// ── UI ───────────────────────────────────────────────
function renderLives(){
  const bar=document.getElementById('livesBar'); bar.innerHTML='';
  for(let i=0;i<lives;i++){
    const h=document.createElement('span'); h.className='heart'; h.textContent='♥';
    bar.appendChild(h);
  }
}
function showWaveText(text){
  const el=document.getElementById('wave-indicator');
  el.textContent=text; el.style.opacity='1';
  setTimeout(()=>el.style.opacity='0',2200);
}

// ── PAUSE ────────────────────────────────────────────
function pauseGame(){
  if(state!=='playing') return;
  state='paused';
  document.getElementById('pauseOverlay').classList.remove('hidden');
  if(audioReady) musicGain.gain.setTargetAtTime(0.08,AC.currentTime,0.3);
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
  bossActive=false; boss=null;
  document.getElementById('pauseOverlay').classList.add('hidden');
  document.getElementById('menuOverlay').classList.remove('hidden');
  document.getElementById('pauseBtn').classList.remove('visible');
  jBase.style.display='none'; jKnob.style.display='none';
  stopMusic(); startMenuMusic();
  requestAnimationFrame(menuDraw);
}

// Mute toggle yardımcısı
function handleMuteToggle(btnId){
  initAudio();
  const m=toggleMute();
  const icon=m?'🔇 SESSIZ':'🔊 SES';
  document.getElementById('menuMuteBtn').textContent=icon;
  const pb=document.getElementById('pauseMuteBtn');
  if(pb) pb.textContent=icon;
}

// ── BUTON BAĞLANTILARI ────────────────────────────────
// Menü
document.getElementById('playBtn').addEventListener('click',()=>{
  initAudio(); sfxMenuClick(); startGame();
});
document.getElementById('hangarBtn').addEventListener('click',()=>openHangar());
document.getElementById('menuMuteBtn').addEventListener('click',()=>handleMuteToggle('menuMuteBtn'));

// Pause
document.getElementById('pauseBtn').addEventListener('click',()=>{
  initAudio(); sfxMenuClick();
  if(state==='playing') pauseGame(); else if(state==='paused') resumeGame();
});
document.getElementById('resumeBtn').addEventListener('click',()=>{ sfxMenuClick(); resumeGame(); });
document.getElementById('quitBtn').addEventListener('click',()=>{ sfxMenuClick(); quitToMenu(); });
document.getElementById('pauseMuteBtn').addEventListener('click',()=>handleMuteToggle('pauseMuteBtn'));

// ESC / P
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){
    if(state==='playing') pauseGame(); else if(state==='paused') resumeGame();
  }
});

// ── DALGA SİSTEMİ ────────────────────────────────────
function startWave(){
  waveEnemyCount=6+wave*3; waveKilled=0; waveEnemiesLeft=waveEnemyCount;
  waveSpawnInterval=Math.max(320,1600-wave*80); enemySpawnTimer=0; wavePhase='spawning';
  showWaveText('DALGA '+wave);
  sfxWaveStart();
}

// ── OYUNCU HASAR ─────────────────────────────────────
function hitPlayer(){
  if(invincible>0) return;
  lives--; renderLives(); invincible=2000; resetCombo();
  explode(player.x,player.y,'#ff4466',22); triggerShake(7);
  triggerFlash('#ff0000',0.3); sfxPlayerHit();
  if(lives<=0) gameOver();
}

function gameOver(){
  saveScore(score,wave);
  state='menu';
  stopMusic(); startMenuMusic();
  document.getElementById('pauseBtn').classList.remove('visible');
  document.getElementById('menuOverlay').classList.remove('hidden');
  const os=document.getElementById('overlayScore');
  os.style.display='block';
  os.textContent='SKOR: '+score.toLocaleString()+'\nDALGA: '+wave+'  |  KİLL: '+sessionKills;
  const sb=document.getElementById('scoreboardEl');
  sb.style.display='block'; sb.textContent=renderScoreboard();
  document.getElementById('playBtn').textContent='YENİDEN OYNA';
  jBase.style.display='none'; jKnob.style.display='none';
  requestAnimationFrame(menuDraw);
}

// ── OYUNU BAŞLAT ─────────────────────────────────────
function startGame(){
  initAudio();
  const ship=getSelectedShip();
  score=0; wave=1; lives=ship.lives; sessionKills=0;
  enemies=[]; bullets=[]; eBullets=[]; particles=[]; powerups=[]; asteroids=[];
  player=createPlayer(); shootCooldown=0; invincible=0; shieldActive=false; rapidFire=0;
  bossActive=false; boss=null; wavePhase='spawning';
  combo=0; comboTimer=0; weaponTimer=0; asteroidTimer=6000;
  dashCooldown=0; dashActive=0; slowmo=0; shakeAmt=0; shipLevel=1;
  screenFlashAmt=0; nebulaAngle=0;
  dailyRewardsGiven={};
  passiveWaveTracker=0;
  currentWeapon=ship.defaultWeapon||'standard';
  document.getElementById('weaponEl').textContent=WEAPON_NAMES[currentWeapon];
  document.getElementById('weaponEl').style.color=WEAPON_COLORS[currentWeapon];
  document.getElementById('menuOverlay').classList.add('hidden');
  document.getElementById('pauseBtn').classList.add('visible');
  document.getElementById('scoreEl').textContent='0';
  document.getElementById('waveEl').textContent='1';
  state='playing';
  renderLives(); initStars(); startWave(); renderDailyUI();
  stopMusic(); startGameMusic();
  lastTime=performance.now();
  requestAnimationFrame(loop);
}

// ── MENÜ ÇİZİM DÖNGÜSÜ ──────────────────────────────
function menuDraw(){
  if(state!=='menu') return;
  updateStars(16); nebulaAngle+=0.001; draw();
  requestAnimationFrame(menuDraw);
}

// ── OYUN DÖNGÜSÜ ─────────────────────────────────────
function loop(ts){
  if(state!=='playing') return;
  const rawDt=Math.min(ts-lastTime,50); lastTime=ts;
  const dt=slowmo>0?rawDt*0.35:rawDt;
  if(slowmo>0) slowmo-=rawDt;
  update(dt,rawDt); draw();
  requestAnimationFrame(loop);
}

// ── GÜNCELLEME ───────────────────────────────────────
function update(dt,rawDt){
  const ms=dt, s=dt/1000;
  updateStars(dt);
  nebulaAngle+=s*0.04;
  if(shakeAmt>0) shakeAmt*=0.80;
  if(screenFlashAmt>0) screenFlashAmt*=0.80;

  if(weaponTimer>0){ weaponTimer-=rawDt; if(weaponTimer<=0) resetWeapon(); }
  if(rapidFire>0) rapidFire-=rawDt;
  if(comboTimer>0){ comboTimer-=rawDt; if(comboTimer<=0) resetCombo(); }

  // Dash
  if(dashCooldown>0) dashCooldown-=rawDt;
  if(dashActive>0){ dashActive-=rawDt; player.x+=dashVx*720*s; player.y+=dashVy*720*s; }

  // Hareket
  let mx=0,my=0;
  if(keys['ArrowLeft']||keys['KeyA']) mx-=1;
  if(keys['ArrowRight']||keys['KeyD']) mx+=1;
  if(keys['ArrowUp']||keys['KeyW']) my-=1;
  if(keys['ArrowDown']||keys['KeyS']) my+=1;
  if(joystick.active){ mx+=joystick.dx; my+=joystick.dy; }
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

  // Mermiler (player)
  bullets=bullets.filter(b=>{
    if(b.homing&&enemies.length>0){
      let cl=null,cd=999999;
      for(const e of enemies){const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<cd){cd=d;cl=e;}}
      if(cl){const ang=Math.atan2(cl.y-b.y,cl.x-b.x);b.vx+=(Math.cos(ang)*320-b.vx)*s*3;b.vy+=(Math.sin(ang)*420-b.vy)*s;}
    }
    b.x+=(b.vx||0)*s; b.y+=b.vy*s;
    return b.y>-50&&b.y<canvas.height+20&&b.x>-20&&b.x<canvas.width+20;
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
        if(a.r>14){
          for(let i=0;i<2;i++)
            asteroids.push({x:a.x+(i?1:-1)*20,y:a.y,r:a.r*0.55,hp:1,maxHp:1,vy:a.vy+35,vx:(Math.random()-0.5)*90,rot:0,rotSpeed:(Math.random()-0.5)*3,
              points:Array.from({length:7},(_,j)=>{const ang=j/7*Math.PI*2;return{a:ang,r:(a.r*0.55)*(0.7+Math.random()*0.5)};})});
        }
        return false;
      }
      return false;
    });
    if(a.hp>0&&invincible<=0&&!shieldActive&&circleRect(a.x,a.y,a.r,player.x,player.y,player.w,player.h)){
      hitPlayer(); explode(a.x,a.y,'#aa8855',14); a.hp=0; return false;
    }
    return a.hp>0;
  });

  // ── DALGA MAKİNESİ ───────────────────────────────
  if(!bossActive){
    if(wavePhase==='spawning'){
      if(waveEnemiesLeft>0){
        enemySpawnTimer-=rawDt;
        if(enemySpawnTimer<=0){
          const r=Math.random();
          if(r<0.05&&wave>=3)      { spawnSwarm();    waveEnemiesLeft=Math.max(0,waveEnemiesLeft-5); }
          else if(r<0.10&&wave>=2) { spawnElite();    waveEnemiesLeft=Math.max(0,waveEnemiesLeft-2); }
          else if(r<0.22&&wave>=2) { spawnFormation();waveEnemiesLeft=Math.max(0,waveEnemiesLeft-4); }
          else                     { spawnEnemy();    waveEnemiesLeft--; }
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
  // cooldown: boss ölümünden sonra da çalışsın
  if(wavePhase==='cooldown'){
    waveCooldown-=rawDt; if(waveCooldown<=0) startWave();
  }

  // Boss (enemies.js'deki updateBoss)
  if(bossActive&&boss) updateBoss(s,rawDt);

  // ── DÜŞMANLAR ────────────────────────────────────
  enemies=enemies.filter(e=>{
    e.y+=e.dy*s;
    if(e.zigzag) e.x+=e.dx*Math.sin(Date.now()/380+e.zigPhase)*1.4;
    if(e.hitFlash>0) e.hitFlash-=rawDt;
    e.x=Math.max(e.w/2,Math.min(canvas.width-e.w/2,e.x));
    // Stealth görünürlük
    if(e.shape==='stealth'){
      e.stealthTimer-=rawDt;
      if(e.stealthTimer<=0){ e.stealthVisible=!e.stealthVisible; e.stealthTimer=e.stealthVisible?1500:2500; }
    }
    // Ateş
    if((e.stealthVisible||e.isElite)&&Math.random()<e.shootRate*ms&&player){
      const ang=Math.atan2(player.y-e.y,player.x-e.x);
      eBullets.push({x:e.x,y:e.y+e.h/2,vx:Math.cos(ang)*e.bulletSpeed*0.45,vy:e.bulletSpeed,color:e.color});
    }
    let alive=true;
    bullets=bullets.filter(b=>{
      if(!alive) return true;
      if(e.shape==='stealth'&&!e.stealthVisible&&e.hitFlash<=0) return true;
      if(!rectsOverlap(e.x,e.y,e.w,e.h,b.x,b.y,b.w,b.h)) return true;
      if(e.ability==='reflect'&&e.hp>1){ b.vy=Math.abs(b.vy)*0.85; b.color='#ffff00'; e.hitFlash=80; explode(b.x,b.y,'#ffff00',5); return true; }
      if(e.ability==='shield'&&e.shieldHp>0){ e.shieldHp-=b.dmg; e.hitFlash=80; explode(b.x,b.y,'#00ccff',5); return false; }
      e.hp-=b.dmg; e.hitFlash=80; explode(b.x,b.y,e.color,6); sfxEnemyHit();
      if(e.hp<=0){
        explode(e.x,e.y,e.color,28); sfxEnemyDie();
        if(e.ability==='bomb'){
          triggerShake(4); triggerFlash('#ff6600',0.2);
          for(let i=0;i<8;i++){
            const a2=i/8*Math.PI*2;
            eBullets.push({x:e.x,y:e.y,vx:Math.cos(a2)*180,vy:Math.sin(a2)*180,color:'#ff6600'});
          }
        }
        const pts=applyPassiveScore(Math.floor((e.score+wave*25)*comboMultiplier()));
        score+=pts; sessionKills++; waveKilled++;
        checkDailyMission('kill100',1); checkDailyMission('score5k',pts);
        addCombo(); spawnPowerup(e.x,e.y);
        if(e.ability==='split'){
          for(let si=0;si<2;si++)
            enemies.push({...ENEMY_TYPES[0],x:e.x+(si?32:-32),y:e.y,hp:2,maxHp:2,dy:e.dy+25,dx:0,zigPhase:0,hitFlash:0,isElite:false,score:60,stealthTimer:0,stealthVisible:true,shootCd:0});
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
    if(rectsOverlap(player.x,player.y,player.w*1.5,player.h*1.5,p.x,p.y,p.r*2,p.r*2)){ applyPowerup(p); return false; }
    return p.y<canvas.height+35;
  });

  // Partiküller
  particles=particles.filter(p=>{
    p.x+=p.vx*s; p.y+=p.vy*s; p.vx*=0.94; p.vy*=0.94; p.life-=p.decay*s; return p.life>0;
  });

  document.getElementById('scoreEl').textContent=score.toLocaleString();
  renderDailyUI();
  updateShipLevel();
}

// ── ÇİZİM ────────────────────────────────────────────
function draw(){
  ctx.save();
  if(shakeAmt>0.5) ctx.translate((Math.random()-0.5)*shakeAmt*2.5,(Math.random()-0.5)*shakeAmt*2.5);

  // Arka plan
  const bg=ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#000008'); bg.addColorStop(0.5,'#00000e'); bg.addColorStop(1,'#000020');
  ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height);

  drawStars();
  drawNebula();

  // Partiküller
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

  // Ekran flaşı
  if(screenFlashAmt>0.02){
    ctx.save(); ctx.globalAlpha=screenFlashAmt;
    ctx.fillStyle=screenFlashColor; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  // Scanlines
  ctx.save(); ctx.globalAlpha=0.025;
  ctx.fillStyle=scanlinePattern||'transparent'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();

  // Vignette
  const vg=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.height*0.3,canvas.width/2,canvas.height/2,canvas.height*0.9);
  vg.addColorStop(0,'transparent'); vg.addColorStop(1,'rgba(0,0,0,0.6)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.restore();
}

function drawNebula(){
  ctx.save();
  const r=Math.min(canvas.width,canvas.height)*0.6;
  const px=canvas.width*0.65+Math.cos(nebulaAngle)*25, py=canvas.height*0.3+Math.sin(nebulaAngle*0.7)*18;
  const n1=ctx.createRadialGradient(px,py,10,px,py,r);
  n1.addColorStop(0,'rgba(100,0,180,0.07)'); n1.addColorStop(1,'transparent');
  ctx.fillStyle=n1; ctx.fillRect(0,0,canvas.width,canvas.height);
  const n2=ctx.createRadialGradient(canvas.width*0.2,canvas.height*0.72,5,canvas.width*0.2,canvas.height*0.72,r*0.65);
  n2.addColorStop(0,'rgba(0,140,110,0.05)'); n2.addColorStop(1,'transparent');
  ctx.fillStyle=n2; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
}

// ── BAŞLANGIÇ ────────────────────────────────────────
resize();
initStars();
// Ses menü müziği: ilk tıklamada başlasın (mobile autoplay politikası)
document.body.addEventListener('click',()=>{ if(audioReady&&musicPlaying===null) startMenuMusic(); },{once:true});
document.body.addEventListener('touchstart',()=>{ initAudio(); if(musicPlaying===null) startMenuMusic(); },{once:true});
requestAnimationFrame(menuDraw);

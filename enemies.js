// ═══════════════════════════════════════════════════════
//  ENEMIES.JS  –  8 düşman tipi, gelişmiş boss, zorluk
// ═══════════════════════════════════════════════════════

const ENEMY_TYPES = [
  { w:38,h:22,hp:2,  score:100,color:'#ff4466',speed:90,  shape:'ufo',    shootRate:0.004,bulletSpeed:170,unlockWave:1 },
  { w:28,h:32,hp:3,  score:200,color:'#ff9900',speed:150, shape:'dart',   shootRate:0.003,bulletSpeed:200,unlockWave:2,zigzag:true },
  { w:48,h:40,hp:8,  score:400,color:'#aa44ff',speed:55,  shape:'tank',   shootRate:0.006,bulletSpeed:150,unlockWave:2 },
  { w:24,h:28,hp:2,  score:250,color:'#00ffcc',speed:210, shape:'speeder',shootRate:0.002,bulletSpeed:240,unlockWave:3,zigzag:true },
  { w:44,h:38,hp:6,  score:350,color:'#ff6600',speed:60,  shape:'bomber', shootRate:0.003,bulletSpeed:145,unlockWave:4,ability:'bomb' },
  { w:22,h:36,hp:4,  score:300,color:'#ffff00',speed:35,  shape:'sniper', shootRate:0.0008,bulletSpeed:440,unlockWave:5 },
  { w:18,h:18,hp:1,  score:80, color:'#ff44ff',speed:125, shape:'swarm',  shootRate:0.001,bulletSpeed:160,unlockWave:6 },
  { w:32,h:28,hp:5,  score:500,color:'#44ffff',speed:100, shape:'stealth',shootRate:0.004,bulletSpeed:200,unlockWave:7 },
];

const ELITE_TYPES = [
  { id:'shield',   color:'#00ccff',label:'KALKAN',  hp:12,w:48,h:40,ability:'shield'  },
  { id:'splitter', color:'#ff6600',label:'BÖLÜNÜR', hp:10,w:42,h:36,ability:'split'   },
  { id:'reflector',color:'#ffff00',label:'YANSITIR',hp:8, w:44,h:38,ability:'reflect' },
  { id:'phantom',  color:'#ff44ff',label:'HAYALET', hp:9, w:40,h:34,ability:'phase'   },
];

// ── SPAWN ─────────────────────────────────────────────
function spawnEnemy(){
  const available=ENEMY_TYPES.filter(t=>t.unlockWave<=wave);
  const weights=available.map(t=>Math.max(1,10-(t.unlockWave-1)+(wave>=t.unlockWave+3?4:0)));
  const total=weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total,t=available[0],acc=0;
  for(let i=0;i<available.length;i++){acc+=weights[i];if(r<acc){t=available[i];break;}}
  const x=t.w+Math.random()*(canvas.width-t.w*2);
  const hpB=Math.floor(wave/3), spB=wave*4;
  enemies.push({
    ...t,x,y:-t.h,hp:t.hp+hpB,maxHp:t.hp+hpB,
    dy:t.speed+spB,dx:t.zigzag?(Math.random()>0.5?1:-1)*70:0,
    zigPhase:Math.random()*Math.PI*2,hitFlash:0,isElite:false,
    stealthTimer:t.shape==='stealth'?3000:0,stealthVisible:t.shape!=='stealth',shootCd:0,
  });
}

function spawnElite(){
  const t=ELITE_TYPES[Math.floor(Math.random()*ELITE_TYPES.length)];
  const x=t.w+Math.random()*(canvas.width-t.w*2);
  const hp=t.hp+wave*3;
  enemies.push({
    ...t,x,y:-t.h,hp,maxHp:hp,dy:75+wave*5,dx:0,zigPhase:0,hitFlash:0,
    isElite:true,shootRate:0.007,bulletSpeed:175,shape:'elite',
    shieldHp:t.ability==='shield'?8:0,phaseTimer:0,score:1000+wave*120,shootCd:0,
  });
}

function spawnFormation(){
  const shapes=['v','arrow','line','diamond'];
  const shape=shapes[Math.floor(Math.random()*shapes.length)];
  const cx=80+Math.random()*(canvas.width-160);
  const t=ENEMY_TYPES[Math.min(Math.floor(wave/3),2)];
  const positions=[];
  if(shape==='v'){ for(let i=-2;i<=2;i++) positions.push({x:cx+i*46,y:-60-Math.abs(i)*38}); }
  else if(shape==='arrow'){
    positions.push({x:cx,y:-40});
    for(let i=1;i<=2;i++){positions.push({x:cx-i*40,y:-40+i*32});positions.push({x:cx+i*40,y:-40+i*32});}
  } else if(shape==='diamond'){
    positions.push({x:cx,y:-30},{x:cx-44,y:-70},{x:cx+44,y:-70},{x:cx,y:-110});
  } else { for(let i=-2;i<=2;i++) positions.push({x:cx+i*46,y:-50}); }
  for(const pos of positions){
    const hpB=1+Math.floor(wave/4);
    enemies.push({...t,x:pos.x,y:pos.y,hp:hpB,maxHp:hpB,dy:70+wave*5,dx:0,zigPhase:0,hitFlash:0,isElite:false,isFormation:true,score:180,stealthTimer:0,stealthVisible:true,shootCd:0});
  }
}

function spawnSwarm(){
  const count=6+Math.floor(wave/2);
  const t=ENEMY_TYPES[6];
  for(let i=0;i<count;i++){
    const x=20+Math.random()*(canvas.width-40);
    enemies.push({...t,x,y:-30-Math.random()*80,hp:1,maxHp:1,dy:t.speed+wave*3,dx:(Math.random()-0.5)*100,zigPhase:Math.random()*Math.PI*2,hitFlash:0,isElite:false,stealthTimer:0,stealthVisible:true,shootCd:0,score:80});
  }
}

// ── ÇİZİM ─────────────────────────────────────────────
function drawEnemy(e){
  if(e.shape==='stealth'&&!e.stealthVisible&&e.hitFlash<=0){
    ctx.save(); ctx.globalAlpha=0.12; drawEnemyBody(e); ctx.restore(); drawEnemyHPBar(e); return;
  }
  ctx.save();
  if(e.hitFlash>0) ctx.filter='brightness(3.5)';
  ctx.shadowColor=e.color; ctx.shadowBlur=e.isElite?28:18;
  drawEnemyBody(e);
  ctx.restore();
  drawEnemyHPBar(e);
}

function drawEnemyBody(e){
  const col=e.hitFlash>0?'#fff':e.color;
  switch(e.shape){
    case 'ufo': case 'elite':{
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w/2,e.h/2.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.ellipse(e.x,e.y-e.h/5,e.w/3,e.h/2.8,0,Math.PI,Math.PI*2); ctx.fill();
      for(let i=-1;i<=1;i++){
        ctx.fillStyle=`hsl(${(Date.now()/4+i*120)%360},100%,70%)`;
        ctx.beginPath(); ctx.arc(e.x+i*12,e.y+2,3,0,Math.PI*2); ctx.fill();
      }
      if(e.isElite){
        ctx.strokeStyle=col; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w/2+5,e.h/2.5+5,0,0,Math.PI*2); ctx.stroke();
        ctx.filter='none'; ctx.font='bold 9px Orbitron,monospace'; ctx.fillStyle='#fff';
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(e.label||'',e.x,e.y);
      }
      if(e.ability==='shield'&&e.shieldHp>0){
        ctx.filter='none'; ctx.strokeStyle='#00ccff'; ctx.lineWidth=2.5;
        ctx.globalAlpha=0.5+0.3*Math.sin(Date.now()/120);
        ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w*0.75,e.h*0.75,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
      }
      if(e.ability==='phase'){
        ctx.filter='none'; ctx.strokeStyle='#ff44ff'; ctx.lineWidth=1.5;
        ctx.globalAlpha=0.3+0.5*Math.abs(Math.sin(Date.now()/200));
        ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w*0.8,e.h*0.8,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
      }
      break;
    }
    case 'dart':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(e.x,e.y+e.h/2); ctx.lineTo(e.x-e.w/2,e.y-e.h/2); ctx.lineTo(e.x,e.y-e.h/5); ctx.lineTo(e.x+e.w/2,e.y-e.h/2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle=col+'55'; ctx.beginPath(); ctx.ellipse(e.x,e.y+e.h/2+6,4,7+4*Math.sin(Date.now()/60),0,0,Math.PI*2); ctx.fill();
      break;
    }
    case 'tank':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=col; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.roundRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h,5); ctx.fill(); ctx.stroke();
      ctx.fillStyle=col; ctx.fillRect(e.x-7,e.y+e.h/4,6,16); ctx.fillRect(e.x+1,e.y+e.h/4,6,16);
      break;
    }
    case 'speeder':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=col; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(e.x,e.y-e.h/2); ctx.lineTo(e.x+e.w/2,e.y+e.h/3); ctx.lineTo(e.x,e.y+e.h/2); ctx.lineTo(e.x-e.w/2,e.y+e.h/3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.globalAlpha=0.4; ctx.strokeStyle=col; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(e.x-e.w/2,e.y); ctx.lineTo(e.x-e.w*0.9,e.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(e.x+e.w/2,e.y); ctx.lineTo(e.x+e.w*0.9,e.y); ctx.stroke();
      ctx.globalAlpha=1; break;
    }
    case 'bomber':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w/2,e.h/2,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      const pulse=0.5+0.5*Math.sin(Date.now()/(300-Math.min(wave*20,250)));
      ctx.fillStyle=`rgba(255,100,0,${pulse})`; ctx.beginPath(); ctx.arc(e.x,e.y,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=col+'44'; ctx.strokeStyle=col; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(e.x-e.w/2,e.y-4); ctx.lineTo(e.x-e.w*0.9,e.y+10); ctx.lineTo(e.x-e.w/2,e.y+10); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(e.x+e.w/2,e.y-4); ctx.lineTo(e.x+e.w*0.9,e.y+10); ctx.lineTo(e.x+e.w/2,e.y+10); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    }
    case 'sniper':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(e.x,e.y-e.h/2); ctx.lineTo(e.x+e.w/2,e.y); ctx.lineTo(e.x+e.w/3,e.y+e.h/2); ctx.lineTo(e.x-e.w/3,e.y+e.h/2); ctx.lineTo(e.x-e.w/2,e.y); ctx.closePath(); ctx.fill(); ctx.stroke();
      if(player){
        ctx.save(); ctx.strokeStyle=col+'44'; ctx.lineWidth=1; ctx.setLineDash([4,7]);
        ctx.beginPath(); ctx.moveTo(e.x,e.y+e.h/2); ctx.lineTo(player.x,player.y); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      }
      break;
    }
    case 'swarm':{
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.globalAlpha=0.5; ctx.beginPath(); ctx.arc(e.x,e.y,e.w/4,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      break;
    }
    case 'stealth':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(e.x,e.y-e.h/2); ctx.lineTo(e.x+e.w/2,e.y+e.h/2); ctx.lineTo(e.x,e.y+e.h/4); ctx.lineTo(e.x-e.w/2,e.y+e.h/2); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    }
  }
}

function drawEnemyHPBar(e){
  if(e.hp>=e.maxHp&&!e.isElite) return;
  ctx.filter='none';
  const bw=e.w*1.0;
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-11,bw,5);
  ctx.fillStyle=e.hp/e.maxHp>0.5?e.color:'#ff2244'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-11,bw*(e.hp/e.maxHp),5);
}

// ── BOSS ─────────────────────────────────────────────
function spawnBoss(){
  bossActive=true;
  const hp=30+wave*12;
  boss={x:canvas.width/2,y:-100,w:120,h:84,hp,maxHp:hp,speed:60+wave*1.5,dx:1,shootTimer:0,hitFlash:0,color:'#cc00ff',phase:1,phase2Triggered:false,spiralAngle:0,deathTimer:-1};
  showWaveText('⚠ BOSS ⚠');
  sfxBossWarning();
}

function updateBoss(s,rawDt){
  if(!bossActive||!boss) return;

  // Ölüm animasyonu
  if(boss.deathTimer>=0){
    boss.deathTimer-=rawDt;
    if(Math.random()<0.3) explode(boss.x+(Math.random()-0.5)*boss.w,boss.y+(Math.random()-0.5)*boss.h,Math.random()<0.5?'#cc00ff':'#ff4466',8);
    if(boss.deathTimer<=0){
      explode(boss.x,boss.y,'#cc00ff',70); explode(boss.x,boss.y,'#ffffff',35);
      sfxBossDie(); triggerShake(8); triggerSlowmo(800);
      score+=Math.floor((4000+wave*800)*comboMultiplier());
      spawnPowerup(boss.x-30,boss.y); spawnPowerup(boss.x+30,boss.y); spawnPowerup(boss.x,boss.y+20);
      bossActive=false; boss=null;
      wave++; document.getElementById('waveEl').textContent=wave;
      waveCooldown=2800; wavePhase='cooldown';
      checkDailyMission('wave5',1); onWavePassive();
    }
    return;
  }

  // Faz 2
  if(!boss.phase2Triggered&&boss.hp<boss.maxHp*0.5){
    boss.phase2Triggered=true; boss.phase=2; boss.speed+=20; boss.color='#ff0044';
    showWaveText('⚠ FAZ 2 ⚠'); explode(boss.x,boss.y,'#ff0044',30); triggerShake(5);
  }

  if(boss.y<120) boss.y+=boss.speed*s*0.8;
  boss.x+=boss.dx*boss.speed*s;
  if(boss.x>canvas.width-boss.w/2||boss.x<boss.w/2) boss.dx*=-1;
  boss.shootTimer-=rawDt;
  if(boss.hitFlash>0) boss.hitFlash-=rawDt;

  if(boss.shootTimer<=0){
    boss.shootTimer=Math.max(180,700-wave*20);
    const p2=boss.phase===2;
    for(let a=-1;a<=1;a++) eBullets.push({x:boss.x+a*30,y:boss.y+boss.h/2,vx:a*80,vy:240,color:boss.color});
    if(wave>=2||p2) eBullets.push({x:boss.x,y:boss.y+boss.h/2,vx:0,vy:320,color:'#ff00cc'});
    if(p2){
      boss.spiralAngle+=0.45;
      for(let i=0;i<5;i++){
        const ang=boss.spiralAngle+i*(Math.PI*2/5);
        eBullets.push({x:boss.x,y:boss.y,vx:Math.cos(ang)*180,vy:Math.sin(ang)*180+80,color:'#ff0044'});
      }
    }
    if(wave>=4&&player){
      const ang=Math.atan2(player.y-boss.y,player.x-boss.x);
      eBullets.push({x:boss.x,y:boss.y,vx:Math.cos(ang)*290,vy:Math.sin(ang)*290,color:'#ffcc00'});
    }
  }

  if(invincible<=0&&!shieldActive&&rectsOverlap(player.x,player.y,player.w,player.h,boss.x,boss.y,boss.w,boss.h)) hitPlayer();

  // Mermi isabet – ölüm animasyonu başlatır, boss anında silinmez
  bullets=bullets.filter(b=>{
    if(!rectsOverlap(boss.x,boss.y,boss.w,boss.h,b.x,b.y,b.w,b.h)) return true;
    boss.hp-=b.dmg; boss.hitFlash=80;
    explode(b.x,b.y,'#cc00ff',6); sfxBossHit();
    if(boss.hp<=0&&boss.deathTimer<0){
      boss.deathTimer=600; boss.speed=0; boss.dx=0;
    }
    return false;
  });
}

function drawBoss(b){
  ctx.save();
  if(b.hitFlash>0) ctx.filter='brightness(3.5)';
  const col=b.phase===2?'#ff0044':b.color;
  ctx.shadowColor=col; ctx.shadowBlur=42;
  ctx.fillStyle='#080818'; ctx.strokeStyle=col; ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(b.x,b.y-b.h/2); ctx.lineTo(b.x+b.w/2,b.y); ctx.lineTo(b.x+b.w*0.8,b.y+b.h/2);
  ctx.lineTo(b.x-b.w*0.8,b.y+b.h/2); ctx.lineTo(b.x-b.w/2,b.y); ctx.closePath(); ctx.fill(); ctx.stroke();
  // İç detay
  ctx.strokeStyle=col+'44'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(b.x,b.y-b.h/2); ctx.lineTo(b.x,b.y+b.h/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(b.x-b.w*0.4,b.y-8); ctx.lineTo(b.x+b.w*0.4,b.y-8); ctx.stroke();
  if(b.phase===2){
    ctx.strokeStyle='#ff0044'; ctx.lineWidth=2;
    ctx.globalAlpha=0.35+0.28*Math.sin(Date.now()/130);
    ctx.beginPath(); ctx.ellipse(b.x,b.y,b.w*0.75,b.h*0.75,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
  }
  // Göz
  ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(b.x,b.y-8,28,22,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(b.x,b.y-8,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath();
  ctx.arc(b.x+Math.sin(Date.now()/280)*6,b.y-8+Math.cos(Date.now()/380)*4,5.5,0,Math.PI*2); ctx.fill();
  // HP bar
  const bw=b.w*1.4;
  ctx.filter='none'; ctx.shadowBlur=0;
  ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(b.x-bw/2,b.y-b.h/2-19,bw,9);
  const hpF=Math.max(0,b.hp/b.maxHp);
  ctx.fillStyle=hpF>0.5?col:(hpF>0.25?'#ff8800':'#ff0000');
  ctx.fillRect(b.x-bw/2,b.y-b.h/2-19,bw*hpF,9);
  ctx.strokeStyle=col+'55'; ctx.lineWidth=1; ctx.strokeRect(b.x-bw/2,b.y-b.h/2-19,bw,9);
  ctx.fillStyle='#fff'; ctx.font='bold 7px Share Tech Mono,monospace';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(`${Math.max(0,b.hp)}/${b.maxHp}`,b.x,b.y-b.h/2-14);
  // Motor alevleri
  const fH=14+9*Math.sin(Date.now()/65);
  const fG=ctx.createLinearGradient(b.x,b.y+b.h/2,b.x,b.y+b.h/2+fH);
  fG.addColorStop(0,col+'cc'); fG.addColorStop(1,'transparent'); ctx.fillStyle=fG;
  for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.ellipse(b.x+i*b.w*0.3,b.y+b.h/2+fH/2,11,fH/2,0,0,Math.PI*2); ctx.fill(); }
  ctx.restore();
}

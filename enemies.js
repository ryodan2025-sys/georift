// ═══════════════════════════════════════════════════════
//  ENEMIES.JS  –  Düşman tipleri, spawn, çizim, boss
// ═══════════════════════════════════════════════════════

const ENEMY_TYPES=[
  {w:38,h:22,hp:1,score:100,color:'#ff4466',speed:80, shape:'ufo', shootRate:0.003,bulletSpeed:160},
  {w:28,h:32,hp:2,score:200,color:'#ff9900',speed:130,shape:'dart',shootRate:0.002,bulletSpeed:180,zigzag:true},
  {w:48,h:40,hp:4,score:400,color:'#aa44ff',speed:55, shape:'tank',shootRate:0.005,bulletSpeed:140},
];

const ELITE_TYPES=[
  {id:'shield',    color:'#00ccff',label:'KALKAN',  hp:8,w:46,h:38,ability:'shield'},
  {id:'splitter',  color:'#ff6600',label:'BÖLÜNÜR', hp:6,w:40,h:34,ability:'split'},
  {id:'reflector', color:'#ffff00',label:'YANSITIR',hp:5,w:42,h:36,ability:'reflect'},
];

// ── SPAWN ─────────────────────────────────────────────
function spawnEnemy(){
  const typePool=ENEMY_TYPES.slice(0,Math.min(ENEMY_TYPES.length,1+Math.floor(wave/2)));
  const t=typePool[Math.floor(Math.random()*typePool.length)];
  const x=t.w+Math.random()*(canvas.width-t.w*2);
  enemies.push({...t,x,y:-t.h,
    hp:t.hp+Math.floor(wave/3), maxHp:t.hp+Math.floor(wave/3),
    dy:t.speed+wave*5, dx:t.zigzag?(Math.random()>0.5?1:-1)*60:0,
    zigPhase:Math.random()*Math.PI*2, hitFlash:0, isElite:false});
}

function spawnElite(){
  const t=ELITE_TYPES[Math.floor(Math.random()*ELITE_TYPES.length)];
  const x=t.w+Math.random()*(canvas.width-t.w*2);
  const hp=t.hp+wave*2;
  enemies.push({...t,x,y:-t.h,hp,maxHp:hp,
    dy:70+wave*4,dx:0,zigPhase:0,hitFlash:0,
    isElite:true,shootRate:0.006,bulletSpeed:160,shape:'elite',
    shieldHp:t.ability==='shield'?5:0, score:800+wave*100});
}

function spawnFormation(){
  const shapes=['v','arrow','line'];
  const shape=shapes[Math.floor(Math.random()*shapes.length)];
  const cx=60+Math.random()*(canvas.width-120);
  const t=ENEMY_TYPES[0];
  const positions=[];
  if(shape==='v'){
    for(let i=-2;i<=2;i++) positions.push({x:cx+i*44,y:-60-Math.abs(i)*36});
  } else if(shape==='arrow'){
    positions.push({x:cx,y:-40});
    for(let i=1;i<=2;i++){positions.push({x:cx-i*38,y:-40+i*30});positions.push({x:cx+i*38,y:-40+i*30});}
  } else {
    for(let i=-2;i<=2;i++) positions.push({x:cx+i*44,y:-50});
  }
  for(const pos of positions){
    enemies.push({...t,x:pos.x,y:pos.y,
      hp:1+Math.floor(wave/3),maxHp:1+Math.floor(wave/3),
      dy:65+wave*4,dx:0,zigPhase:0,hitFlash:0,isElite:false,isFormation:true,score:150});
  }
}

// ── ÇİZİM ────────────────────────────────────────────
function drawEnemy(e){
  ctx.save();
  if(e.hitFlash>0) ctx.filter='brightness(3)';
  ctx.shadowColor=e.color; ctx.shadowBlur=e.isElite?22:14;

  if(e.shape==='ufo'||e.shape==='elite'){
    const col=e.hitFlash>0?'#fff':e.color;
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w/2,e.h/2.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(e.x,e.y-e.h/5,e.w/3,e.h/2.8,0,Math.PI,Math.PI*2); ctx.fill();
    for(let i=-1;i<=1;i++){
      ctx.fillStyle=`hsl(${(Date.now()/5+i*120)%360},100%,70%)`;
      ctx.beginPath(); ctx.arc(e.x+i*12,e.y+2,3,0,Math.PI*2); ctx.fill();
    }
    if(e.isElite){
      ctx.strokeStyle=e.color; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w/2+4,e.h/2.5+4,0,0,Math.PI*2); ctx.stroke();
      ctx.filter='none'; ctx.font='bold 9px Orbitron,monospace'; ctx.fillStyle='#fff';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(e.label||'',e.x,e.y);
    }
    if(e.ability==='shield'&&e.shieldHp>0){
      ctx.filter='none'; ctx.strokeStyle='#00ccff'; ctx.lineWidth=2; ctx.globalAlpha=0.6;
      ctx.beginPath(); ctx.ellipse(e.x,e.y,e.w*0.7,e.h*0.7,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
    }
  } else if(e.shape==='dart'){
    ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=e.color; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(e.x,e.y+e.h/2); ctx.lineTo(e.x-e.w/2,e.y-e.h/2);
    ctx.lineTo(e.x,e.y-e.h/5); ctx.lineTo(e.x+e.w/2,e.y-e.h/2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if(e.shape==='tank'){
    ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a'; ctx.strokeStyle=e.color; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.roundRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h,6); ctx.fill(); ctx.stroke();
    ctx.fillStyle=e.color; ctx.fillRect(e.x-4,e.y+4,8,18);
  }

  if(e.hp<e.maxHp||e.isElite){
    ctx.filter='none';
    const bw=e.w*0.9;
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-10,bw,5);
    ctx.fillStyle=e.color; ctx.fillRect(e.x-bw/2,e.y-e.h/2-10,bw*(e.hp/e.maxHp),5);
  }
  ctx.restore();
}

// ── BOSS ─────────────────────────────────────────────
function spawnBoss(){
  bossActive=true;
  boss={x:canvas.width/2,y:-90,w:110,h:76,
    hp:25+wave*10,maxHp:25+wave*10,
    speed:65,dx:1,shootTimer:0,hitFlash:0,color:'#cc00ff',phase:1};
  showWaveText('⚠ BOSS ⚠');
}

function drawBoss(b){
  ctx.save();
  if(b.hitFlash>0) ctx.filter='brightness(3)';
  ctx.shadowColor=b.color; ctx.shadowBlur=35;
  ctx.fillStyle='#0a0a1a'; ctx.strokeStyle=b.color; ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(b.x,b.y-b.h/2); ctx.lineTo(b.x+b.w/2,b.y); ctx.lineTo(b.x+b.w*0.75,b.y+b.h/2);
  ctx.lineTo(b.x-b.w*0.75,b.y+b.h/2); ctx.lineTo(b.x-b.w/2,b.y); ctx.closePath(); ctx.fill(); ctx.stroke();
  if(b.hp<b.maxHp*0.5){
    ctx.strokeStyle='#ff0044'; ctx.lineWidth=2; ctx.globalAlpha=0.4+0.3*Math.sin(Date.now()/150);
    ctx.beginPath(); ctx.ellipse(b.x,b.y,b.w*0.7,b.h*0.7,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
  }
  ctx.fillStyle=b.color; ctx.beginPath(); ctx.ellipse(b.x,b.y,26,20,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(b.x,b.y,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath();
  ctx.arc(b.x+Math.sin(Date.now()/300)*5,b.y+Math.cos(Date.now()/400)*4,4.5,0,Math.PI*2); ctx.fill();
  const bw=b.w*1.3;
  ctx.filter='none'; ctx.shadowBlur=0;
  ctx.fillStyle='rgba(200,0,255,0.2)'; ctx.fillRect(b.x-bw/2,b.y-b.h/2-16,bw,8);
  const hpFrac=b.hp/b.maxHp;
  ctx.fillStyle=hpFrac>0.5?b.color:'#ff0044'; ctx.fillRect(b.x-bw/2,b.y-b.h/2-16,bw*hpFrac,8);
  ctx.strokeStyle='rgba(200,0,255,0.4)'; ctx.lineWidth=1; ctx.strokeRect(b.x-bw/2,b.y-b.h/2-16,bw,8);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  ENEMIES.JS  – Düşmanlar + Zeka + Boss  v8
// ═══════════════════════════════════════════════════════

const ENEMY_TYPES=[
  {w:38,h:22,hp:2,  score:100,color:'#ff4466',speed:90,  shape:'ufo',    shootRate:0.004,bulletSpeed:170,unlockWave:1},
  {w:28,h:32,hp:3,  score:200,color:'#ff9900',speed:150, shape:'dart',   shootRate:0.003,bulletSpeed:200,unlockWave:2,zigzag:true},
  {w:48,h:40,hp:8,  score:400,color:'#aa44ff',speed:55,  shape:'tank',   shootRate:0.006,bulletSpeed:150,unlockWave:2},
  {w:24,h:28,hp:2,  score:250,color:'#00ffcc',speed:210, shape:'speeder',shootRate:0.002,bulletSpeed:240,unlockWave:3,zigzag:true},
  {w:44,h:38,hp:6,  score:350,color:'#ff6600',speed:60,  shape:'bomber', shootRate:0.003,bulletSpeed:145,unlockWave:4,ability:'bomb'},
  {w:22,h:36,hp:4,  score:300,color:'#ffff00',speed:35,  shape:'sniper', shootRate:0.001,bulletSpeed:440,unlockWave:5},
  {w:18,h:18,hp:1,  score:80, color:'#ff44ff',speed:125, shape:'swarm',  shootRate:0.001,bulletSpeed:160,unlockWave:3},
  {w:32,h:28,hp:5,  score:500,color:'#44ffff',speed:100, shape:'stealth',shootRate:0.004,bulletSpeed:200,unlockWave:6},
  {w:30,h:30,hp:5,  score:450,color:'#ff8844',speed:80,  shape:'orbital',shootRate:0.005,bulletSpeed:190,unlockWave:5},
  {w:20,h:30,hp:3,  score:280,color:'#ff2266',speed:280, shape:'kamikaze',shootRate:0.001,bulletSpeed:220,unlockWave:4},
];

const ELITE_TYPES=[
  {id:'shield',  color:'#00ccff',label:'KALKAN',  hp:12,w:48,h:40,ability:'shield'},
  {id:'splitter',color:'#ff6600',label:'BÖLÜNÜR', hp:10,w:42,h:36,ability:'split'},
  {id:'reflector',color:'#ffff00',label:'YANSITIR',hp:8,w:44,h:38,ability:'reflect'},
  {id:'phantom', color:'#ff44ff',label:'HAYALET', hp:9, w:40,h:34,ability:'phase'},
];

function aiUpdate(e, s, rawDt){
  if(!player) return;
  const dx = player.x - e.x;
  const dy = player.y - e.y;
  const dist = Math.max(Math.hypot(dx, dy), 1);

  switch(e.shape){
    case 'ufo':
    case 'elite':{
      e.x += (dx/dist) * 32 * s;
      e.x += Math.sin(Date.now()/800 + e.zigPhase) * 25 * s;
      break;
    }
    case 'dart':{
      if(dist < 350){
        e.x += (dx/dist)*70*s;
        e.y += (dy/dist)*35*s;
      } else {
        e.x += (dx/dist)*30*s;
      }
      break;
    }
    case 'tank':{
      const targetY = canvas.height * 0.3;
      if(e.y < targetY){ e.dy = Math.max(e.dy - 20*s, 20); }
      else if(e.y > targetY + 30){ e.dy = Math.min(e.dy + 10*s, 60); }
      const xDiff = dx;
      e.x += (xDiff/Math.max(Math.abs(xDiff),1)) * Math.min(Math.abs(xDiff), 22) * s;
      break;
    }
    case 'speeder':{
      e.x += (dx/dist) * 100 * s;
      if(Math.abs(dx) < 15) e.x -= (dx/dist)*40*s;
      break;
    }
    case 'sniper':{
      const snapY = canvas.height * 0.22;
      if(e.y < snapY){ e.dy *= 0.88; }
      else if(e.y > snapY + 20){ e.dy = Math.max(e.dy - 8*s, 8); }
      e.x += (dx/dist) * 18 * s;
      if(!e.sideTimer) e.sideTimer = 1800 + Math.random()*2000;
      e.sideTimer -= rawDt;
      if(e.sideTimer<=0){
        e.sideDx = (Math.random()>.5?1:-1)*95;
        e.sideTimer = 1200+Math.random()*1200;
      }
      e.x += (e.sideDx||0)*s;
      if(e.sideDx) e.sideDx *= 0.97;
      break;
    }
    case 'bomber':{
      if(dist < 280){
        e.x += (dx/dist) * 110 * s;
        e.y += (dy/dist) * 65 * s;
      }
      e.x += Math.sin(Date.now()/400 + e.zigPhase) * 15 * s;
      break;
    }
    case 'swarm':{
      let cx=0,cy=0,n=0;
      for(const o of enemies){
        if(o===e||o.shape!=='swarm') continue;
        const od=Math.hypot(o.x-e.x,o.y-e.y);
        if(od<90){cx+=o.x;cy+=o.y;n++;}
      }
      if(n>0){
        cx/=n; cy/=n;
        e.x+=(cx-e.x)*Math.min(0.06, 0.03*s*60);
        e.y+=(cy-e.y)*Math.min(0.02, 0.01*s*60);
      }
      e.x += (dx/dist) * 40 * s;
      break;
    }
    case 'stealth':{
      if(!e.stealthVisible){
        e.x += (dx/dist) * 60 * s;
      } else {
        e.y -= 10 * s;
        e.x += Math.sin(Date.now()/500 + e.zigPhase) * 40 * s;
      }
      break;
    }
    case 'orbital':{
      if(!e.orbitAngle) e.orbitAngle = Math.random()*Math.PI*2;
      if(!e.orbitRadius) e.orbitRadius = 180 + Math.random()*80;
      e.orbitAngle += (e.orbitDir||1) * 1.4 * s;
      const targetX = Math.max(e.w, Math.min(canvas.width-e.w, player.x + Math.cos(e.orbitAngle) * e.orbitRadius));
      const targetY = Math.max(e.h, Math.min(canvas.height*0.7, player.y + Math.sin(e.orbitAngle) * e.orbitRadius * 0.5));
      e.x += (targetX - e.x) * Math.min(3*s, 0.2);
      e.y += (targetY - e.y) * Math.min(3*s, 0.2);
      e.dy = 0;
      break;
    }
    case 'kamikaze':{
      e.x += (dx/dist) * e.dy * s;
      e.y += (dy/dist) * e.dy * s;
      e.dy = Math.min((e.dy||280) + 40*s, 420);
      break;
    }
  }
  e.x = Math.max(e.w/2, Math.min(canvas.width-e.w/2, e.x));
}

function spawnEnemy(){
  const av=ENEMY_TYPES.filter(t=>t.unlockWave<=wave);
  const wt=av.map(t=>Math.max(1,10-(t.unlockWave-1)+(wave>=t.unlockWave+3?4:0)));
  const tot=wt.reduce((a,b)=>a+b,0);
  let r=Math.random()*tot,t=av[0],acc=0;
  for(let i=0;i<av.length;i++){acc+=wt[i];if(r<acc){t=av[i];break;}}
  const x=t.w+Math.random()*(canvas.width-t.w*2);
  const hpB=Math.floor(wave/3), spB=wave*4;
  enemies.push({
    ...t,x,y:-t.h,
    hp:t.hp+hpB,maxHp:t.hp+hpB,
    dy:t.speed+spB,
    dx:t.zigzag?(Math.random()>.5?1:-1)*70:0,
    zigPhase:Math.random()*Math.PI*2,hitFlash:0,isElite:false,
    stealthTimer:t.shape==='stealth'?800:0,
    stealthVisible:true,
    shootCd:0,sideTimer:0,sideDx:0,
    orbitAngle:Math.random()*Math.PI*2,
    orbitRadius:160+Math.random()*100,
    orbitDir:Math.random()>.5?1:-1,
  });
}

function spawnElite(){
  const t=ELITE_TYPES[Math.floor(Math.random()*ELITE_TYPES.length)];
  const x=t.w+Math.random()*(canvas.width-t.w*2);
  const hp=t.hp+wave*3;
  enemies.push({
    ...t,x,y:-t.h,hp,maxHp:hp,dy:70+wave*5,dx:0,
    zigPhase:Math.random()*Math.PI*2,hitFlash:0,
    isElite:true,shootRate:0.007,bulletSpeed:175,shape:'elite',
    shieldHp:t.ability==='shield'?8:0,score:1000+wave*120,
    shootCd:0,sideTimer:0,sideDx:0,
    stealthTimer:0,stealthVisible:true,
    orbitAngle:0,orbitRadius:200,orbitDir:1,
  });
}

function spawnFormation(){
  const shapes=['v','arrow','line','diamond'];
  const sh=shapes[Math.floor(Math.random()*shapes.length)];
  const cx=80+Math.random()*(canvas.width-160);
  const t=ENEMY_TYPES[Math.min(Math.floor(wave/3),3)];
  const pos=[];
  if(sh==='v'){for(let i=-2;i<=2;i++)pos.push({x:cx+i*46,y:-60-Math.abs(i)*38});}
  else if(sh==='arrow'){pos.push({x:cx,y:-40});for(let i=1;i<=2;i++){pos.push({x:cx-i*40,y:-40+i*32});pos.push({x:cx+i*40,y:-40+i*32});}}
  else if(sh==='diamond'){pos.push({x:cx,y:-30},{x:cx-44,y:-70},{x:cx+44,y:-70},{x:cx,y:-110});}
  else{for(let i=-2;i<=2;i++)pos.push({x:cx+i*46,y:-50});}
  const hpB=1+Math.floor(wave/4);
  for(const p of pos)
    enemies.push({...t,x:p.x,y:p.y,hp:hpB,maxHp:hpB,dy:68+wave*5,dx:0,
      zigPhase:Math.random()*Math.PI*2,hitFlash:0,isElite:false,isFormation:true,score:180,
      stealthTimer:0,stealthVisible:true,shootCd:0,sideTimer:0,sideDx:0,
      orbitAngle:0,orbitRadius:200,orbitDir:1});
}

function spawnSwarm(){
  const t=ENEMY_TYPES[6],cnt=6+Math.floor(wave/2);
  for(let i=0;i<cnt;i++)
    enemies.push({...t,x:20+Math.random()*(canvas.width-40),y:-30-Math.random()*80,
      hp:1,maxHp:1,dy:t.speed+wave*3,dx:(Math.random()-.5)*60,
      zigPhase:Math.random()*Math.PI*2,hitFlash:0,isElite:false,
      stealthTimer:0,stealthVisible:true,shootCd:0,sideTimer:0,sideDx:0,
      orbitAngle:0,orbitRadius:200,orbitDir:1,score:80});
}

function drawEnemy(e){
  if(e.shape==='stealth'&&!e.stealthVisible&&e.hitFlash<=0){
    ctx.save();ctx.globalAlpha=0.12;_drawBody(e);ctx.restore();_drawHP(e);return;
  }
  ctx.save();
  if(e.hitFlash>0)ctx.filter='brightness(3.5)';
  ctx.shadowColor=e.color;ctx.shadowBlur=e.isElite?28:16;
  _drawBody(e);ctx.restore();_drawHP(e);
}

function _drawBody(e){
  const col=e.hitFlash>0?'#fff':e.color;
  switch(e.shape){
    case 'ufo':case 'elite':{
      ctx.fillStyle=col;
      ctx.beginPath();ctx.ellipse(e.x,e.y,e.w/2,e.h/2.5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.18)';
      ctx.beginPath();ctx.ellipse(e.x,e.y-e.h/5,e.w/3,e.h/2.8,0,Math.PI,Math.PI*2);ctx.fill();
      for(let i=-1;i<=1;i++){
        ctx.fillStyle=`hsl(${(Date.now()/4+i*120)%360},100%,70%)`;
        ctx.beginPath();ctx.arc(e.x+i*12,e.y+2,3,0,Math.PI*2);ctx.fill();
      }
      if(e.isElite){
        ctx.strokeStyle=col;ctx.lineWidth=2.5;
        ctx.beginPath();ctx.ellipse(e.x,e.y,e.w/2+5,e.h/2.5+5,0,0,Math.PI*2);ctx.stroke();
        ctx.filter='none';ctx.font='bold 9px Orbitron,monospace';
        ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(e.label||'',e.x,e.y);
      }
      if(e.ability==='shield'&&e.shieldHp>0){
        ctx.filter='none';ctx.strokeStyle='#00ccff';ctx.lineWidth=2.5;
        ctx.globalAlpha=0.5+0.3*Math.sin(Date.now()/120);
        ctx.beginPath();ctx.ellipse(e.x,e.y,e.w*.75,e.h*.75,0,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=1;
      }
      break;
    }
    case 'dart':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a';ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(e.x,e.y+e.h/2);ctx.lineTo(e.x-e.w/2,e.y-e.h/2);
      ctx.lineTo(e.x,e.y-e.h/5);ctx.lineTo(e.x+e.w/2,e.y-e.h/2);ctx.closePath();
      ctx.fill();ctx.stroke();
      ctx.fillStyle=col+'55';
      ctx.beginPath();ctx.ellipse(e.x,e.y+e.h/2+5,4,6+4*Math.sin(Date.now()/60),0,0,Math.PI*2);ctx.fill();
      break;
    }
    case 'tank':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a';ctx.strokeStyle=col;ctx.lineWidth=2.5;
      ctx.beginPath();ctx.roundRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h,5);ctx.fill();ctx.stroke();
      ctx.fillStyle=col;ctx.fillRect(e.x-7,e.y+e.h/4,6,16);ctx.fillRect(e.x+1,e.y+e.h/4,6,16);
      ctx.strokeStyle=col+'66';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(e.x-e.w/2+4,e.y-4);ctx.lineTo(e.x+e.w/2-4,e.y-4);ctx.stroke();
      break;
    }
    case 'speeder':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a';ctx.strokeStyle=col;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(e.x,e.y-e.h/2);ctx.lineTo(e.x+e.w/2,e.y+e.h/3);
      ctx.lineTo(e.x,e.y+e.h/2);ctx.lineTo(e.x-e.w/2,e.y+e.h/3);ctx.closePath();
      ctx.fill();ctx.stroke();
      ctx.globalAlpha=.4;ctx.strokeStyle=col;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(e.x-e.w/2,e.y);ctx.lineTo(e.x-e.w,e.y);ctx.stroke();
      ctx.beginPath();ctx.moveTo(e.x+e.w/2,e.y);ctx.lineTo(e.x+e.w,e.y);ctx.stroke();
      ctx.globalAlpha=1;
      break;
    }
    case 'bomber':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a';ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(e.x,e.y,e.w/2,e.h/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      const pulse=.5+.5*Math.sin(Date.now()/(300-Math.min(wave*20,250)));
      ctx.fillStyle=`rgba(255,100,0,${pulse})`;ctx.beginPath();ctx.arc(e.x,e.y,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=col+'44';ctx.strokeStyle=col;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(e.x-e.w/2,e.y-4);ctx.lineTo(e.x-e.w*.9,e.y+10);ctx.lineTo(e.x-e.w/2,e.y+10);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(e.x+e.w/2,e.y-4);ctx.lineTo(e.x+e.w*.9,e.y+10);ctx.lineTo(e.x+e.w/2,e.y+10);ctx.closePath();ctx.fill();ctx.stroke();
      break;
    }
    case 'sniper':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a';ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(e.x,e.y-e.h/2);ctx.lineTo(e.x+e.w/2,e.y);
      ctx.lineTo(e.x+e.w/3,e.y+e.h/2);ctx.lineTo(e.x-e.w/3,e.y+e.h/2);
      ctx.lineTo(e.x-e.w/2,e.y);ctx.closePath();ctx.fill();ctx.stroke();
      if(player){
        ctx.save();ctx.strokeStyle=col+'55';ctx.lineWidth=1;ctx.setLineDash([4,7]);
        ctx.beginPath();ctx.moveTo(e.x,e.y+e.h/2);ctx.lineTo(player.x,player.y);ctx.stroke();
        ctx.setLineDash([]);ctx.restore();
      }
      break;
    }
    case 'swarm':{
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.globalAlpha=.5;
      ctx.beginPath();ctx.arc(e.x,e.y,e.w/4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      break;
    }
    case 'stealth':{
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a';ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(e.x,e.y-e.h/2);ctx.lineTo(e.x+e.w/2,e.y+e.h/2);
      ctx.lineTo(e.x,e.y+e.h/4);ctx.lineTo(e.x-e.w/2,e.y+e.h/2);ctx.closePath();
      ctx.fill();ctx.stroke();
      break;
    }
    case 'orbital':{
      const oang = Date.now()/400;
      ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=e.hitFlash>0?'#fff':col+'33';
      ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=col;
      ctx.beginPath();ctx.arc(e.x+Math.cos(oang)*e.w/2,e.y+Math.sin(oang)*e.h/2,4,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(e.x+Math.cos(oang+Math.PI)*e.w/2,e.y+Math.sin(oang+Math.PI)*e.h/2,4,0,Math.PI*2);ctx.fill();
      break;
    }
    case 'kamikaze':{
      if(!player){
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(e.x,e.y,e.w/2,0,Math.PI*2);ctx.fill();
        break;
      }
      const ang = Math.atan2(player.y-e.y, player.x-e.x) - Math.PI/2;
      ctx.save();ctx.translate(e.x,e.y);ctx.rotate(ang);
      ctx.fillStyle=e.hitFlash>0?'#fff':'#0a0a1a';ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,-e.h/2);ctx.lineTo(e.w/3,e.h/2);ctx.lineTo(0,e.h/3);ctx.lineTo(-e.w/3,e.h/2);ctx.closePath();
      ctx.fill();ctx.stroke();
      const fH2=8+5*Math.sin(Date.now()/50);
      ctx.fillStyle='#ff4400';ctx.globalAlpha=.7;
      ctx.beginPath();ctx.ellipse(0,e.h/2+fH2/2,5,fH2/2,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      ctx.restore();
      break;
    }
  }
}

function _drawHP(e){
  if(e.hp>=e.maxHp&&!e.isElite)return;
  ctx.filter='none';const bw=e.w;
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(e.x-bw/2,e.y-e.h/2-11,bw,5);
  ctx.fillStyle=e.hp/e.maxHp>.5?e.color:'#ff2244';
  ctx.fillRect(e.x-bw/2,e.y-e.h/2-11,bw*(e.hp/e.maxHp),5);
}

const BOSS_TYPES=[
  {color:'#cc00ff',name:'KÖR GÖZE',   phase2Color:'#ff44ff'},
  {color:'#ff0044',name:'KANA SUSAMIŞ',phase2Color:'#ff8800'},
  {color:'#00ffcc',name:'BUZ KRAL',   phase2Color:'#00aaff'},
  {color:'#ffcc00',name:'ALTIN TANRI',phase2Color:'#ff6600'},
  {color:'#ff6600',name:'ATEŞ TANRI', phase2Color:'#ffff00'},
];

function spawnBoss(){
  bossActive=true;
  const bossIdx=Math.floor((wave-1)/3);
  const bt=BOSS_TYPES[Math.min(bossIdx,BOSS_TYPES.length-1)];
  const hp=30+wave*15;
  boss={
    x:canvas.width/2,y:-100,w:120+wave*2,h:84,
    hp,maxHp:hp,speed:55+wave*2,dx:1,
    shootTimer:0,hitFlash:0,
    color:bt.color,phase2Color:bt.phase2Color||'#ff0044',name:bt.name,
    phase:1,phase2Done:false,spiralAng:0,
    moveMode:'sweep',moveTimer:3000,diveTarget:null,
    rageTimer:0,rageDone:false,
  };
  showWaveText('⚠ '+bt.name+' ⚠');
  try{sfxBossWarning();}catch(e){}
}

function updateBoss(s,rawDt){
  if(!bossActive||!boss)return;
  if(!boss.phase2Done&&boss.hp<boss.maxHp*.5){
    boss.phase2Done=true;boss.phase=2;boss.speed+=20;
    showWaveText('⚠ FAZ 2 ⚠');
    explode(boss.x,boss.y,boss.color,30);triggerShake(6);triggerFlash(boss.color,.35);
  }
  if(!boss.rageDone&&boss.hp<boss.maxHp*0.25){
    boss.rageDone=true;boss.rageTimer=4000;
    showWaveText('⚠ ÖFKE MODU ⚠');triggerFlash('#ff0000',.4);
  }
  if(boss.rageTimer>0) boss.rageTimer-=rawDt;
  const rageSpd=boss.rageTimer>0?1.6:1.0;
  if(boss.y<110) boss.y+=boss.speed*s*.9;
  boss.moveTimer-=rawDt;
  if(boss.moveTimer<=0){
    const modes=['sweep','circle','dive'];const prev=boss.moveMode;
    do{boss.moveMode=modes[Math.floor(Math.random()*modes.length)];}while(boss.moveMode===prev);
    boss.moveTimer=2000+Math.random()*2000;
    if(boss.moveMode==='dive'&&player) boss.diveTarget={x:player.x,y:player.y};
  }
  const spd=boss.speed*rageSpd;
  if(boss.moveMode==='sweep'){
    boss.x+=boss.dx*spd*s;
    if(boss.x>canvas.width-boss.w/2||boss.x<boss.w/2) boss.dx*=-1;
  } else if(boss.moveMode==='circle'&&boss.y>=110){
    const cx=canvas.width/2,radius=canvas.width*.30,angle=Date.now()/2000;
    boss.x+=(cx+Math.cos(angle)*radius-boss.x)*s*2.5;
    boss.y+=(100+Math.sin(angle*0.8)*45-boss.y)*s*1.4;
  } else if(boss.moveMode==='dive'&&boss.diveTarget){
    const tdx=boss.diveTarget.x-boss.x,tdy=boss.diveTarget.y-boss.y,td=Math.hypot(tdx,tdy);
    if(td>10){boss.x+=tdx/td*spd*1.5*s;boss.y+=tdy/td*spd*0.65*s;}
    else{boss.moveMode='sweep';boss.moveTimer=1500;}
    if(boss.y>canvas.height*.45){boss.moveMode='sweep';boss.moveTimer=2000;}
  }
  boss.y=Math.max(80,Math.min(canvas.height*.45,boss.y));
  if(boss.hitFlash>0) boss.hitFlash-=rawDt;
  boss.shootTimer-=rawDt;
  if(boss.shootTimer<=0){
    boss.shootTimer=Math.max(130,650-wave*15);
    const p2=boss.phase===2;
    const col=p2?boss.phase2Color:boss.color;
    for(let a=-1;a<=1;a++)
      eBullets.push({x:boss.x+a*28,y:boss.y+boss.h/2,vx:a*90,vy:260,color:col,w:8,h:12});
    eBullets.push({x:boss.x,y:boss.y+boss.h/2,vx:0,vy:320,color:'#ff00cc',w:8,h:12});
    if(p2){
      boss.spiralAng+=0.28;
      for(let i=0;i<4;i++){
        const a=boss.spiralAng+i*(Math.PI*2/4);
        eBullets.push({x:boss.x,y:boss.y,vx:Math.cos(a)*165,vy:Math.sin(a)*165+65,color:boss.phase2Color,w:7,h:10});
      }
    }
    if(wave>=4&&player){
      const a=Math.atan2(player.y-boss.y,player.x-boss.x);
      eBullets.push({x:boss.x,y:boss.y,vx:Math.cos(a)*280,vy:Math.sin(a)*280,color:'#ffcc00',w:9,h:13});
    }
    if(wave>=7){
      for(let i=0;i<5;i++){
        const spread=(i-2)*0.28,baseAng=Math.PI/2;
        eBullets.push({x:boss.x,y:boss.y+boss.h/2,vx:Math.cos(baseAng+spread)*195,vy:Math.sin(baseAng+spread)*195,color:'#ff8800',w:7,h:10});
      }
    }
    if(boss.rageTimer>0){
      const a=Math.atan2(player.y-boss.y,player.x-boss.x);
      eBullets.push({x:boss.x-20,y:boss.y,vx:Math.cos(a-0.2)*260,vy:Math.sin(a-0.2)*260,color:'#ff0000',w:8,h:12});
      eBullets.push({x:boss.x+20,y:boss.y,vx:Math.cos(a+0.2)*260,vy:Math.sin(a+0.2)*260,color:'#ff0000',w:8,h:12});
    }
  }
  if(invincible<=0&&!shieldActive&&rectsOverlap(player.x,player.y,player.w,player.h,boss.x,boss.y,boss.w,boss.h)) hitPlayer();
  bullets=bullets.filter(b=>{
    if(!rectsOverlap(boss.x,boss.y,boss.w,boss.h,b.x,b.y,b.w||4,b.h||14))return true;
    boss.hp-=b.dmg;boss.hitFlash=80;
    explode(b.x,b.y,boss.color,6);
    try{sfxBossHit();}catch(e){}
    if(boss.hp<=0){
      explode(boss.x,boss.y,boss.color,18);explode(boss.x-boss.w*.3,boss.y+boss.h*.2,"#ffffff",12);
      explode(boss.x+boss.w*.3,boss.y-boss.h*.2,'#ffcc00',20);explode(boss.x,boss.y+boss.h*.4,'#ff0044',20);
      try{sfxBossDie();}catch(e){}
      triggerShake(8);triggerFlash(boss.color,.45);
      score+=Math.floor((5000+wave*1000)*comboMultiplier());
      spawnPowerup(boss.x-35,boss.y);spawnPowerup(boss.x+35,boss.y);spawnPowerup(boss.x,boss.y+30);
      bossActive=false;boss=null;wave++;
      document.getElementById('waveEl').textContent=wave;
      waveCooldown=2200;wavePhase='cooldown';
      checkDailyMission('wave5',1);onWavePassive();
    }
    return false;
  });
}

function drawBoss(b){
  if(!b)return;
  ctx.save();
  if(b.hitFlash>0) ctx.filter='brightness(3.5)';
  const col=b.phase===2?b.phase2Color:b.color;
  ctx.shadowColor=col;ctx.shadowBlur=40;
  ctx.fillStyle='#080818';ctx.strokeStyle=col;ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(b.x,b.y-b.h/2);ctx.lineTo(b.x+b.w/2,b.y);
  ctx.lineTo(b.x+b.w*.8,b.y+b.h/2);ctx.lineTo(b.x-b.w*.8,b.y+b.h/2);
  ctx.lineTo(b.x-b.w/2,b.y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle=col+'44';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(b.x,b.y-b.h/2);ctx.lineTo(b.x,b.y+b.h/2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(b.x-b.w*.4,b.y-8);ctx.lineTo(b.x+b.w*.4,b.y-8);ctx.stroke();
  if(b.phase===2){
    ctx.strokeStyle=b.phase2Color;ctx.lineWidth=2;
    ctx.globalAlpha=.35+.28*Math.sin(Date.now()/130);
    ctx.beginPath();ctx.ellipse(b.x,b.y,b.w*.75,b.h*.75,0,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
  }
  if(b.rageTimer>0){
    ctx.filter='none';ctx.strokeStyle='#ff0000';ctx.lineWidth=3;
    ctx.globalAlpha=.5+.4*Math.sin(Date.now()/80);
    ctx.beginPath();ctx.ellipse(b.x,b.y,b.w*.55,b.h*.55,0,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
  }
  ctx.filter='none';
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(b.x,b.y-8,28,22,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y-8,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#000';ctx.beginPath();
  ctx.arc(b.x+Math.sin(Date.now()/280)*6,b.y-8+Math.cos(Date.now()/380)*4,5.5,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle=col;ctx.font='bold 10px Orbitron,monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(b.name||'',b.x,b.y-b.h/2-28);
  const bw=b.w*1.4;
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(b.x-bw/2,b.y-b.h/2-19,bw,9);
  const hf=Math.max(0,b.hp/b.maxHp);
  ctx.fillStyle=hf>.5?col:(hf>.25?'#ff8800':'#ff0000');
  ctx.fillRect(b.x-bw/2,b.y-b.h/2-19,bw*hf,9);
  ctx.strokeStyle=col+'55';ctx.lineWidth=1;
  ctx.strokeRect(b.x-bw/2,b.y-b.h/2-19,bw,9);
  ctx.fillStyle='#fff';ctx.font='bold 7px Share Tech Mono,monospace';
  ctx.fillText(Math.max(0,Math.ceil(b.hp))+'/'+b.maxHp,b.x,b.y-b.h/2-14);
  const fH=14+9*Math.sin(Date.now()/65);
  const fG=ctx.createLinearGradient(b.x,b.y+b.h/2,b.x,b.y+b.h/2+fH);
  fG.addColorStop(0,col+'cc');fG.addColorStop(1,'transparent');
  ctx.fillStyle=fG;
  for(let i=-1;i<=1;i++){
    ctx.beginPath();ctx.ellipse(b.x+i*b.w*.3,b.y+b.h/2+fH/2,11,fH/2,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
//  ENVIRONMENT.JS  –  Yıldızlar, asteroitler, partiküller, power-uplar
// ═══════════════════════════════════════════════════════

// ── YILDIZLAR ────────────────────────────────────────
function initStars(){
  stars=[];
  for(let i=0;i<140;i++)
    stars.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      r:Math.random()*1.5+0.3, speed:Math.random()*0.7+0.1, b:Math.random()});
}
function updateStars(dt){
  const now=Date.now();
  for(const st of stars){
    st.y+=st.speed*dt*60/1000;
    if(st.y>canvas.height){st.y=0;st.x=Math.random()*canvas.width;}
    st.b=0.4+0.6*Math.abs(Math.sin(now/1500+st.x));
  }
}
function drawStars(){
  for(const s of stars){ctx.globalAlpha=s.b*0.8;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;
}

// ── PARTİKÜLLER ──────────────────────────────────────
function explode(x,y,color,count=20){
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2, speed=Math.random()*220+60;
    particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      life:1,decay:Math.random()*1.5+0.8,r:Math.random()*4+1,color});
  }
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
  ctx.shadowColor='#aa8855'; ctx.shadowBlur=8;
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
  explode(p.x,p.y,p.color,15); sfxPowerup();
  if(p.type==='shield'){ shieldActive=true; setTimeout(()=>shieldActive=false,6000); }
  else if(p.type==='rapid'){ rapidFire=5000; }
  else if(p.type==='life'){ lives=Math.min(lives+1,5); renderLives(); }
  else if(p.type==='weapon'){ applyWeaponPowerup(); }
}

function drawPowerups(){
  for(const p of powerups){
    ctx.save();ctx.shadowColor=p.color;ctx.shadowBlur=16;ctx.strokeStyle=p.color;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=0.18+0.1*Math.sin(Date.now()/200);ctx.fillStyle=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.font=`${p.r*1.3}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(p.label,p.x,p.y);ctx.restore();
  }
}

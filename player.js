// ═══════════════════════════════════════════════════════
//  PLAYER.JS  –  Oyuncu gemisi: oluştur, çiz, dash, ateş
// ═══════════════════════════════════════════════════════

// ── OYUNCU OLUŞTUR ────────────────────────────────────
function createPlayer(){
  const ship = getSelectedShip();
  return {
    x: canvas.width/2,
    y: canvas.height*0.8,
    w: ship.w,
    h: ship.h,
    speed: ship.speed,
    color: getShipSkinColor(ship, selectedSkinIdx),
    shipId: ship.id,
  };
}

// ── RENK ──────────────────────────────────────────────
function getShipColorInGame(){
  // Ship level evolution tints the base color
  if(shipLevel>=3) return tintColor(player.color, 0.5, '#ff88ff');
  if(shipLevel>=2) return tintColor(player.color, 0.35, '#88ffff');
  return player.color;
}

// Basit renk karıştırma (hex → rgb)
function tintColor(base, t, tint){
  if(!base||!base.startsWith('#')) return base||'#00ffcc';
  const parse=hex=>{const v=parseInt(hex.slice(1),16);return[(v>>16)&255,(v>>8)&255,v&255];};
  const b=parse(base), ti=parse(tint);
  return `rgb(${Math.round(b[0]*(1-t)+ti[0]*t)},${Math.round(b[1]*(1-t)+ti[1]*t)},${Math.round(b[2]*(1-t)+ti[2]*t)})`;
}

// ── GEMİYİ ÇİZ ────────────────────────────────────────
function drawPlayer(p){
  if(invincible>0&&Math.floor(invincible/80)%2===0){
    // Ghost: yarı saydam yanıp sönme dash
    if(p.shipId==='ghost'&&dashActive>0) return;
  }

  const x=p.x, y=p.y, w=p.w, h=p.h;
  const col = getShipColorInGame();

  // ── Motor Alevi ──────────────────────────────────────
  const flameH=14+8*Math.sin(Date.now()/80);
  const flameGrad=ctx.createLinearGradient(x,y+h/2,x,y+h/2+flameH);
  flameGrad.addColorStop(0,'rgba(0,200,255,0.8)');
  flameGrad.addColorStop(0.5,'rgba(0,100,255,0.4)');
  flameGrad.addColorStop(1,'transparent');
  ctx.save(); ctx.fillStyle=flameGrad;
  ctx.beginPath(); ctx.ellipse(x,y+h/2+flameH/2,7,flameH/2,0,0,Math.PI*2); ctx.fill(); ctx.restore();

  // Titan: ikinci alev (ağır motor)
  if(p.shipId==='titan'){
    const f2H=10+6*Math.sin(Date.now()/100+1);
    const f2G=ctx.createLinearGradient(x,y+h/2,x,y+h/2+f2H);
    f2G.addColorStop(0,'rgba(100,80,255,0.7)'); f2G.addColorStop(1,'transparent');
    ctx.save(); ctx.fillStyle=f2G;
    ctx.beginPath(); ctx.ellipse(x-w*0.3,y+h/2+f2H/2,5,f2H/2,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+w*0.3,y+h/2+f2H/2,5,f2H/2,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle='#0a0a1a';
  ctx.strokeStyle=col;
  ctx.lineWidth=2;
  ctx.shadowColor=col;
  ctx.shadowBlur=shipLevel>=2?18:12;

  // ── Gövde ────────────────────────────────────────────
  if(p.shipId==='titan'){
    // Geniş, köşeli zırhlı görünüm
    ctx.beginPath();
    ctx.moveTo(x,       y-h/2);
    ctx.lineTo(x+w*0.55,y-h/4);
    ctx.lineTo(x+w/2,   y+h/2);
    ctx.lineTo(x+w/4,   y+h/2-6);
    ctx.lineTo(x,       y+h/3);
    ctx.lineTo(x-w/4,   y+h/2-6);
    ctx.lineTo(x-w/2,   y+h/2);
    ctx.lineTo(x-w*0.55,y-h/4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if(p.shipId==='ghost'){
    // Dar, sivri stealth görünüm
    ctx.globalAlpha = dashActive>0 ? 0.45 : 1;
    ctx.beginPath();
    ctx.moveTo(x,       y-h/2);
    ctx.lineTo(x+w*0.35,y+h/2);
    ctx.lineTo(x+w*0.2, y+h/2-10);
    ctx.lineTo(x,       y+h/4);
    ctx.lineTo(x-w*0.2, y+h/2-10);
    ctx.lineTo(x-w*0.35,y+h/2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.globalAlpha=1;
  } else {
    // Vanguard (varsayılan)
    ctx.beginPath();
    ctx.moveTo(x,     y-h/2);
    ctx.lineTo(x+w/2, y+h/2);
    ctx.lineTo(x+w/3, y+h/2-8);
    ctx.lineTo(x,     y+h/4);
    ctx.lineTo(x-w/3, y+h/2-8);
    ctx.lineTo(x-w/2, y+h/2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  // ── Level 2+ yan toplar ──────────────────────────────
  if(shipLevel>=2){
    ctx.fillStyle=col; ctx.strokeStyle=col; ctx.lineWidth=1.5;
    ctx.fillRect(x-w*0.7-4,y,8,16); ctx.strokeRect(x-w*0.7-4,y,8,16);
    ctx.fillRect(x+w*0.7-4,y,8,16); ctx.strokeRect(x+w*0.7-4,y,8,16);
  }
  // ── Level 3+ kanat finleri ───────────────────────────
  if(shipLevel>=3){
    ctx.fillStyle=col+'44'; ctx.strokeStyle=col;
    ctx.beginPath(); ctx.moveTo(x-w*0.55,y-h*0.1); ctx.lineTo(x-w*0.9,y-h*0.45); ctx.lineTo(x-w*0.35,y-h*0.15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+w*0.55,y-h*0.1); ctx.lineTo(x+w*0.9,y-h*0.45); ctx.lineTo(x+w*0.35,y-h*0.15); ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  // ── Kokpit ───────────────────────────────────────────
  ctx.fillStyle=col;
  ctx.beginPath(); ctx.ellipse(x,y-4,7,11,0,0,Math.PI*2); ctx.fill();

  // ── Kanatlar ─────────────────────────────────────────
  ctx.fillStyle=col+'1e';
  ctx.beginPath(); ctx.moveTo(x-w/3,y+4); ctx.lineTo(x-w*0.65,y+h/2); ctx.lineTo(x-w/4,y+h/2-8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+w/3,y+4); ctx.lineTo(x+w*0.65,y+h/2); ctx.lineTo(x+w/4,y+h/2-8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();

  // ── Kalkan ───────────────────────────────────────────
  if(shieldActive){
    ctx.save(); ctx.strokeStyle='#00aaff'; ctx.lineWidth=3; ctx.shadowColor='#00aaff'; ctx.shadowBlur=20;
    ctx.globalAlpha=0.7+0.3*Math.sin(Date.now()/100);
    ctx.beginPath(); ctx.ellipse(x,y,w*0.95,h*0.95,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }

  // ── Dash trail (gemiye özel) ──────────────────────────
  if(dashActive>0){
    const prog = dashActive/200;
    const shipDef = SHIP_DEFS.find(s=>s.id===p.shipId) || SHIP_DEFS[0];
    drawDashEffect(x,y,w,h,col,prog,shipDef.dashStyle);
  }
}

// ── DASH EFEKTİ (gemiye özel) ─────────────────────────
function drawDashEffect(x,y,w,h,col,prog,style){
  if(style==='blink'){
    // Vanguard: yıldız izli blink
    const trailCount = 5;
    for(let i=0;i<trailCount;i++){
      const t = i/trailCount;
      ctx.save();
      ctx.globalAlpha = prog*(1-t)*0.5;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x-dashVx*i*12, y-dashVy*i*12, w*0.6*(1-t*0.4), h*0.6*(1-t*0.4), 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    // Küçük yıldız parıltıları
    for(let i=0;i<3;i++){
      ctx.save();
      ctx.globalAlpha = prog*Math.random()*0.6;
      ctx.fillStyle='#ffffff';
      ctx.beginPath();
      ctx.arc(x-dashVx*i*20+(Math.random()-0.5)*20, y-dashVy*i*20+(Math.random()-0.5)*20, 2, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  } else if(style==='shockwave'){
    // Titan: kalkan patlaması halkası
    const r = (1-prog)*60;
    ctx.save();
    ctx.strokeStyle='#4488ff';
    ctx.lineWidth=4*(prog);
    ctx.globalAlpha=prog*0.8;
    ctx.shadowColor='#4488ff'; ctx.shadowBlur=20;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  } else if(style==='ghost'){
    // Ghost: silüet yanıp sönme
    ctx.save();
    ctx.globalAlpha=prog*0.3*Math.abs(Math.sin(Date.now()/60));
    ctx.fillStyle=col;
    ctx.beginPath();
    ctx.ellipse(x-dashVx*20, y-dashVy*20, w*0.7, h*0.7, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// ── GEMİ SEVİYE GÜNCELLEMESİ ─────────────────────────
function updateShipLevel(){
  const newLevel=score>=15000?3:score>=5000?2:1;
  if(newLevel>shipLevel){ shipLevel=newLevel; showWaveText('GEMİ EVRİLDİ! ✦'); explode(player.x,player.y,'#ffffff',30); }
  shipLevel=newLevel;
}

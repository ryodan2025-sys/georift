// ═══════════════════════════════════════════════════════
//  WEAPONS.JS  –  Silah sistemi, ateş, mermi çizimi
// ═══════════════════════════════════════════════════════

const WEAPONS = ['standard','spread','laser','missile'];
const WEAPON_NAMES  = {standard:'● STANDART', spread:'⟠ YAYILMA', laser:'━ LAZER', missile:'⬡ FÜZE'};
const WEAPON_COLORS = {standard:'#00ffcc',    spread:'#ffcc00',    laser:'#ff4466', missile:'#aa44ff'};

function fireWeapon(){
  const c = WEAPON_COLORS[currentWeapon];
  if(currentWeapon==='laser') sfxShootLaser();
  else if(currentWeapon==='missile') sfxShootMissile();
  else sfxShoot();
  if(currentWeapon==='standard'){
    shootBullet(player.x, player.y-player.h/2, -640, c, 4, 16, 1);
    if(rapidFire>0||shipLevel>=2){
      shootBullet(player.x-14, player.y-player.h/4, -600, '#00ccff', 3, 12, 1);
      shootBullet(player.x+14, player.y-player.h/4, -600, '#00ccff', 3, 12, 1);
    }
  } else if(currentWeapon==='spread'){
    for(let a=-2;a<=2;a++) shootBullet(player.x+a*8, player.y-player.h/2, -580+Math.abs(a)*20, c, 4, 13, 1, a*60);
  } else if(currentWeapon==='laser'){
    shootBullet(player.x, player.y-player.h/2, -900, '#ff4466', 3, 28, 2);
  } else if(currentWeapon==='missile'){
    bullets.push({x:player.x-10, y:player.y-player.h/2, vy:-400, vx:-15, w:5, h:18, color:c, dmg:3, homing:true});
    bullets.push({x:player.x+10, y:player.y-player.h/2, vy:-400, vx: 15, w:5, h:18, color:c, dmg:3, homing:true});
  }
}

function shootBullet(x,y,vy,color,w=4,h=14,dmg=1,vx=0){
  bullets.push({x,y,vy,vx,w,h,color,dmg,homing:false});
}

function drawBullet(b){
  ctx.save();
  ctx.shadowColor=b.color; ctx.shadowBlur=12;
  const g=ctx.createLinearGradient(b.x,b.y-b.h/2,b.x,b.y+b.h/2);
  g.addColorStop(0,b.color); g.addColorStop(1,'transparent');
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.roundRect(b.x-b.w/2, b.y-b.h/2, b.w, b.h, 2); ctx.fill();
  ctx.restore();
}

function applyWeaponPowerup(){
  const idx=WEAPONS.indexOf(currentWeapon);
  currentWeapon=WEAPONS[(idx+1)%WEAPONS.length];
  weaponTimer=10000;
  document.getElementById('weaponEl').textContent=WEAPON_NAMES[currentWeapon];
  document.getElementById('weaponEl').style.color=WEAPON_COLORS[currentWeapon];
}

function resetWeapon(){
  currentWeapon = getSelectedShip().defaultWeapon || 'standard';
  document.getElementById('weaponEl').textContent=WEAPON_NAMES[currentWeapon];
  document.getElementById('weaponEl').style.color=WEAPON_COLORS[currentWeapon];
}

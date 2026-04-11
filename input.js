// ═══════════════════════════════════════════════════════
//  INPUT.JS  –  Klavye + dokunmatik joystick + dash
//  touchZone sadece state==='playing' iken çalışır.
// ═══════════════════════════════════════════════════════

const keys={};
window.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(e.code==='Space'&&state==='playing') e.preventDefault();
  if((e.key==='p'||e.key==='P'||e.key==='Escape')&&state==='playing') pauseGame();
  else if((e.key==='p'||e.key==='P'||e.key==='Escape')&&state==='paused') resumeGame();
  if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&state==='playing') tryDash();
});
window.addEventListener('keyup',e=>{ keys[e.code]=false; });

// ── JOYSTICK ──────────────────────────────────────────
const joystick={active:false,id:null,baseX:0,baseY:0,dx:0,dy:0,moving:false};
const JRADIUS=58;
let lastTapTime=0;

const touchZone=document.getElementById('touchZone');

touchZone.addEventListener('touchstart',e=>{
  if(state!=='playing') return; // menüde / pause'da dokunmaları bloke etme
  e.preventDefault();
  const now=Date.now();
  if(now-lastTapTime<280){ tryDash(); }
  lastTapTime=now;
  if(joystick.active) return;
  const t=e.changedTouches[0];
  joystick.active=true; joystick.id=t.identifier;
  joystick.baseX=t.clientX; joystick.baseY=t.clientY;
  joystick.dx=0; joystick.dy=0; joystick.moving=false;
  const rect=wrapper.getBoundingClientRect();
  const cx=t.clientX-rect.left, cy=t.clientY-rect.top;
  jBase.style.left=cx+'px'; jBase.style.top=cy+'px';
  jKnob.style.left=cx+'px'; jKnob.style.top=cy+'px';
  jBase.style.display='block'; jKnob.style.display='block';
},{passive:false});

touchZone.addEventListener('touchmove',e=>{
  if(state!=='playing') return;
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier!==joystick.id) continue;
    const dx=t.clientX-joystick.baseX, dy=t.clientY-joystick.baseY;
    const dist=Math.hypot(dx,dy), cl=Math.min(dist,JRADIUS);
    const nx=dist>0?dx/dist:0, ny=dist>0?dy/dist:0;
    joystick.dx=nx*(cl/JRADIUS); joystick.dy=ny*(cl/JRADIUS);
    joystick.moving=dist>8;
    const rect=wrapper.getBoundingClientRect();
    jKnob.style.left=(joystick.baseX-rect.left+nx*cl)+'px';
    jKnob.style.top=(joystick.baseY-rect.top+ny*cl)+'px';
  }
},{passive:false});

['touchend','touchcancel'].forEach(ev=>{
  touchZone.addEventListener(ev,e=>{
    if(state!=='playing'){ resetJoystick(); return; }
    e.preventDefault();
    for(const t of e.changedTouches){
      if(t.identifier!==joystick.id) continue;
      resetJoystick();
    }
  },{passive:false});
});

function resetJoystick(){
  joystick.active=false; joystick.dx=0; joystick.dy=0; joystick.moving=false;
  jBase.style.display='none'; jKnob.style.display='none';
}

// ── DASH ──────────────────────────────────────────────
function tryDash(){
  if(!player||dashCooldown>0||dashActive>0) return;
  let dx=joystick.dx||0, dy=joystick.dy||0;
  if(keys['ArrowLeft']||keys['KeyA']) dx=-1;
  if(keys['ArrowRight']||keys['KeyD']) dx=1;
  if(keys['ArrowUp']||keys['KeyW']) dy=-1;
  if(keys['ArrowDown']||keys['KeyS']) dy=1;
  if(dx===0&&dy===0) dy=-1;
  const len=Math.hypot(dx,dy);
  dashVx=dx/len; dashVy=dy/len;
  dashActive=200; dashCooldown=1500;
  invincible=Math.max(invincible,220);
  explode(player.x,player.y,player.color,8);
  sfxDash();
}

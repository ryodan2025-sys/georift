// ═══════════════════════════════════════════════════════
//  INPUT.JS  –  Klavye, dokunmatik joystick, dash
// ═══════════════════════════════════════════════════════

const keys={};
window.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space')e.preventDefault();});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('keydown',e=>{if(e.code==='ShiftLeft'||e.code==='ShiftRight')tryDash();});

// ── JOYSTICK ─────────────────────────────────────────
const joystick={active:false,id:null,baseX:0,baseY:0,dx:0,dy:0,moving:false};
const JRADIUS=58;
let lastTapTime=0;

touchZone.addEventListener('touchstart',e=>{
  e.preventDefault();
  if(state!=='playing') return;
  const now=Date.now();
  if(now-lastTapTime<300){ tryDash(); }
  lastTapTime=now;
  if(joystick.active) return;
  const t=e.changedTouches[0];
  joystick.active=true; joystick.id=t.identifier;
  joystick.baseX=t.clientX; joystick.baseY=t.clientY;
  joystick.dx=0; joystick.dy=0; joystick.moving=false;
  const r=wrapper.getBoundingClientRect();
  const cx=t.clientX-r.left, cy=t.clientY-r.top;
  jBase.style.left=cx+'px'; jBase.style.top=cy+'px';
  jKnob.style.left=cx+'px'; jKnob.style.top=cy+'px';
  jBase.style.display='block'; jKnob.style.display='block';
},{passive:false});

touchZone.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier!==joystick.id) continue;
    const dx=t.clientX-joystick.baseX, dy=t.clientY-joystick.baseY;
    const dist=Math.hypot(dx,dy), clamped=Math.min(dist,JRADIUS);
    const nx=dist>0?dx/dist:0, ny=dist>0?dy/dist:0;
    joystick.dx=nx*(clamped/JRADIUS); joystick.dy=ny*(clamped/JRADIUS);
    joystick.moving=dist>8;
    const r=wrapper.getBoundingClientRect();
    jKnob.style.left=(joystick.baseX-r.left+nx*clamped)+'px';
    jKnob.style.top=(joystick.baseY-r.top+ny*clamped)+'px';
  }
},{passive:false});

['touchend','touchcancel'].forEach(ev=>touchZone.addEventListener(ev,e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier!==joystick.id) continue;
    joystick.active=false; joystick.dx=0; joystick.dy=0; joystick.moving=false;
    jBase.style.display='none'; jKnob.style.display='none';
  }
},{passive:false}));

// ── DASH ─────────────────────────────────────────────
function tryDash(){
  if(dashCooldown>0||dashActive>0) return;
  let dx=joystick.dx||0, dy=joystick.dy||0;
  if(keys['ArrowLeft']||keys['KeyA']) dx=-1;
  if(keys['ArrowRight']||keys['KeyD']) dx=1;
  if(keys['ArrowUp']||keys['KeyW']) dy=-1;
  if(keys['ArrowDown']||keys['KeyS']) dy=1;
  if(dx===0&&dy===0){ dy=-1; }
  const len=Math.hypot(dx,dy);
  dashVx=dx/len; dashVy=dy/len;
  dashActive=200; dashCooldown=1500;
  invincible=Math.max(invincible,220);
  explode(player.x,player.y,player.color,8);
  sfxDash();
}

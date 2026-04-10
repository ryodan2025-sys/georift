// ═══════════════════════════════════════════════════════
//  MISSIONS.JS  –  Günlük görev sistemi
// ═══════════════════════════════════════════════════════

const MISSIONS_DEF = [
  {id:'kill100', label:'100 düşman öldür', target:100,  reward:'can'},
  {id:'wave5',   label:'5 dalga geç',       target:5,    reward:'rapid'},
  {id:'combo8',  label:'x8 combo yap',      target:1,    reward:'shield'},
  {id:'score5k', label:'5000 skor topla',   target:5000, reward:'can'},
];

function getTodayKey(){ return new Date().toDateString(); }

function getDailyProgress(){
  try {
    const d=JSON.parse(localStorage.getItem('gr_daily')||'{}');
    if(d.day!==getTodayKey()) return {day:getTodayKey(),prog:{}};
    return d;
  } catch(e){ return {day:getTodayKey(),prog:{}}; }
}

function saveDailyProgress(dp){
  try { localStorage.setItem('gr_daily',JSON.stringify(dp)); } catch(e){}
}

let dailyProgress = getDailyProgress();
let dailyRewardsGiven = {};

function checkDailyMission(id, value){
  const m=MISSIONS_DEF.find(x=>x.id===id); if(!m) return;
  if(dailyProgress.prog[id]>=(m.target)) return;
  dailyProgress.prog[id]=(dailyProgress.prog[id]||0)+value;
  saveDailyProgress(dailyProgress);
  if(dailyProgress.prog[id]>=m.target && !dailyRewardsGiven[id]){
    dailyRewardsGiven[id]=true;
    grantDailyReward(m);
  }
  renderDailyUI();
}

function grantDailyReward(m){
  showWaveText('GÖREV TAMAM! +'+m.reward.toUpperCase());
  if(m.reward==='can'){ lives=Math.min(lives+1,5); renderLives(); }
  else if(m.reward==='rapid'){ rapidFire=6000; }
  else if(m.reward==='shield'){ shieldActive=true; setTimeout(()=>shieldActive=false,7000); }
}

function renderDailyUI(){
  const el=document.getElementById('dailyEl');
  el.innerHTML='GÜNLÜK GÖREVLER: '+MISSIONS_DEF.map(m=>{
    const cur=Math.min(dailyProgress.prog[m.id]||0, m.target);
    const done=cur>=m.target;
    return `<span style="color:${done?'#00ff88':'rgba(255,200,0,0.7)'}">${done?'✓':''} ${m.label} (${cur}/${m.target})</span>`;
  }).join(' · ');
}

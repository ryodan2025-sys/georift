// ═══════════════════════════════════════════════════════
//  MISSIONS.JS  –  Günlük görev sistemi v8.1
//  Her gün rastgele 4 görev seçilir (büyük havuzdan)
// ═══════════════════════════════════════════════════════

// Tüm görev havuzu – her gün bu havuzdan 4'ü seçilir
const ALL_MISSIONS = [
  // Öldürme görevleri
  {id:'kill50',   label:'50 düşman öldür',    target:50,   reward:'rapid',  rewardLabel:'⚡ Hızlı Ateş'},
  {id:'kill100',  label:'100 düşman öldür',   target:100,  reward:'can',    rewardLabel:'❤ Ekstra Can'},
  {id:'kill200',  label:'200 düşman öldür',   target:200,  reward:'shield', rewardLabel:'🛡 Kalkan'},
  {id:'kill30',   label:'30 düşman öldür',    target:30,   reward:'rapid',  rewardLabel:'⚡ Hızlı Ateş'},
  // Dalga görevleri
  {id:'wave3',    label:'3 dalga geç',         target:3,    reward:'rapid',  rewardLabel:'⚡ Hızlı Ateş'},
  {id:'wave5',    label:'5 dalga geç',         target:5,    reward:'shield', rewardLabel:'🛡 Kalkan'},
  {id:'wave8',    label:'8 dalga geç',         target:8,    reward:'can',    rewardLabel:'❤ Ekstra Can'},
  // Combo görevleri
  {id:'combo5',   label:'x5 combo yap',        target:1,    reward:'rapid',  rewardLabel:'⚡ Hızlı Ateş'},
  {id:'combo8',   label:'x8 combo yap',        target:1,    reward:'shield', rewardLabel:'🛡 Kalkan'},
  {id:'combo3x',  label:'x3 combo 5 kez yap', target:5,    reward:'rapid',  rewardLabel:'⚡ Hızlı Ateş'},
  // Skor görevleri
  {id:'score2k',  label:'2000 skor topla',     target:2000, reward:'rapid',  rewardLabel:'⚡ Hızlı Ateş'},
  {id:'score5k',  label:'5000 skor topla',     target:5000, reward:'can',    rewardLabel:'❤ Ekstra Can'},
  {id:'score15k', label:'15000 skor topla',    target:15000,reward:'shield', rewardLabel:'🛡 Kalkan'},
  // Özel görevler
  {id:'noboss',   label:'Boss olmadan 3 dalga',target:3,    reward:'can',    rewardLabel:'❤ Ekstra Can'},
  {id:'survive5', label:'5 dk hayatta kal',    target:300,  reward:'shield', rewardLabel:'🛡 Kalkan'},
];

// Günün görevlerini seç – gün sayısına göre sabit seed
function getTodayKey(){ return new Date().toDateString(); }

function getDailyMissions(){
  const dayKey = getTodayKey();
  try {
    const cached = JSON.parse(localStorage.getItem('gr_dailymissions')||'{}');
    if(cached.day === dayKey && Array.isArray(cached.ids)){
      return ALL_MISSIONS.filter(m => cached.ids.includes(m.id));
    }
  } catch(e){}

  // Yeni gün: rastgele 4 görev seç
  // Seed: güne özel ama rastgele görünümlü
  const dateSeed = new Date().getFullYear()*10000 + (new Date().getMonth()+1)*100 + new Date().getDate();
  let rng = dateSeed;
  function seededRand(){
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return (rng >>> 0) / 0xffffffff;
  }

  // Havuzu karıştır (seeded)
  const pool = [...ALL_MISSIONS];
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(seededRand()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  const selected = pool.slice(0,4);
  try {
    localStorage.setItem('gr_dailymissions', JSON.stringify({day:dayKey, ids:selected.map(m=>m.id)}));
  } catch(e){}
  return selected;
}

let MISSIONS_DEF = getDailyMissions(); // aktif görevler

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

// Hayatta kalma süresi takibi
let surviveSeconds = 0;

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

// Hayatta kalma güncellemesi (game.js'den her saniye çağır)
function updateSurviveMission(rawDt){
  if(!MISSIONS_DEF.find(m=>m.id==='survive5')) return;
  surviveSeconds += rawDt/1000;
  checkDailyMission('survive5', rawDt/1000);
}

function grantDailyReward(m){
  showWaveText('✓ GÖREV! ' + (m.rewardLabel||m.reward.toUpperCase()));
  if(m.reward==='can'){ lives=Math.min(lives+1,5); renderLives(); }
  else if(m.reward==='rapid'){ rapidFire=6000; }
  else if(m.reward==='shield'){ shieldActive=true; setTimeout(()=>shieldActive=false,7000); }
}

function renderDailyUI(){
  const el=document.getElementById('dailyEl');
  if(!el) return;
  el.innerHTML=MISSIONS_DEF.map(m=>{
    const cur=Math.min(dailyProgress.prog[m.id]||0, m.target);
    const done=cur>=m.target;
    const pct=Math.round(cur/m.target*100);
    return `<span style="color:${done?'#00ff88':'rgba(255,200,0,0.65)'}">${done?'✓ ':''}${m.label} (${cur}/${m.target})</span>`;
  }).join(' · ');
}

// ═══════════════════════════════════════════════════════
//  SCOREBOARD.JS  –  Skor kaydetme + unlock kontrolü
// ═══════════════════════════════════════════════════════

function getScores(){
  try { return JSON.parse(localStorage.getItem('gr_scores')||'[]'); } catch(e){ return []; }
}

function saveScore(s, w){
  const ship = getSelectedShip();
  let arr = getScores();
  arr.push({ s, w, ship: ship.name, d: new Date().toLocaleDateString('tr') });
  arr.sort((a,b)=>b.s-a.s);
  arr = arr.slice(0,5);
  try { localStorage.setItem('gr_scores', JSON.stringify(arr)); } catch(e){}

  // Unlock kontrolü: en yüksek skoru güncelle sonra kontrol et
  checkUnlocks(arr[0]?.s || 0);
}

function renderScoreboard(){
  const arr = getScores();
  if(!arr.length) return '';
  return '— EN İYİ SKORLAR —\n'+arr.map((r,i)=>
    `${i+1}. ${r.s.toLocaleString()}  [${r.ship||'?'}]  Dalga:${r.w}  ${r.d}`
  ).join('\n');
}

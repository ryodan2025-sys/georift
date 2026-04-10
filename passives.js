// ═══════════════════════════════════════════════════════
//  PASSIVES.JS  –  Gemiye özel pasif yetenek sistemi
//  Yeni pasif eklemek: applyPassive() içine case ekle.
// ═══════════════════════════════════════════════════════

// wave_shield: her 5 dalgada bir kalkan (Titan)
// dodge:       %15 mermi geçirme (Ghost)
// combo_bonus: combo öldürmelerden %30 ekstra puan (Vanguard)

let passiveWaveTracker = 0; // wave_shield için

function initPassives(){
  passiveWaveTracker = 0;
}

// Her dalga tamamlandığında çağır
function onWavePassive(){
  const ship = getSelectedShip();
  if(ship.passive==='wave_shield'){
    passiveWaveTracker++;
    if(passiveWaveTracker>=5){
      passiveWaveTracker=0;
      shieldActive=true;
      setTimeout(()=>shieldActive=false, 6000);
      showWaveText('🛡 TITAN KALKANI!');
    }
  }
}

// Düşman öldürüldüğünde puan hesapla (combo_bonus)
function applyPassiveScore(basePoints){
  const ship = getSelectedShip();
  let pts = basePoints;
  if(ship.passive==='combo_bonus' && combo>=2){
    pts = Math.floor(pts * 1.30);
  }
  // Gemi çarpanı uygula
  pts = Math.floor(pts * ship.scoreMultiplier);
  return pts;
}

// Mermi çarpma kontrolünde çağır (dodge — Ghost)
// true dönerse mermi geçer (hasar yok)
function passiveDodgeCheck(){
  const ship = getSelectedShip();
  if(ship.passive==='dodge'){
    return Math.random()<0.15;
  }
  return false;
}

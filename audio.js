// ═══════════════════════════════════════════════════════
//  AUDIO.JS  –  Ses motoru (Web Audio API, sıfır dosya)
//  Tüm sesler procedural olarak üretilir.
// ═══════════════════════════════════════════════════════

let AC = null; // AudioContext
let masterGain, musicGain, sfxGain;
let menuMusicNodes = [], gameMusicNodes = [];
let musicPlaying = null; // 'menu'|'game'|null
let audioReady = false;
let muted = false;

function initAudio(){
  if(audioReady) return;
  try {
    AC = new (window.AudioContext||window.webkitAudioContext)();
    masterGain = AC.createGain(); masterGain.gain.value = 0.7; masterGain.connect(AC.destination);
    musicGain  = AC.createGain(); musicGain.gain.value  = 0.38; musicGain.connect(masterGain);
    sfxGain    = AC.createGain(); sfxGain.gain.value    = 0.85; sfxGain.connect(masterGain);
    audioReady = true;
  } catch(e){ console.warn('Audio init failed', e); }
}

function toggleMute(){
  if(!audioReady) return;
  muted = !muted;
  masterGain.gain.setTargetAtTime(muted?0:0.7, AC.currentTime, 0.1);
  return muted;
}

// ── DÜŞÜK SEVİYE YARDIMCILARI ────────────────────────
function makeOsc(type, freq, startT, dur, gainVal, dest){
  if(!audioReady) return;
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(gainVal, startT);
  g.gain.exponentialRampToValueAtTime(0.0001, startT+dur);
  o.connect(g); g.connect(dest||sfxGain);
  o.start(startT); o.stop(startT+dur+0.05);
}

function makeNoise(startT, dur, gainVal, lpFreq, dest){
  if(!audioReady) return;
  const buf = AC.createBuffer(1, AC.sampleRate*dur, AC.sampleRate);
  const d = buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
  const src = AC.createBufferSource();
  src.buffer = buf;
  const lp = AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=lpFreq;
  const g = AC.createGain();
  g.gain.setValueAtTime(gainVal, startT);
  g.gain.exponentialRampToValueAtTime(0.0001, startT+dur);
  src.connect(lp); lp.connect(g); g.connect(dest||sfxGain);
  src.start(startT); src.stop(startT+dur+0.05);
}

// ── SFX ──────────────────────────────────────────────
function sfxShoot(){
  if(!audioReady) return;
  const t = AC.currentTime;
  makeOsc('square', 880, t, 0.04, 0.18);
  makeOsc('square', 660, t+0.02, 0.05, 0.10);
}

function sfxShootLaser(){
  if(!audioReady) return;
  const t = AC.currentTime;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type='sawtooth'; o.frequency.setValueAtTime(1200,t); o.frequency.exponentialRampToValueAtTime(400,t+0.12);
  g.gain.setValueAtTime(0.22,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
  o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+0.15);
}

function sfxShootMissile(){
  if(!audioReady) return;
  const t = AC.currentTime;
  makeOsc('sawtooth', 200, t, 0.18, 0.2);
  makeNoise(t, 0.1, 0.15, 600);
}

function sfxEnemyHit(){
  if(!audioReady) return;
  const t = AC.currentTime;
  makeOsc('square', 300, t, 0.06, 0.12);
}

function sfxEnemyDie(){
  if(!audioReady) return;
  const t = AC.currentTime;
  makeNoise(t, 0.22, 0.3, 800);
  makeOsc('square', 150, t, 0.22, 0.15);
  makeOsc('square', 80,  t+0.1, 0.15, 0.1);
}

function sfxBossHit(){
  if(!audioReady) return;
  const t = AC.currentTime;
  makeOsc('sawtooth', 100, t, 0.08, 0.25);
  makeNoise(t, 0.08, 0.2, 400);
}

function sfxBossDie(){
  if(!audioReady) return;
  const t = AC.currentTime;
  for(let i=0;i<6;i++){
    makeNoise(t+i*0.08, 0.2, 0.35-i*0.04, 600-i*60);
    makeOsc('square', 220-i*20, t+i*0.08, 0.2, 0.2-i*0.02);
  }
}

function sfxPlayerHit(){
  if(!audioReady) return;
  const t = AC.currentTime;
  makeNoise(t, 0.35, 0.45, 300);
  makeOsc('sawtooth', 80, t, 0.35, 0.3);
}

function sfxDash(){
  if(!audioReady) return;
  const t = AC.currentTime;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type='sine'; o.frequency.setValueAtTime(200,t); o.frequency.exponentialRampToValueAtTime(900,t+0.12);
  g.gain.setValueAtTime(0.25,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.14);
  o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+0.15);
}

function sfxPowerup(){
  if(!audioReady) return;
  const t = AC.currentTime;
  [523,659,784,1047].forEach((f,i)=>makeOsc('sine',f,t+i*0.07,0.12,0.18));
}

function sfxWaveStart(){
  if(!audioReady) return;
  const t = AC.currentTime;
  [220,277,330,440].forEach((f,i)=>makeOsc('square',f,t+i*0.09,0.14,0.14));
}

function sfxBossWarning(){
  if(!audioReady) return;
  const t = AC.currentTime;
  for(let i=0;i<3;i++){
    makeOsc('sawtooth',110,t+i*0.28,0.2,0.3);
    makeOsc('sawtooth',220,t+i*0.28+0.1,0.15,0.2);
  }
}

function sfxCombo(level){
  if(!audioReady) return;
  const t = AC.currentTime;
  const freq = 440 * Math.pow(1.12, Math.min(level,12));
  makeOsc('sine', freq, t, 0.1, 0.2);
  if(level>=8) makeOsc('sine', freq*1.5, t, 0.15, 0.15);
}

function sfxMenuClick(){
  if(!audioReady) return;
  const t = AC.currentTime;
  makeOsc('square', 660, t, 0.06, 0.14);
  makeOsc('square', 880, t+0.04, 0.05, 0.10);
}

// ── MÜZİK: ANA MENÜ (ambient retro synth) ────────────
function startMenuMusic(){
  if(!audioReady||musicPlaying==='menu') return;
  stopMusic();
  musicPlaying = 'menu';

  const t = AC.currentTime;
  // Pad chord loop
  const chords = [[110,138,165],[98,123,147],[123,155,185],[110,138,165]];
  let nodes = [];

  function playChord(chord, startT){
    chord.forEach(f=>{
      const o = AC.createOscillator(), g = AC.createGain();
      const rev = AC.createConvolver();
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0,startT);
      g.gain.linearRampToValueAtTime(0.08,startT+0.4);
      g.gain.setValueAtTime(0.08,startT+1.6);
      g.gain.linearRampToValueAtTime(0,startT+2.2);
      o.connect(g); g.connect(musicGain);
      o.start(startT); o.stop(startT+2.3);
      nodes.push(o);
    });
  }

  // Sub-bass pulse
  function playBass(freq, startT){
    const o = AC.createOscillator(), g = AC.createGain();
    o.type='triangle'; o.frequency.value=freq;
    g.gain.setValueAtTime(0,startT);
    g.gain.linearRampToValueAtTime(0.18,startT+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,startT+0.5);
    o.connect(g); g.connect(musicGain);
    o.start(startT); o.stop(startT+0.6);
    nodes.push(o);
  }

  // Arpeggio
  function playArp(baseFreq, startT){
    [1,1.25,1.5,2,1.5,1.25].forEach((m,i)=>{
      const o = AC.createOscillator(), g = AC.createGain();
      o.type='square'; o.frequency.value=baseFreq*m;
      const st=startT+i*0.12;
      g.gain.setValueAtTime(0.06,st); g.gain.exponentialRampToValueAtTime(0.0001,st+0.1);
      o.connect(g); g.connect(musicGain);
      o.start(st); o.stop(st+0.12);
      nodes.push(o);
    });
  }

  let bar=0;
  function scheduleBar(){
    if(musicPlaying!=='menu') return;
    const now = AC.currentTime;
    const st = now + 0.05;
    const chord = chords[bar%chords.length];
    playChord(chord, st);
    playBass(chord[0]/2, st);
    playBass(chord[0]/2, st+1.0);
    playArp(chord[0]*2, st+0.5);
    bar++;
    menuMusicNodes = nodes;
    setTimeout(scheduleBar, 1900);
  }
  scheduleBar();
}

// ── MÜZİK: OYUN (uptempo retro chiptune) ─────────────
function startGameMusic(){
  if(!audioReady||musicPlaying==='game') return;
  stopMusic();
  musicPlaying = 'game';

  // Tempo: ~160 BPM → beat=375ms
  const BEAT = 0.375;
  const bassNotes=[55,55,49,52, 55,55,49,46, 58,58,52,55, 55,55,49,52];
  const melodyNotes=[220,0,277,0,330,277,0,330, 370,0,330,277,0,370,277,0,
                     440,0,370,0,330,370,0,440, 494,0,440,370,0,330,277,0];
  let bar=0;

  function scheduleMeasure(){
    if(musicPlaying!=='game') return;
    const now = AC.currentTime + 0.02;

    // Bass line (4 notes per bar)
    for(let i=0;i<4;i++){
      const f = bassNotes[(bar*4+i)%bassNotes.length];
      const st = now + i*BEAT;
      const o = AC.createOscillator(), g = AC.createGain();
      o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0.22,st);
      g.gain.exponentialRampToValueAtTime(0.0001,st+BEAT*0.8);
      o.connect(g); g.connect(musicGain);
      o.start(st); o.stop(st+BEAT+0.05);
    }

    // Melody (8 notes per bar)
    for(let i=0;i<8;i++){
      const f = melodyNotes[(bar*8+i)%melodyNotes.length];
      if(f===0) continue;
      const st = now + i*(BEAT/2);
      const o = AC.createOscillator(), g = AC.createGain();
      o.type='square'; o.frequency.value=f;
      g.gain.setValueAtTime(0.08,st);
      g.gain.exponentialRampToValueAtTime(0.0001,st+BEAT*0.4);
      o.connect(g); g.connect(musicGain);
      o.start(st); o.stop(st+BEAT/2+0.05);
    }

    // Hi-hat (16th notes on beats 2&4)
    for(let i=0;i<16;i++){
      if(i%4!==2&&i%4!==0) continue;
      makeNoise(now+i*(BEAT/4), 0.04, 0.06, 8000, musicGain);
    }

    // Kick on 1 & 3
    for(let i=0;i<2;i++){
      const st = now + i*BEAT*2;
      const o = AC.createOscillator(), g = AC.createGain();
      o.type='sine'; o.frequency.setValueAtTime(160,st); o.frequency.exponentialRampToValueAtTime(40,st+0.12);
      g.gain.setValueAtTime(0.35,st); g.gain.exponentialRampToValueAtTime(0.0001,st+0.18);
      o.connect(g); g.connect(musicGain);
      o.start(st); o.stop(st+0.2);
    }

    bar++;
    setTimeout(scheduleMeasure, BEAT*4*1000 - 20);
  }
  scheduleMeasure();
}

function stopMusic(){
  musicPlaying = null;
  // Nodes self-cleanup after their stop time
}

function fadeOutMusic(){
  if(!audioReady) return;
  musicGain.gain.setTargetAtTime(0, AC.currentTime, 0.4);
  setTimeout(()=>{
    stopMusic();
    musicGain.gain.setValueAtTime(0.38, AC.currentTime);
  }, 1500);
}

// ═══════════════════════════════════════════════════════
// GEORIFT — 10 ELEMENT × 30 YETENEKLİ SİSTEM
// ═══════════════════════════════════════════════════════

const ELEMENTS = [

// ── 1. ATEŞ ──────────────────────────────────────────
{id:'fire', name:'ATEŞ', icon:'🔥', col:'#ff4d00', desc:'Yakma ve patlama ustası',
 skills:[
  // Tier 1 — Temel (0-9)
  {n:'Kor Mermi',      i:'🔥',t:1,d:'Mermi hasarı +%12',      e:'atk*=1.12'},
  {n:'Kor Mermi II',   i:'🔥',t:1,d:'Mermi hasarı +%14',      e:'atk*=1.14'},
  {n:'Kor Mermi III',  i:'🔥',t:1,d:'Mermi hasarı +%16',      e:'atk*=1.16'},
  {n:'Yanma',          i:'♨️',t:1,d:'Düşmanları 2s yakar',    e:'burnDmg+=4'},
  {n:'Yanma II',       i:'♨️',t:1,d:'Yakma hasarı +4',        e:'burnDmg+=4'},
  {n:'Hızlı Ateş',     i:'⚡',t:1,d:'Ateş hızı +%10',        e:'fireRate*=0.9'},
  {n:'Hızlı Ateş II',  i:'⚡',t:1,d:'Ateş hızı +%10',        e:'fireRate*=0.9'},
  {n:'Alev Kalkan',    i:'🛡️',t:1,d:'Savunma +4',            e:'def+=4'},
  {n:'Alev Kalkan II', i:'🛡️',t:1,d:'Savunma +5',            e:'def+=5'},
  {n:'Kor Patla',      i:'💥',t:1,d:'Mermi patlaması +AoE',   e:'bulletAoe=true'},
  // Tier 2 — İleri (10-19)
  {n:'Alev Çemberi',   i:'🌀',t:2,d:'360° alev halkası',      e:'sk1Type="firering"'},
  {n:'Alev Çemberi II',i:'🌀',t:2,d:'Alev halkası hasarı +%20',e:'sk1Dmg*=1.2'},
  {n:'Magma Zırh',     i:'🧱',t:2,d:'HP +25, savunma +6',     e:'maxHp+=25;def+=6'},
  {n:'Magma Zırh II',  i:'🧱',t:2,d:'HP +30, savunma +8',     e:'maxHp+=30;def+=8'},
  {n:'Yanardağ',       i:'🌋',t:2,d:'Hareket ateş izi bırakır',e:'fireTrail=true'},
  {n:'Yanardağ II',    i:'🌋',t:2,d:'Ateş izi hasarı +%30',   e:'fireTrailDmg*=1.3'},
  {n:'Kritik Alev',    i:'🎯',t:2,d:'Kritik şans +%10',       e:'critChance+=0.1'},
  {n:'Kritik Alev II', i:'🎯',t:2,d:'Kritik hasar +0.4x',     e:'critMult+=0.4'},
  {n:'Feniks Kalkan',  i:'🛡️',t:2,d:'Hasar aldıkta %15 HP rejene',e:'hpOnHit=0.15'},
  {n:'Fırtına Topu',   i:'☄️',t:2,d:'+1 ekstra mermi',        e:'extraBullets+=1'},
  // Tier 3 — Efsane (20-29)
  {n:'Güneş Patlaması',i:'☀️',t:3,d:'Devasa AoE patlama becerisi',e:'sk3Type="sunburst"'},
  {n:'Güneş Patlama II',i:'☀️',t:3,d:'Patlama hasarı +%40',   e:'sk3Dmg*=1.4'},
  {n:'Ejder Nefesi',   i:'🐲',t:3,d:'Alev konisi saldırısı',   e:'sk2Type="dragonbreath"'},
  {n:'Ejder Nefesi II',i:'🐲',t:3,d:'Nefes menzili +%50',     e:'sk2Range*=1.5'},
  {n:'Feniks Ruhu',    i:'🦅',t:3,d:'Ölünce 1 kez diril +%50 HP',e:'hasRevive=true'},
  {n:'Ateş Tanrısı',   i:'👑',t:3,d:'Tüm ateş hasarı +%30',   e:'firePower*=1.3'},
  {n:'Lav Akışı',      i:'🌊',t:3,d:'MP rejenerasyonu +%40',   e:'mpRegen*=1.4'},
  {n:'Kızıl Meteor',   i:'🌠',t:3,d:'Gökten meteor çağır',     e:'sk1Alt="meteor"'},
  {n:'Cehennem Kapısı',i:'🔴',t:3,d:'Düşmanları yanar zemine çeker',e:'sk2Alt="hellgate"'},
  {n:'KAOS ALEVI',     i:'🌟',t:3,d:'TÜM ateş yetenekleri 2x güç',e:'fireGodMode=true'},
]},

// ── 2. BUZ ──────────────────────────────────────────
{id:'ice', name:'BUZ', icon:'❄️', col:'#00cfff', desc:'Dondurma ve kontrol ustası',
 skills:[
  {n:'Buz Okları',     i:'❄️',t:1,d:'Mermi hasarı +%10',      e:'atk*=1.1'},
  {n:'Buz Okları II',  i:'❄️',t:1,d:'Mermi hasarı +%12',      e:'atk*=1.12'},
  {n:'Buz Okları III', i:'❄️',t:1,d:'Mermi hasarı +%14',      e:'atk*=1.14'},
  {n:'Yavaşlat',       i:'🐢',t:1,d:'Mermiler düşmanı yavaşlatır',e:'slowOnHit=true'},
  {n:'Yavaşlat II',    i:'🐢',t:1,d:'Yavaşlatma süresi +1s',  e:'slowDur+=60'},
  {n:'Buz Zırh',       i:'🔷',t:1,d:'Savunma +5',             e:'def+=5'},
  {n:'Buz Zırh II',    i:'🔷',t:1,d:'Savunma +6',             e:'def+=6'},
  {n:'Soğuk Nefes',    i:'💨',t:1,d:'Ateş hızı +%8',          e:'fireRate*=0.92'},
  {n:'Soğuk Nefes II', i:'💨',t:1,d:'Ateş hızı +%8',          e:'fireRate*=0.92'},
  {n:'Dondurucu',      i:'🧊',t:1,d:'Mermi dondurma şansı %20',e:'freezeChance=0.2'},
  {n:'Blizzard',       i:'🌨️',t:2,d:'AoE buz fırtınası',      e:'sk1Type="blizzard"'},
  {n:'Blizzard II',    i:'🌨️',t:2,d:'Blizzard hasarı +%25',   e:'sk1Dmg*=1.25'},
  {n:'Buz Kalesi',     i:'🏰',t:2,d:'HP +30, donma koruma',    e:'maxHp+=30;iceImmune=true'},
  {n:'Buz Kalesi II',  i:'🏰',t:2,d:'HP +35',                 e:'maxHp+=35'},
  {n:'Donuk Zemin',    i:'💠',t:2,d:'Bıraktığın yerde buz zemin',e:'iceTrail=true'},
  {n:'Donuk Zemin II', i:'💠',t:2,d:'Buz zemin süresi +%50',   e:'iceTrailDur*=1.5'},
  {n:'Kristal Beden',  i:'💎',t:2,d:'Hasar aldıkta %10 yansıt',e:'dmgReflect=0.1'},
  {n:'Kristal Beden II',i:'💎',t:2,d:'Yansıtma +%15',         e:'dmgReflect+=0.15'},
  {n:'Buz Klonu',      i:'🌒',t:2,d:'Savaşan buz klonu oluştur',e:'iceClone=true'},
  {n:'Çift Mermi',     i:'🏹',t:2,d:'+1 ekstra mermi',         e:'extraBullets+=1'},
  {n:'Mutlak Sıfır',   i:'☃️',t:3,d:'Tüm düşmanları dondur',  e:'sk2Type="absolutezero"'},
  {n:'Mutlak Sıfır II',i:'☃️',t:3,d:'Dondurma süresi +%50',   e:'freezeDur*=1.5'},
  {n:'Zaman Durdu',    i:'⏱️',t:3,d:'3s tüm düşmanlar durur',  e:'sk3Type="timestop"'},
  {n:'Zaman Durdu II', i:'⏱️',t:3,d:'Durma süresi +1s',       e:'timeStopDur+=60'},
  {n:'Buz Tanrısı',    i:'❄️',t:3,d:'Tüm buz hasarı +%35',    e:'icePower*=1.35'},
  {n:'Kristal Kalkan', i:'🛡️',t:3,d:'%25 hasar emme kalkanı', e:'shield=0.25'},
  {n:'Buz Meteoru',    i:'🌠',t:3,d:'Buz meteoru yağdır',      e:'sk1Alt="icemeteor"'},
  {n:'Permafrost',     i:'🗻',t:3,d:'Hareket sn başına HP rejene',e:'hpRegen+=0.08'},
  {n:'Kuzey Işığı',    i:'🌌',t:3,d:'MP +50, rejene +%50',     e:'maxMp+=50;mpRegen*=1.5'},
  {n:'MUTLAK SIFIR+',  i:'🌟',t:3,d:'TÜM buz yetenekleri 2x güç',e:'iceGodMode=true'},
]},

// ── 3. ŞIMŞEK ────────────────────────────────────────
{id:'thunder', name:'ŞIMŞEK', icon:'⚡', col:'#ffe000', desc:'Hız ve zincir hasarı',
 skills:[
  {n:'Elektrik Topu',  i:'⚡',t:1,d:'Mermi hasarı +%13',      e:'atk*=1.13'},
  {n:'Elektrik Topu II',i:'⚡',t:1,d:'Mermi hasarı +%15',     e:'atk*=1.15'},
  {n:'Elektrik Topu III',i:'⚡',t:1,d:'Mermi hasarı +%17',    e:'atk*=1.17'},
  {n:'Zincir Şimşek',  i:'🌩️',t:1,d:'Mermi 2 hedefe zincir yapar',e:'chainLightning=2'},
  {n:'Zincir Şimşek II',i:'🌩️',t:1,d:'Zincir +1 hedef',      e:'chainLightning+=1'},
  {n:'İletkenlik',     i:'🔋',t:1,d:'MP rejene +%20',          e:'mpRegen*=1.2'},
  {n:'İletkenlik II',  i:'🔋',t:1,d:'MP rejene +%25',          e:'mpRegen*=1.25'},
  {n:'Yıldırım Hızı',  i:'💨',t:1,d:'Hareket hızı +%12',      e:'speed*=1.12'},
  {n:'Yıldırım Hızı II',i:'💨',t:1,d:'Hareket hızı +%12',     e:'speed*=1.12'},
  {n:'Statik Yük',     i:'⚡',t:1,d:'Düşmana temas +hasar',    e:'contactShock=true'},
  {n:'Fırtına',        i:'⛈️',t:2,d:'AoE şimşek fırtınası',   e:'sk1Type="storm"'},
  {n:'Fırtına II',     i:'⛈️',t:2,d:'Fırtına hasarı +%30',    e:'sk1Dmg*=1.3'},
  {n:'Tanrı Şimşeği',  i:'🌪️',t:2,d:'Dev şimşek darbesi',    e:'sk2Type="godlightning"'},
  {n:'Tanrı Şimşeği II',i:'🌪️',t:2,d:'Şimşek hasarı +%35',   e:'sk2Dmg*=1.35'},
  {n:'EMP',            i:'📡',t:2,d:'Düşmanları 2s sersemletir',e:'empBlast=true'},
  {n:'EMP II',         i:'📡',t:2,d:'Sersem süresi +1s',       e:'empDur+=60'},
  {n:'Voltaj Kalkan',  i:'🛡️',t:2,d:'Temas eden düşmana şok', e:'voltShield=true'},
  {n:'Voltaj Kalkan II',i:'🛡️',t:2,d:'Şok hasarı +%40',       e:'voltShockDmg*=1.4'},
  {n:'Süper İletken',  i:'🔬',t:2,d:'Beceri CD -%25',          e:'cdReduction*=0.75'},
  {n:'Çoklu Zincir',   i:'⚡',t:2,d:'+1 ekstra mermi',          e:'extraBullets+=1'},
  {n:'Yıldırım Tanrısı',i:'⚡',t:3,d:'Şimşek gücü +%40',      e:'thunderPower*=1.4'},
  {n:'Yıldırım Tanrısı II',i:'⚡',t:3,d:'Şimşek gücü +%50',   e:'thunderPower*=1.5'},
  {n:'Orbital Şimşek', i:'🌀',t:3,d:'Etrafında dönen şimşek orbitler',e:'lightningOrbit=true'},
  {n:'Orbital Şimşek II',i:'🌀',t:3,d:'Orbit hasarı +%40',    e:'orbitDmg*=1.4'},
  {n:'Zaman Şimşeği',  i:'⏱️',t:3,d:'Şimşek CD anında sıfırlanır',e:'sk3Type="thunderreset"'},
  {n:'Plazma Patlama', i:'💥',t:3,d:'Devasa plazma patlaması', e:'sk3Type="plasma"'},
  {n:'Süpersonik',     i:'🚀',t:3,d:'Hız 2x, dash CD -%50',    e:'speed*=2;dashCd*=0.5'},
  {n:'Şimşek Klonu',   i:'👥',t:3,d:'Şimşek klon oluştur',    e:'thunderClone=true'},
  {n:'Deşarj',         i:'🔌',t:3,d:'Tüm MP boşalt, muazzam hasar',e:'sk2Alt="discharge"'},
  {n:'TANRI ŞIMŞEĞI',  i:'🌟',t:3,d:'TÜM şimşek yetenekleri 2x güç',e:'thunderGodMode=true'},
]},

// ── 4. GÖLGE ─────────────────────────────────────────
{id:'shadow', name:'GÖLGE', icon:'🌑', col:'#8b00ff', desc:'Kritik ve suikast ustası',
 skills:[
  {n:'Gölge Darbe',    i:'🌑',t:1,d:'Kritik şans +%8',        e:'critChance+=0.08'},
  {n:'Gölge Darbe II', i:'🌑',t:1,d:'Kritik şans +%8',        e:'critChance+=0.08'},
  {n:'Gölge Darbe III',i:'🌑',t:1,d:'Kritik şans +%10',       e:'critChance+=0.10'},
  {n:'Suikast',        i:'🗡️',t:1,d:'Kritik hasar +0.5x',     e:'critMult+=0.5'},
  {n:'Suikast II',     i:'🗡️',t:1,d:'Kritik hasar +0.6x',     e:'critMult+=0.6'},
  {n:'Karanlık Adım',  i:'👣',t:1,d:'Dash CD -%20',            e:'dashMaxCd*=0.8'},
  {n:'Karanlık Adım II',i:'👣',t:1,d:'Dash CD -%20',           e:'dashMaxCd*=0.8'},
  {n:'Gölge Ten',      i:'🌑',t:1,d:'Savunma +6',              e:'def+=6'},
  {n:'Gölge Ten II',   i:'🌑',t:1,d:'Savunma +7',              e:'def+=7'},
  {n:'Sessiz Öldürme', i:'🔇',t:1,d:'Her öldürme +2 puan/kill',e:'bonusKillScore+=2'},
  {n:'Görünmezlik',    i:'👻',t:2,d:'3s görünmez ol (beceri)',  e:'sk1Type="invisible"'},
  {n:'Görünmezlik II', i:'👻',t:2,d:'Görünmezlik +1s',         e:'invisDur+=60'},
  {n:'Gölge Klon',     i:'🌒',t:2,d:'Savaşan gölge klon',      e:'shadowClone=true'},
  {n:'Gölge Klon II',  i:'🌒',t:2,d:'Klon hasarı +%40',        e:'cloneDmg*=1.4'},
  {n:'Ölüm Kucağı',    i:'💀',t:2,d:'<%25 HP düşman anında ölür',e:'executeThreshold=0.25'},
  {n:'Ölüm Kucağı II', i:'💀',t:2,d:'Eşik +%10',               e:'executeThreshold+=0.1'},
  {n:'Vampir Dişi',    i:'🦷',t:2,d:'Can çalma +%8',           e:'lifesteal+=0.08'},
  {n:'Vampir Dişi II', i:'🦷',t:2,d:'Can çalma +%10',          e:'lifesteal+=0.10'},
  {n:'Gölge Ağı',      i:'🕸️',t:2,d:'Düşmanları yavaşlatır',   e:'shadowWeb=true'},
  {n:'Karanlık Saçma', i:'🌑',t:2,d:'+1 ekstra mermi',          e:'extraBullets+=1'},
  {n:'Ölüm Gölgesi',   i:'☠️',t:3,d:'Alan temizleme becerisi',  e:'sk3Type="deathshadow"'},
  {n:'Ölüm Gölgesi II',i:'☠️',t:3,d:'Alan hasarı +%50',         e:'sk3Dmg*=1.5'},
  {n:'Kaos Formu',     i:'🌀',t:3,d:'5s tüm istatistikler 2x', e:'sk2Type="chaosform"'},
  {n:'Kaos Formu II',  i:'🌀',t:3,d:'Form süresi +2s',          e:'chaosFormDur+=120'},
  {n:'Ruh Emici',      i:'👁️',t:3,d:'Her öldürmede HP rejene',  e:'soulSiphon=true'},
  {n:'Gölge Tanrısı',  i:'🌑',t:3,d:'Tüm gölge hasarı +%40',   e:'shadowPower*=1.4'},
  {n:'Karanlık Bariyer',i:'🌑',t:3,d:'%30 hasar azaltma',       e:'dmgReduction=0.3'},
  {n:'Sonsuz Gece',    i:'🌌',t:3,d:'Dash invincibilty süresi 3x',e:'dashInvincible*=3'},
  {n:'Kural Dışı',     i:'⚡',t:3,d:'CD sıfır 5s (ultimate)',    e:'sk1Alt="nocooldown"'},
  {n:'GÖLGE TANRISI',  i:'🌟',t:3,d:'TÜM gölge yetenekleri 2x güç',e:'shadowGodMode=true'},
]},

// ── 5. ARKAN ─────────────────────────────────────────
{id:'arcane', name:'ARKAN', icon:'🔮', col:'#cc44ff', desc:'Saf büyü ve patlama',
 skills:[
  {n:'Arkan Mermi',    i:'🔮',t:1,d:'Mermi hasarı +%11',      e:'atk*=1.11'},
  {n:'Arkan Mermi II', i:'🔮',t:1,d:'Mermi hasarı +%13',      e:'atk*=1.13'},
  {n:'Arkan Mermi III',i:'🔮',t:1,d:'Mermi hasarı +%15',      e:'atk*=1.15'},
  {n:'Mana Akışı',     i:'💜',t:1,d:'Max MP +20',              e:'maxMp+=20'},
  {n:'Mana Akışı II',  i:'💜',t:1,d:'Max MP +25',              e:'maxMp+=25'},
  {n:'Büyü Hızı',      i:'⚡',t:1,d:'Ateş hızı +%12',          e:'fireRate*=0.88'},
  {n:'Büyü Hızı II',   i:'⚡',t:1,d:'Ateş hızı +%12',          e:'fireRate*=0.88'},
  {n:'Arkan Zırh',     i:'🛡️',t:1,d:'Savunma +5',              e:'def+=5'},
  {n:'Arkan Zırh II',  i:'🛡️',t:1,d:'Savunma +6',              e:'def+=6'},
  {n:'Büyü Yansıt',    i:'🪞',t:1,d:'%15 büyü yansıtma',       e:'magicReflect=0.15'},
  {n:'Arkan Nova',     i:'💥',t:2,d:'Dev arkan patlaması',      e:'sk1Type="arcannova"'},
  {n:'Arkan Nova II',  i:'💥',t:2,d:'Nova hasarı +%30',         e:'sk1Dmg*=1.3'},
  {n:'Mana Kalkan',    i:'🔵',t:2,d:'MP = savunma bonusu',      e:'manaShield=true'},
  {n:'Mana Kalkan II', i:'🔵',t:2,d:'Kalkan gücü +%50',         e:'manaShieldPow*=1.5'},
  {n:'Büyü Çoğalt',    i:'✨',t:2,d:'+2 ekstra mermi',           e:'extraBullets+=2'},
  {n:'Büyü Çoğalt II', i:'✨',t:2,d:'+1 ekstra mermi',           e:'extraBullets+=1'},
  {n:'Arkan Hız',      i:'💫',t:2,d:'Beceri CD -%20',            e:'cdReduction*=0.8'},
  {n:'Arkan Hız II',   i:'💫',t:2,d:'Beceri CD -%20',            e:'cdReduction*=0.8'},
  {n:'Efsun',          i:'📜',t:2,d:'Düşman ölünce MP %5 yenilenir',e:'manaOnKill=0.05'},
  {n:'Büyü Derinliği', i:'🌀',t:2,d:'Mana rejene +%30',          e:'mpRegen*=1.3'},
  {n:'Arkan Tanrı',    i:'🔮',t:3,d:'Büyü hasarı +%45',          e:'arcanePower*=1.45'},
  {n:'Arkan Tanrı II', i:'🔮',t:3,d:'Büyü hasarı +%50',          e:'arcanePower*=1.5'},
  {n:'Zamansız',       i:'⏳',t:3,d:'CD tamamen -%40',            e:'cdReduction*=0.6'},
  {n:'Zamansız II',    i:'⏳',t:3,d:'CD tamamen -%20',            e:'cdReduction*=0.8'},
  {n:'Gerçeklik Yarığı',i:'⚫',t:3,d:'Boyut yarığı açar düşmanları emer',e:'sk2Type="riftpull"'},
  {n:'Arkan Meteor',   i:'🌠',t:3,d:'Meteor yağmuru',            e:'sk3Type="arcanemeteor"'},
  {n:'Sonsuz Mana',    i:'♾️',t:3,d:'MP tükenmez 8s',            e:'sk1Alt="infinitemana"'},
  {n:'Büyü Yankısı',   i:'🔔',t:3,d:'Her beceri 2 kez tetiklenir',e:'skillEcho=true'},
  {n:'Efsunlu Eleştiri',i:'⭐',t:3,d:'Kritik +%15, kritik hasar +0.5x',e:'critChance+=0.15;critMult+=0.5'},
  {n:'ARKAN TANRISI',  i:'🌟',t:3,d:'TÜM arkan yetenekleri 2x güç',e:'arcaneGodMode=true'},
]},

// ── 6. YAŞAM ─────────────────────────────────────────
{id:'life', name:'YAŞAM', icon:'💚', col:'#00e676', desc:'İyileşme ve dayanıklılık',
 skills:[
  {n:'Yaşam Özü',      i:'💚',t:1,d:'Max HP +20',              e:'maxHp+=20'},
  {n:'Yaşam Özü II',   i:'💚',t:1,d:'Max HP +25',              e:'maxHp+=25'},
  {n:'Yaşam Özü III',  i:'💚',t:1,d:'Max HP +30',              e:'maxHp+=30'},
  {n:'Rejenerasyon',   i:'🌱',t:1,d:'HP rejene +%15',           e:'hpRegen+=0.04'},
  {n:'Rejenerasyon II',i:'🌱',t:1,d:'HP rejene +%20',           e:'hpRegen+=0.06'},
  {n:'Canlılık',       i:'❤️',t:1,d:'Savunma +5',               e:'def+=5'},
  {n:'Canlılık II',    i:'❤️',t:1,d:'Savunma +6',               e:'def+=6'},
  {n:'Şifa Dalgası',   i:'💊',t:1,d:'Her öldürmede +3 HP',      e:'healOnKill+=3'},
  {n:'Şifa Dalgası II',i:'💊',t:1,d:'Her öldürmede +5 HP',      e:'healOnKill+=5'},
  {n:'Can Çalma',      i:'🦇',t:1,d:'Can çalma +%5',            e:'lifesteal+=0.05'},
  {n:'Yaşam Kalkan',   i:'💛',t:2,d:'Hasar emme kalkanı',        e:'shield+=0.15'},
  {n:'Yaşam Kalkan II',i:'💛',t:2,d:'Kalkan +%15',               e:'shield+=0.15'},
  {n:'Şifa Aurası',    i:'✨',t:2,d:'Aura ile sürekli iyileşme',  e:'healAura=true'},
  {n:'Şifa Aurası II', i:'✨',t:2,d:'Aura gücü +%50',             e:'healAuraPow*=1.5'},
  {n:'Demir Beden',    i:'🦾',t:2,d:'Hasar azaltma +%20',         e:'dmgReduction+=0.2'},
  {n:'Demir Beden II', i:'🦾',t:2,d:'Hasar azaltma +%15',         e:'dmgReduction+=0.15'},
  {n:'Can Çalma+',     i:'🩸',t:2,d:'Can çalma +%10',             e:'lifesteal+=0.1'},
  {n:'Can Çalma+ II',  i:'🩸',t:2,d:'Can çalma +%12',             e:'lifesteal+=0.12'},
  {n:'Direniş',        i:'💪',t:2,d:'Düşman hasar eşiği -%30',    e:'enemyDmgReduce=0.3'},
  {n:'Çifte Nabız',    i:'⚡',t:2,d:'HP rejene hızı 2x',          e:'hpRegenMult*=2'},
  {n:'Ebedi Yaşam',    i:'♾️',t:3,d:'Max HP +80',                  e:'maxHp+=80'},
  {n:'Ebedi Yaşam II', i:'♾️',t:3,d:'Max HP +80',                  e:'maxHp+=80'},
  {n:'Ölümsüzlük',     i:'👼',t:3,d:'Ölünce diril (2 kez)',        e:'hasRevive=true;reviveCount=2'},
  {n:'Ölümsüzlük II',  i:'👼',t:3,d:'Dirilme HP +%30',             e:'reviveHp*=1.3'},
  {n:'Tanrısal Şifa',  i:'💖',t:3,d:'Beceri kullanınca HP rejene', e:'healOnSkill=true'},
  {n:'Yaşam Tanrısı',  i:'💚',t:3,d:'Tüm iyileşme +%50',          e:'lifePower*=1.5'},
  {n:'Kan Havuzu',     i:'🩸',t:3,d:'Can çalma +%20',              e:'lifesteal+=0.2'},
  {n:'Kurtarıcı',      i:'🏥',t:3,d:'HP %20\'nin altına düşünce anında %30 rejene',e:'emergencyHeal=true'},
  {n:'Sonsuz Güç',     i:'💫',t:3,d:'HP, hasar ve hız +%20',        e:'maxHp*=1.2;atk*=1.2;speed*=1.2'},
  {n:'YAŞAM TANRISI',  i:'🌟',t:3,d:'TÜM yaşam yetenekleri 2x güç',e:'lifeGodMode=true'},
]},

// ── 7. BOŞ/VOID ──────────────────────────────────────
{id:'void', name:'BOŞ', icon:'🌌', col:'#3300aa', desc:'Yokluk ve boyut gücü',
 skills:[
  {n:'Void Çarpması',  i:'🌌',t:1,d:'Mermi hasarı +%14',      e:'atk*=1.14'},
  {n:'Void Çarpması II',i:'🌌',t:1,d:'Mermi hasarı +%16',     e:'atk*=1.16'},
  {n:'Void Çarpması III',i:'🌌',t:1,d:'Mermi hasarı +%18',    e:'atk*=1.18'},
  {n:'Teleport',       i:'🌀',t:1,d:'Dash = anında ışınlanma', e:'teleportDash=true'},
  {n:'Teleport II',    i:'🌀',t:1,d:'Teleport menzili +%50',   e:'dashRange*=1.5'},
  {n:'Void Zırh',      i:'⚫',t:1,d:'Savunma +7',              e:'def+=7'},
  {n:'Void Zırh II',   i:'⚫',t:1,d:'Savunma +8',              e:'def+=8'},
  {n:'Karanlık Enerji',i:'🌑',t:1,d:'MP +30',                  e:'maxMp+=30'},
  {n:'Karanlık Enerji II',i:'🌑',t:1,d:'MP +35',               e:'maxMp+=35'},
  {n:'Void Çekimi',    i:'🌀',t:1,d:'Mermiler düşmanı çeker',  e:'bulletPull=true'},
  {n:'Kara Delik',     i:'⚫',t:2,d:'Düşmanları emen kara delik',e:'sk1Type="blackhole"'},
  {n:'Kara Delik II',  i:'⚫',t:2,d:'Kara delik gücü +%40',    e:'sk1Dmg*=1.4'},
  {n:'Boyut Yarığı',   i:'🌠',t:2,d:'Boyut yarığından enerji çek',e:'sk2Type="dimensionrift"'},
  {n:'Boyut Yarığı II',i:'🌠',t:2,d:'Enerji hasarı +%35',      e:'sk2Dmg*=1.35'},
  {n:'Varoluş Dışı',   i:'👻',t:2,d:'5s boyutlar arası geziyor',e:'phasewalk=true'},
  {n:'Varoluş Dışı II',i:'👻',t:2,d:'Faz yürüyüşü +2s',        e:'phasewalkDur+=120'},
  {n:'Void Emme',      i:'🕳️',t:2,d:'Öldürünce %8 MP rejene', e:'manaOnKill=0.08'},
  {n:'Void Emme II',   i:'🕳️',t:2,d:'Emme miktarı +%50',      e:'voidSiphon*=1.5'},
  {n:'Kaotik Boyut',   i:'🌀',t:2,d:'Beceri CD -%30',           e:'cdReduction*=0.7'},
  {n:'Çift Void',      i:'🌌',t:2,d:'+1 ekstra mermi (void)',    e:'extraBullets+=1'},
  {n:'Varoluş Sonu',   i:'💫',t:3,d:'Tüm ekranı temizle',       e:'sk3Type="existenceend"'},
  {n:'Varoluş Sonu II',i:'💫',t:3,d:'Hasar +%60',               e:'sk3Dmg*=1.6'},
  {n:'Sonsuz Void',    i:'♾️',t:3,d:'Void gücü +%50',           e:'voidPower*=1.5'},
  {n:'Sonsuz Void II', i:'♾️',t:3,d:'Void gücü +%50',           e:'voidPower*=1.5'},
  {n:'Galaksi Varlığı',i:'🌌',t:3,d:'Her istatistik +%25',       e:'atk*=1.25;def*=1.25;speed*=1.25'},
  {n:'Void Tanrısı',   i:'🌌',t:3,d:'Tüm void hasarı +%45',     e:'voidPower*=1.45'},
  {n:'Boyut Geçidi',   i:'🚪',t:3,d:'Anlık tüm düşmanları dağıt',e:'sk2Alt="dimensionscatter"'},
  {n:'Evren Gücü',     i:'🌠',t:3,d:'HP, hasar +%30',            e:'maxHp*=1.3;atk*=1.3'},
  {n:'Kara Güneş',     i:'⚫',t:3,d:'Sürekli AoE hasar alanı',   e:'darkSun=true'},
  {n:'VOID TANRISI',   i:'🌟',t:3,d:'TÜM void yetenekleri 2x güç',e:'voidGodMode=true'},
]},

// ── 8. TOPRAK ─────────────────────────────────────────
{id:'earth', name:'TOPRAK', icon:'🌍', col:'#8B4513', desc:'Zırh ve dayanıklılık',
 skills:[
  {n:'Kaya Yumruğu',   i:'🌍',t:1,d:'Mermi hasarı +%10',      e:'atk*=1.1'},
  {n:'Kaya Yumruğu II',i:'🌍',t:1,d:'Mermi hasarı +%12',      e:'atk*=1.12'},
  {n:'Kaya Yumruğu III',i:'🌍',t:1,d:'Mermi hasarı +%14',     e:'atk*=1.14'},
  {n:'Granit Zırh',    i:'🪨',t:1,d:'Savunma +8',               e:'def+=8'},
  {n:'Granit Zırh II', i:'🪨',t:1,d:'Savunma +10',              e:'def+=10'},
  {n:'Toprak Kalkanı', i:'🛡️',t:1,d:'Hasar azaltma +%12',      e:'dmgReduction+=0.12'},
  {n:'Toprak Kalkanı II',i:'🛡️',t:1,d:'Hasar azaltma +%15',    e:'dmgReduction+=0.15'},
  {n:'Titanyum Ten',   i:'⚙️',t:1,d:'HP +30',                   e:'maxHp+=30'},
  {n:'Titanyum Ten II',i:'⚙️',t:1,d:'HP +35',                   e:'maxHp+=35'},
  {n:'Yer Sarsıntısı', i:'💥',t:1,d:'Mermi yakın patlama yapar',e:'bulletQuake=true'},
  {n:'Deprem',         i:'🌋',t:2,d:'Tüm yakın düşmanları sersemlet',e:'sk1Type="earthquake"'},
  {n:'Deprem II',      i:'🌋',t:2,d:'Deprem hasarı +%30',        e:'sk1Dmg*=1.3'},
  {n:'Taş Golem',      i:'🗿',t:2,d:'Savaşan taş golem',         e:'sk2Type="golem"'},
  {n:'Taş Golem II',   i:'🗿',t:2,d:'Golem hasarı +%40',         e:'golemDmg*=1.4'},
  {n:'Kaya Duvarı',    i:'🧱',t:2,d:'Mermileri bloke eden duvar', e:'sk3Type="rockwall"'},
  {n:'Kaya Duvarı II', i:'🧱',t:2,d:'Duvar HP +%50',              e:'wallHp*=1.5'},
  {n:'Maden Damarı',   i:'💎',t:2,d:'Altın kazanımı +%30',       e:'goldMult*=1.3'},
  {n:'Maden Damarı II',i:'💎',t:2,d:'Altın kazanımı +%40',       e:'goldMult*=1.4'},
  {n:'Yerçekimi',      i:'🌀',t:2,d:'Düşmanları kendine çeker',   e:'gravityField=true'},
  {n:'Çift Kaya',      i:'🌍',t:2,d:'+1 ekstra mermi',            e:'extraBullets+=1'},
  {n:'Titan Formu',    i:'👊',t:3,d:'Savunma +20, HP +60',        e:'def+=20;maxHp+=60'},
  {n:'Titan Formu II', i:'👊',t:3,d:'Savunma +25, HP +80',        e:'def+=25;maxHp+=80'},
  {n:'Kıyamet Darbesi',i:'💥',t:3,d:'Dev alan saldırısı',         e:'sk1Alt="doomstrike"'},
  {n:'Kıyamet Darbesi II',i:'💥',t:3,d:'Hasar +%60',              e:'doomDmg*=1.6'},
  {n:'Toprak Tanrısı', i:'🌍',t:3,d:'Tüm toprak hasarı +%40',     e:'earthPower*=1.4'},
  {n:'Dünya Kalkanı',  i:'🌐',t:3,d:'%35 hasar azaltma kalıcı',    e:'dmgReduction+=0.35'},
  {n:'Mineral Cevheri',i:'💎',t:3,d:'Altın 2x, skor 2x',           e:'goldMult*=2;scoreMult*=2'},
  {n:'Sismik Darbe',   i:'🌊',t:3,d:'Dalga dalga hasar yayar',     e:'seismicWave=true'},
  {n:'Yer Yarığı',     i:'⚡',t:3,d:'Zemin yarığı açar düşmanları engeller',e:'groundRift=true'},
  {n:'TOPRAK TANRISI', i:'🌟',t:3,d:'TÜM toprak yetenekleri 2x güç',e:'earthGodMode=true'},
]},

// ── 9. IŞIK ──────────────────────────────────────────
{id:'light', name:'IŞIK', icon:'☀️', col:'#FFD700', desc:'Hız ve destek ustası',
 skills:[
  {n:'Işık Hızı',      i:'☀️',t:1,d:'Mermi hızı +%20',         e:'bulletSpeed*=1.2'},
  {n:'Işık Hızı II',   i:'☀️',t:1,d:'Mermi hızı +%25',         e:'bulletSpeed*=1.25'},
  {n:'Işık Hızı III',  i:'☀️',t:1,d:'Mermi hızı +%30',         e:'bulletSpeed*=1.3'},
  {n:'Parlama',        i:'✨',t:1,d:'Hareket hızı +%15',         e:'speed*=1.15'},
  {n:'Parlama II',     i:'✨',t:1,d:'Hareket hızı +%15',         e:'speed*=1.15'},
  {n:'Güneş Zırh',     i:'🌟',t:1,d:'Savunma +5, HP +15',       e:'def+=5;maxHp+=15'},
  {n:'Güneş Zırh II',  i:'🌟',t:1,d:'Savunma +6, HP +20',       e:'def+=6;maxHp+=20'},
  {n:'Fotosenkron',    i:'🔆',t:1,d:'MP rejene +%25',             e:'mpRegen*=1.25'},
  {n:'Fotosenkron II', i:'🔆',t:1,d:'MP rejene +%30',             e:'mpRegen*=1.3'},
  {n:'Kör Edici',      i:'🌟',t:1,d:'Mermi isabet: düşman sersemler',e:'stunOnHit=true'},
  {n:'Güneş Patlaması',i:'☀️',t:2,d:'Güneş patlaması becerisi',  e:'sk1Type="solarflare"'},
  {n:'Güneş Patlaması II',i:'☀️',t:2,d:'Patlama hasarı +%30',    e:'sk1Dmg*=1.3'},
  {n:'Işık Kalkan',    i:'🌟',t:2,d:'Mermileri yansıtır',         e:'lightShield=true'},
  {n:'Işık Kalkan II', i:'🌟',t:2,d:'Yansıtma şansı +%30',        e:'reflectChance+=0.3'},
  {n:'Hiper Hız',      i:'⚡',t:2,d:'Hız 1.5x, ateş hızı 1.3x',  e:'speed*=1.5;fireRate*=0.77'},
  {n:'Hiper Hız II',   i:'⚡',t:2,d:'Hız 1.3x, ateş hızı 1.2x',  e:'speed*=1.3;fireRate*=0.83'},
  {n:'Lazer Kirişi',   i:'🔆',t:2,d:'Lazer becerisi',             e:'sk2Type="laserbeam"'},
  {n:'Lazer Kirişi II',i:'🔆',t:2,d:'Lazer hasarı +%40',          e:'sk2Dmg*=1.4'},
  {n:'Işık Dansı',     i:'💫',t:2,d:'Dash hızlı 2x atar',         e:'doubleDash=true'},
  {n:'Güneş Okları',   i:'☀️',t:2,d:'+2 ekstra mermi',             e:'extraBullets+=2'},
  {n:'Işık Tanrısı',   i:'☀️',t:3,d:'Tüm ışık hasarı +%45',       e:'lightPower*=1.45'},
  {n:'Işık Tanrısı II',i:'☀️',t:3,d:'Tüm ışık hasarı +%50',       e:'lightPower*=1.5'},
  {n:'Kutsal Işın',    i:'✝️',t:3,d:'Hasar azaltma +%25, HP rejene',e:'dmgReduction+=0.25;hpRegen+=0.05'},
  {n:'Kutsal Işın II', i:'✝️',t:3,d:'Rejene +%50',                  e:'hpRegen*=1.5'},
  {n:'Güneş Kalıcısı', i:'🔆',t:3,d:'Max HP +50, Max MP +30',       e:'maxHp+=50;maxMp+=30'},
  {n:'Işıltılı Kılıç', i:'⚔️',t:3,d:'Kesim becerisi (yakın AoE)',   e:'sk3Type="lightblade"'},
  {n:'Fotonik Patlama',i:'💥',t:3,d:'Foton patlaması tüm alanı kaplıyor',e:'sk2Alt="photonburst"'},
  {n:'Güneş Sistemi',  i:'🌌',t:3,d:'Orbiting güneş topları',       e:'solarOrbit=true'},
  {n:'Sonsuz Aydınlık',i:'🌟',t:3,d:'HP %100 rejene, tam dolum',    e:'hp=maxHp;mp=maxMp'},
  {n:'IŞIK TANRISI',   i:'🌟',t:3,d:'TÜM ışık yetenekleri 2x güç', e:'lightGodMode=true'},
]},

// ── 10. RÜZGAR ───────────────────────────────────────
{id:'wind', name:'RÜZGAR', icon:'🌪️', col:'#00FFCC', desc:'Hız ve kaçınma ustası',
 skills:[
  {n:'Rüzgar Darbesi', i:'🌪️',t:1,d:'Mermi hasarı +%11',      e:'atk*=1.11'},
  {n:'Rüzgar Darbesi II',i:'🌪️',t:1,d:'Mermi hasarı +%13',    e:'atk*=1.13'},
  {n:'Rüzgar Darbesi III',i:'🌪️',t:1,d:'Mermi hasarı +%15',   e:'atk*=1.15'},
  {n:'Hava Akımı',     i:'💨',t:1,d:'Hareket hızı +%18',        e:'speed*=1.18'},
  {n:'Hava Akımı II',  i:'💨',t:1,d:'Hareket hızı +%18',        e:'speed*=1.18'},
  {n:'Kasırga Zırh',   i:'🌀',t:1,d:'Savunma +4, kaçınma +%10', e:'def+=4;dodgeChance=0.1'},
  {n:'Kasırga Zırh II',i:'🌀',t:1,d:'Savunma +5, kaçınma +%10', e:'def+=5;dodgeChance+=0.1'},
  {n:'Rüzgar Nefesi',  i:'💨',t:1,d:'Ateş hızı +%15',            e:'fireRate*=0.85'},
  {n:'Rüzgar Nefesi II',i:'💨',t:1,d:'Ateş hızı +%15',           e:'fireRate*=0.85'},
  {n:'Fırtına Adımı',  i:'⚡',t:1,d:'Dash şarjı +1',             e:'dashCharges+=1'},
  {n:'Hortum',         i:'🌪️',t:2,d:'Düşmanları emen hortum',    e:'sk1Type="tornado"'},
  {n:'Hortum II',      i:'🌪️',t:2,d:'Hortum gücü +%35',          e:'sk1Dmg*=1.35'},
  {n:'Kasırga Kalkan', i:'🌀',t:2,d:'Dönen rüzgar kalkanı',       e:'windShield=true'},
  {n:'Kasırga Kalkan II',i:'🌀',t:2,d:'Kalkan hasarı +%40',       e:'windShieldDmg*=1.4'},
  {n:'Fırtına Adım+',  i:'💨',t:2,d:'Dash 3x kullanım',           e:'dashCharges=3'},
  {n:'Fırtına Adım+ II',i:'💨',t:2,d:'Dash CD -%30',              e:'dashMaxCd*=0.7'},
  {n:'Kaçınma Ustası', i:'🌀',t:2,d:'Kaçınma şansı +%20',         e:'dodgeChance+=0.2'},
  {n:'Kaçınma Ustası II',i:'🌀',t:2,d:'Kaçınma şansı +%20',       e:'dodgeChance+=0.2'},
  {n:'Rüzgar Çarki',   i:'🌀',t:2,d:'Düşman mermi sapma şansı +%25',e:'bulletDodge=0.25'},
  {n:'Tornado Okları', i:'🌪️',t:2,d:'+2 ekstra mermi',              e:'extraBullets+=2'},
  {n:'Rüzgar Tanrısı', i:'🌪️',t:3,d:'Hız ve hasar +%40',           e:'speed*=1.4;atk*=1.4'},
  {n:'Rüzgar Tanrısı II',i:'🌪️',t:3,d:'Hız ve hasar +%40',         e:'speed*=1.4;atk*=1.4'},
  {n:'Sonsuz Kasırga', i:'🌀',t:3,d:'Dev kasırga becerisi',          e:'sk3Type="hypercane"'},
  {n:'Sonsuz Kasırga II',i:'🌀',t:3,d:'Kasırga hasarı +%55',         e:'sk3Dmg*=1.55'},
  {n:'Fırtına Formu',  i:'⚡',t:3,d:'5s ultrainstinct modu',         e:'sk2Type="stormform"'},
  {n:'Fırtına Formu II',i:'⚡',t:3,d:'Form süresi +2s',              e:'stormFormDur+=120'},
  {n:'Işık Gibi Hız',  i:'💨',t:3,d:'Hız 3x, görünmez (2s)',         e:'speed*=3;sk1Alt="lightspeed"'},
  {n:'Hava Kalesi',    i:'🏰',t:3,d:'HP +70, %30 hasar azaltma',     e:'maxHp+=70;dmgReduction+=0.3'},
  {n:'Son Kasırga',    i:'🌪️',t:3,d:'Haritayı silen kasırga',        e:'sk2Alt="finalstorm"'},
  {n:'RÜZGAR TANRISI', i:'🌟',t:3,d:'TÜM rüzgar yetenekleri 2x güç',e:'windGodMode=true'},
]},

]; // ELEMENTS END

// Kart nadir oranları — T1 daha yaygın, T3 çok nadir
const ELEM_CARD_RARITY = {
  t1_common:   {weight:55, label:'YAYGIN',  badge:'badge-common',    tier:1},
  t1_uncommon: {weight:25, label:'SIRADAN', badge:'badge-common',    tier:1},
  t2_rare:     {weight:13, label:'NADİR',   badge:'badge-rare',      tier:2},
  t2_epic:     {weight: 5, label:'EPİK',    badge:'badge-epic',      tier:2},
  t3_legendary:{weight: 2, label:'EFSANE',  badge:'badge-legendary', tier:3},
};

function pickElemCard(elemIds){
  // elemIds: ['fire','ice'] gibi
  // Toplam ağırlık
  const weights = Object.values(ELEM_CARD_RARITY);
  const total = weights.reduce((s,w)=>s+w.weight,0);
  let r = Math.random()*total;
  let chosenRarityKey = 't1_common';
  for(const [k,v] of Object.entries(ELEM_CARD_RARITY)){
    r-=v.weight;
    if(r<=0){chosenRarityKey=k;break;}
  }
  const rarDef = ELEM_CARD_RARITY[chosenRarityKey];
  // Rastgele element seç
  const elemId = elemIds[Math.floor(Math.random()*elemIds.length)];
  const elem = ELEMENTS.find(e=>e.id===elemId);
  if(!elem) return null;
  // Tier'a göre skill seç
  const tierSkills = elem.skills.filter(s=>s.t===rarDef.tier);
  if(!tierSkills.length) return null;
  const skill = tierSkills[Math.floor(Math.random()*tierSkills.length)];
  return {
    elem, skill, rarityKey: chosenRarityKey, rarDef,
    n: skill.n, i: skill.i, d: skill.d,
    r: rarDef.tier===3?'legendary':rarDef.tier===2?(rarDef.weight<=5?'epic':'rare'):'common',
    fn: (p)=>{ applyElemSkill(p, elem.id, skill); }
  };
}

function applyElemSkill(p, elemId, skill){
  const e = skill.e; // effect string — eval yerine switch
  const atk = p.atk;
  // Güvenli uygulama — eval yok
  if(e.includes('atk*='))      { const m=parseFloat(e.match(/atk\*=([\d.]+)/)[1]); p.atk=Math.floor(p.atk*m); }
  if(e.includes('def+='))      { const m=parseFloat(e.match(/def\+=([\d.]+)/)[1]); p.def+=m; }
  if(e.includes('maxHp+='))    { const m=parseFloat(e.match(/maxHp\+=([\d.]+)/)[1]); p.maxHp=Math.min(300,p.maxHp+m); p.hp=Math.min(p.hp+m/2,p.maxHp); }
  if(e.includes('maxHp*='))    { const m=parseFloat(e.match(/maxHp\*=([\d.]+)/)[1]); p.maxHp=Math.min(300,Math.floor(p.maxHp*m)); }
  if(e.includes('maxMp+='))    { const m=parseFloat(e.match(/maxMp\+=([\d.]+)/)[1]); p.maxMp+=m; }
  if(e.includes('speed*='))    { const m=parseFloat(e.match(/speed\*=([\d.]+)/)[1]); p.speed=Math.min(p.speed*m,9); }
  if(e.includes('fireRate*=')) { const m=parseFloat(e.match(/fireRate\*=([\d.]+)/)[1]); p.autoFireRate=Math.max(6,Math.floor(p.autoFireRate*m)); }
  if(e.includes('extraBullets+=')){ const m=parseFloat(e.match(/extraBullets\+=([\d.]+)/)[1]); p.extraBullets=(p.extraBullets||0)+m; }
  if(e.includes('critChance+=')){ const m=parseFloat(e.match(/critChance\+=([\d.]+)/)[1]); p.critChance=Math.min(0.85,p.critChance+m); }
  if(e.includes('critMult+='))  { const m=parseFloat(e.match(/critMult\+=([\d.]+)/)[1]); p.critMult+=m; }
  if(e.includes('lifesteal+=')) { const m=parseFloat(e.match(/lifesteal\+=([\d.]+)/)[1]); p.lifesteal=Math.min(0.6,p.lifesteal+m); }
  if(e.includes('hpRegen+='))   { const m=parseFloat(e.match(/hpRegen\+=([\d.]+)/)[1]); p.hpRegen+=m; }
  if(e.includes('mpRegen*='))   { const m=parseFloat(e.match(/mpRegen\*=([\d.]+)/)[1]); p.mpRegenMult=(p.mpRegenMult||1)*m; }
  if(e.includes('hasRevive=true')) p.hasRevive=true;
  if(e.includes('dmgReduction+=')){ const m=parseFloat(e.match(/dmgReduction\+=([\d.]+)/)[1]); p.dmgReduction=Math.min(0.75,(p.dmgReduction||0)+m); }
  if(e.includes('cdReduction*=')){ const m=parseFloat(e.match(/cdReduction\*=([\d.]+)/)[1]); const red=m; p.sk1MaxCd=Math.max(40,Math.floor(p.sk1MaxCd*red)); p.sk2MaxCd=Math.max(40,Math.floor(p.sk2MaxCd*red)); p.sk3MaxCd=Math.max(80,Math.floor(p.sk3MaxCd*red)); }
  if(e.includes('goldMult*='))  { const m=parseFloat(e.match(/goldMult\*=([\d.]+)/)[1]); p.goldMult=(p.goldMult||1)*m; }
  if(e.includes('dodgeChance+=')){ const m=parseFloat(e.match(/dodgeChance\+=([\d.]+)/)[1]); p.dodgeChance=Math.min(0.5,(p.dodgeChance||0)+m); }
  if(e.includes('dashMaxCd*=')) { const m=parseFloat(e.match(/dashMaxCd\*=([\d.]+)/)[1]); p.dashMaxCd=Math.max(30,Math.floor(p.dashMaxCd*m)); }
  // God mode — tüm ana stat %50 artış
  if(e.includes('GodMode=true')){ p.atk=Math.floor(p.atk*1.5); p.def=Math.floor(p.def*1.3); p.maxHp=Math.min(300,Math.floor(p.maxHp*1.2)); p.speed=Math.min(p.speed*1.2,9); }
  if(e.includes('hp=maxHp'))   { p.hp=p.maxHp; p.mp=p.maxMp; }
}

// GEORIFT Service Worker
// Versiyon numarasını her güncellemede 1 artır → otomatik güncelleme tetiklenir
const VERSION = ‘v1’;
const CACHE = ‘georift-’ + VERSION;

// Önbelleğe alınacak dosyalar
const FILES = [
‘./’,
‘./index.html’
];

// Kurulum — dosyaları önbelleğe al
self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE).then(c => c.addAll(FILES))
);
});

// Aktivasyon — eski önbellekleri sil
self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
).then(() => self.clients.claim())
);
});

// Fetch — önce ağdan dene, başarısız olursa önbellekten sun
self.addEventListener(‘fetch’, e => {
e.respondWith(
fetch(e.request)
.then(res => {
// Güncel dosyayı önbelleğe de kaydet
const clone = res.clone();
caches.open(CACHE).then(c => c.put(e.request, clone));
return res;
})
.catch(() => caches.match(e.request))
);
});

// Ana sayfa güncellenince hemen devral
self.addEventListener(‘message’, e => {
if (e.data && e.data.type === ‘SKIP_WAITING’) self.skipWaiting();
});
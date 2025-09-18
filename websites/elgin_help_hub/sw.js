// Very small offline cache (works only on http/https)
const CACHE = 'ehh-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './i18n.js',
    './resources.js',
    './app.js',
    './manifest.webmanifest'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    );
});

self.addEventListener('fetch', e => {
    const req = e.request;
    // Network-first for navigation; cache-first for assets
    if (req.mode === 'navigate') {
        e.respondWith(fetch(req).catch(() => caches.match('./')));
    } else {
        e.respondWith(
            caches.match(req).then(res => res || fetch(req).then(r => {
                const clone = r.clone();
                caches.open(CACHE).then(c => c.put(req, clone));
                return r;
            }))
        );
    }
});

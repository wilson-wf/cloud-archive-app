// Service Worker - 仅缓存应用外壳，API 请求始终走网络
const CACHE = 'cloud-archive-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // GitHub API 请求不走缓存
  if (url.hostname === 'api.github.com') return;
  // 其他用缓存优先，失败回退网络
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

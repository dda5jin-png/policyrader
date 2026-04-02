// ═══════════════════════════════════════════════
// 정책레이더 Service Worker v1.0
// 오프라인 캐싱 + 백그라운드 동기화
// ═══════════════════════════════════════════════

const CACHE_NAME = 'policyrader-v1';
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ── 설치: 핵심 파일 캐시 ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 정책레이더 캐시 설치 중...');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] 일부 파일 캐시 실패 (무시됨):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── 활성화: 구버전 캐시 정리 ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] 구버전 캐시 삭제:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: 캐시 우선, 네트워크 폴백 ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 외부 도메인 (광고, CDN 등)은 패스
  if (url.origin !== location.origin) return;

  // GET 요청만 캐시
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // 캐시 히트: 반환하면서 백그라운드에서 갱신
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, response)
            );
          }
        }).catch(() => {});
        return cached;
      }
      // 캐시 미스: 네트워크 요청 후 캐시 저장
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache =>
          cache.put(event.request, responseToCache)
        );
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ── 푸시 알림 (향후 구독자 알림용) ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || '새로운 정책 보도자료가 등록되었습니다.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: data.tag || 'policyrader-update',
    data: { url: data.url || '/index.html' },
    actions: [
      { action: 'view', title: '바로 보기' },
      { action: 'close', title: '닫기' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || '[정책레이더] 새 정책 업데이트',
      options
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/index.html';
    event.waitUntil(clients.openWindow(url));
  }
});

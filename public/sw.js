/* Service worker de Refugio PAS: guarda la app y el audio del Orbe S.O.S. para que funcionen sin internet.
   - Audio (/audio/*): se guarda COMPLETO y se sirve con soporte de rangos (los navegadores lo piden por trozos).
   - Pantallas de la app (/app/*): primero internet (siempre la versión nueva); sin conexión, la última guardada.
   - Archivos fijos (/_next/static, íconos): primero lo guardado.
   Al subir de versión se cambia VERSION y se borra lo viejo. No toca /api ni /auth. */

const VERSION = 'v1';
const PAGINAS = `refugio-paginas-${VERSION}`;
const AUDIO = `refugio-audio-${VERSION}`;
const ESTATICOS = `refugio-estaticos-${VERSION}`;
const ACTUALES = [PAGINAS, AUDIO, ESTATICOS];

const AUDIO_ORBE = '/audio/orbe-liberacion-2min-v2.mp3';
const RUTAS_APP = ['/app', '/app/habitos', '/app/biblioteca', '/app/diario', '/app/perfil'];

async function guardarPagina(cache, url) {
  try {
    const r = await fetch(url, { credentials: 'same-origin' });
    // Solo se guarda una pantalla real (no una redirección al login).
    if (r.ok && !r.redirected) await cache.put(url, r.clone());
  } catch {
    /* sin conexión al instalar: se guarda en la próxima visita */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const audio = await caches.open(AUDIO);
      try {
        const r = await fetch(AUDIO_ORBE); // completo, sin Range
        if (r.ok) await audio.put(AUDIO_ORBE, r);
      } catch {
        /* se guardará al reproducirlo con conexión */
      }
      const paginas = await caches.open(PAGINAS);
      await Promise.all(RUTAS_APP.map((u) => guardarPagina(paginas, u)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const claves = await caches.keys();
      await Promise.all(claves.filter((k) => k.startsWith('refugio-') && !ACTUALES.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Responde un audio guardado respetando el encabezado Range.
async function servirAudioGuardado(request, respuestaGuardada) {
  const rango = request.headers.get('range');
  if (!rango) return respuestaGuardada;
  const buffer = await respuestaGuardada.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(rango);
  const total = buffer.byteLength;
  const inicio = m && m[1] ? parseInt(m[1], 10) : 0;
  const fin = m && m[2] ? Math.min(parseInt(m[2], 10), total - 1) : total - 1;
  if (inicio >= total) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  return new Response(buffer.slice(inicio, fin + 1), {
    status: 206,
    headers: {
      'Content-Type': respuestaGuardada.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${inicio}-${fin}/${total}`,
      'Content-Length': String(fin - inicio + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  // 1) Audio: primero lo guardado; si no está, internet y se guarda completo para la próxima.
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(AUDIO);
        const guardado = await cache.match(url.pathname);
        if (guardado) return servirAudioGuardado(request, guardado);
        event.waitUntil(
          fetch(url.pathname)
            .then((r) => (r.ok ? cache.put(url.pathname, r) : undefined))
            .catch(() => undefined)
        );
        return fetch(request);
      })()
    );
    return;
  }

  // 2) Pantallas: internet primero; sin conexión, la última guardada (o Inicio).
  if (request.mode === 'navigate') {
    if (!url.pathname.startsWith('/app')) return;
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGINAS);
        try {
          const r = await fetch(request);
          if (r.ok && !r.redirected) cache.put(url.pathname, r.clone());
          return r;
        } catch {
          return (
            (await cache.match(url.pathname)) ||
            (await cache.match('/app')) ||
            new Response('Sin conexión. Abre Refugio PAS cuando tengas internet.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          );
        }
      })()
    );
    return;
  }

  // 3) Archivos fijos de la app: primero lo guardado.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ESTATICOS);
        const guardado = await cache.match(request);
        if (guardado) return guardado;
        const r = await fetch(request);
        if (r.ok) cache.put(request, r.clone());
        return r;
      })()
    );
  }
});

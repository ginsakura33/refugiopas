import type { MetadataRoute } from 'next';

// Permite instalar Refugio PAS en la pantalla de inicio del celular (abre a pantalla completa).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Refugio PAS — Guía y Autohipnosis',
    short_name: 'Refugio PAS',
    description: 'Audios de autohipnosis guiada en español para personas altamente sensibles.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'es',
    background_color: '#fff9f5',
    theme_color: '#fff9f5',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

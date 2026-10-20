import type { NextConfig } from "next";

// Encabezados de seguridad (reglas moderadas, pensadas para no bloquear nada legítimo de la app):
// - no dejar que otra página meta Refugio PAS dentro de un marco (clickjacking),
// - no adivinar tipos de archivo, no revelar la dirección de origen completa,
// - cámara/micrófono/ubicación apagados (la foto de perfil usa el selector del teléfono, no necesita permiso),
// - HTTPS obligatorio. No se activa una política estricta de scripts (CSP completa) para no romper Next.js.
const SEGURIDAD = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: SEGURIDAD },
      // El service worker nunca se guarda en caché del navegador: así las actualizaciones llegan siempre.
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;

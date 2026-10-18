import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
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

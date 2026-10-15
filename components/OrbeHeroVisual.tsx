'use client';

// Mini-demo HONESTO del mecanismo real (jerarquía de mockups honestos, 19 §5.2):
// no es una captura de la app (todavía no existe — Sesión 5), es una reproducción
// fiel del Orbe que Respira ya aprobado en FICHA-ARTE.md y direcciones-abc.html
// (mismo degradé dorado→rosa, mismo texto "2 min", mismo layout de la tarjeta
// "Toca aquí" de Inicio). Vive fuera de components/landing/ (el kit) porque es
// un asset propio del proyecto, no una pieza del kit genérico.
// El pulso sutil de "respiración" hace tangible la promesa ("Toca aquí") en vez
// de mostrar un círculo inerte — respeta prefers-reduced-motion.

import { motion, useReducedMotion } from 'motion/react';

export function OrbeHeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-4 bg-[var(--surface)] px-8 py-10 text-center">
      <p className="text-sm font-medium text-[var(--text-secondary)]">Toca aquí</p>
      <motion.div
        aria-hidden="true"
        className="flex items-center justify-center rounded-full"
        style={{
          width: 140,
          height: 140,
          background:
            'radial-gradient(circle at 32% 28%, color-mix(in oklab, var(--accent) 38%, white), color-mix(in oklab, var(--accent-2) 55%, white) 75%)',
          boxShadow: '0 0 0 10px color-mix(in oklab, var(--accent) 8%, transparent), var(--shadow-2)',
        }}
        animate={reduce ? undefined : { scale: [1, 1.035, 1] }}
        transition={reduce ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="italic text-[var(--text-primary)] [font-family:var(--font-display)] text-2xl">
          2 min
        </span>
      </motion.div>
      <p className="max-w-[26ch] text-sm leading-snug text-[var(--text-secondary)]">
        Respira y baja la sobrecarga
      </p>
    </div>
  );
}

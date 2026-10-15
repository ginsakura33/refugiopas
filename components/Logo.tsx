// Isotipo de Refugio PAS (elegido por el usuario, 2026-10-13): un techo-refugio abierto, una figura
// con los brazos abiertos, un corazón y pétalos que la sostienen. Dos versiones del MISMO dibujo:
//  · completa  → con pétalos rosados (desde ~48px)
//  · simple    → solo techo, corazón y figura, trazos más gruesos (favicon, menú, tamaños mínimos)
// "auto" elige sola según el tamaño. Los degradados usan ids únicos por instancia.

import Image from 'next/image';
import { useId } from 'react';

export function Logo({
  size = 24,
  variante = 'auto',
  className,
  titulo,
}: {
  size?: number;
  variante?: 'auto' | 'completa' | 'simple';
  className?: string;
  /** Texto accesible. Sin título, el logo se trata como decorativo (aria-hidden). */
  titulo?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const simple = variante === 'simple' || (variante === 'auto' && size < 48);
  const oro = `oro-${uid}`;
  const rosaIzq = `rosaI-${uid}`;
  const rosaDer = `rosaD-${uid}`;
  const corazon = `cor-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={simple ? '30 30 140 120' : '0 0 200 200'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <defs>
        <linearGradient id={oro} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--logo-oro-1)" }} />
          <stop offset="50%" style={{ stopColor: "var(--logo-oro-2)" }} />
          <stop offset="100%" style={{ stopColor: "var(--logo-oro-3)" }} />
        </linearGradient>
        <linearGradient id={rosaIzq} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--logo-rosa-1)" }} />
          <stop offset="100%" style={{ stopColor: "var(--logo-rosa-2)" }} />
        </linearGradient>
        <linearGradient id={rosaDer} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--logo-rosa-1)" }} />
          <stop offset="100%" style={{ stopColor: "var(--logo-rosa-2)" }} />
        </linearGradient>
        <linearGradient id={corazon} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--logo-cor-1)" }} />
          <stop offset="100%" style={{ stopColor: "var(--logo-cor-2)" }} />
        </linearGradient>
      </defs>

      <g transform="translate(0, 5)">
        {/* Techo del refugio */}
        <path
          d="M 100 38 L 148 64 V 102 M 100 38 L 52 64 V 102"
          stroke={`url(#${oro})`}
          strokeWidth={simple ? 11 : 6.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Corazón */}
        <path
          d="M 100 60 C 96 53 88 54 88 61 C 88 67 100 76 100 76 C 100 76 112 67 112 61 C 112 54 104 53 100 60 Z"
          fill={`url(#${corazon})`}
        />
        {/* Cabeza */}
        <circle cx="100" cy="85" r={simple ? 9 : 7.5} fill={`url(#${oro})`} />
        {/* Pétalos rosados (solo en la versión completa) */}
        {!simple && (
          <>
            <path d="M 100 132 C 75 132 45 110 40 92 C 60 92 88 108 100 132 Z" fill={`url(#${rosaIzq})`} opacity="0.85" />
            <path d="M 100 132 C 125 132 155 110 160 92 C 140 92 112 108 100 132 Z" fill={`url(#${rosaDer})`} opacity="0.85" />
          </>
        )}
        {/* Brazos / brote central */}
        <path d="M 100 130 C 92 110 70 95 65 76 C 80 82 95 102 100 130 Z" fill={`url(#${oro})`} />
        <path d="M 100 130 C 108 110 130 95 135 76 C 120 82 105 102 100 130 Z" fill={`url(#${oro})`} />
      </g>
    </svg>
  );
}

/** Isotipo + nombre "Refugio PAS" debajo, para recordar en qué espacio está la persona. */
export function LogoConNombre({ size = 44 }: { size?: number }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <Logo size={size} />
      <span className="text-[12px] font-semibold leading-none tracking-[0.04em] text-[var(--accent-ink)] [font-family:var(--font-display)]">
        Refugio PAS
      </span>
    </div>
  );
}

/** Logo oficial de Refugio PAS (imagen elegida por el usuario, 2026-10-14): círculo dorado con
    techo-refugio, figura, corazón, pétalos y el nombre. Ya incluye las letras: no repetir el nombre al lado. */
export function LogoMarca({ size = 72, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-refugio-pas.png"
      alt="Refugio PAS"
      width={size}
      height={size}
      sizes={`${size}px`}
      className={`shrink-0 ${className ?? ''}`}
    />
  );
}

'use client';

// Hábitos — checklist diario de los 3 rituales del MVP (ver ESTADO.md). Persistencia local
// (localStorage) por fecha: el check se resetea cada día — sin backend todavía (Sesión 6).

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { RachaCard } from '@/components/app-interna/RachaCard';
import { AppShell, Card, ScreenTitle } from '@/components/app-interna/ui';
import { Celebracion } from '@/components/app-interna/Celebracion';
import { HABITOS, PERFIL_DEMO } from '@/lib/app-demo-data';

function hoyKey() {
  return `refugio-habitos-${new Date().toISOString().slice(0, 10)}`;
}

function hitosKey() {
  return `refugio-hitos-${new Date().toISOString().slice(0, 10)}`;
}

// Gratificación escalonada: 3 hábitos ya suman el día a la racha; 4 y 5 la hacen más grande.
const HITOS: Record<number, { etiqueta: string; titulo: string; mensaje: string }> = {
  3: { etiqueta: 'Bien hecho', titulo: '¡Tu día ya suma a tu racha!', mensaje: 'Con 3 hábitos te cuidaste hoy. Cada paso cuenta.' },
  4: { etiqueta: 'Excelente', titulo: '¡4 de 5 hábitos, qué constancia!', mensaje: 'Estás cuidándote de verdad. Solo te falta uno.' },
  5: { etiqueta: 'Felicitaciones', titulo: '¡Completaste tus hábitos de hoy!', mensaje: 'Hoy elegiste cuidarte. Tu constancia es tu fuerza.' },
};
const MINIMO_RACHA = 3;

export default function HabitosPage() {
  const [hechos, setHechos] = useState<Record<string, boolean>>({});
  const [hito, setHito] = useState<number>(5);
  const [abierto, setAbierto] = useState(false);
  const [hitosVistos, setHitosVistos] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(hoyKey());
      if (raw) setHechos(JSON.parse(raw));
      const vistos = localStorage.getItem(hitosKey());
      if (vistos) setHitosVistos(JSON.parse(vistos));
    } catch {
      /* sin datos guardados hoy: arranca en cero */
    }
  }, []);

  // La celebración se dispara solo en el MOMENTO en que se completa el último hábito del día
  // (no al abrir la pantalla con todo ya hecho): es un hito real, no decoración.
  const toggle = (id: string) => {
    const next = { ...hechos, [id]: !hechos[id] };
    setHechos(next);
    try {
      localStorage.setItem(hoyKey(), JSON.stringify(next));
    } catch {
      /* localStorage puede fallar en modo privado — no bloquea la interacción */
    }
    // Gratificación escalonada: al llegar a 3, a 4 y a 5 hábitos (cada hito una sola vez por día).
    const antes = HABITOS.filter((h) => hechos[h.id]).length;
    const ahora = HABITOS.filter((h) => next[h.id]).length;
    if (ahora > antes && HITOS[ahora] && !hitosVistos.includes(ahora)) {
      const vistos = [...hitosVistos, ahora];
      setHitosVistos(vistos);
      try {
        localStorage.setItem(hitosKey(), JSON.stringify(vistos));
      } catch {
        /* sin guardado: el hito se vuelve a celebrar solo si recarga */
      }
      setHito(ahora);
      setAbierto(true);
    }
  };

  const completados = HABITOS.filter((h) => hechos[h.id]).length;
  const textoHito = HITOS[hito];

  return (
    <AppShell>
      <ScreenTitle subtitulo={`${completados} de ${HABITOS.length} hoy · con ${MINIMO_RACHA} ya sumas a tu racha. Selecciona cada uno al realizarlo.`}>
        Tus Hábitos Saludables
      </ScreenTitle>

      <RachaCard racha={PERFIL_DEMO.racha} mejor={PERFIL_DEMO.mejorRacha} hoyHecho={completados >= MINIMO_RACHA} />

      <div className="flex flex-col gap-3">
        {HABITOS.map((h) => {
          const Icono = h.icon;
          const hecho = !!hechos[h.id];
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => toggle(h.id)}
              aria-pressed={hecho}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-[var(--radius-card)]"
            >
              <Card
                className={`flex items-center gap-4 p-4 text-left transition-colors duration-150 ${
                  hecho ? 'bg-[color-mix(in_oklab,var(--accent)_6%,var(--surface))]' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border ${
                    hecho
                      ? 'border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)]'
                      : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)]'
                  }`}
                >
                  <Icono size={20} strokeWidth={1.8} color={hecho ? 'var(--accent)' : 'var(--text-secondary)'} aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className={`text-[15px] font-semibold ${hecho ? 'text-[var(--text-primary)] line-through decoration-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                    {h.nombre}
                  </p>
                  <p className="text-[13px] text-[var(--text-tertiary)]">{h.horaLabel}</p>
                </div>
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                    hecho ? 'bg-[var(--accent)]' : 'border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)]'
                  }`}
                >
                  {hecho && <Check size={14} strokeWidth={2.5} color="var(--bg)" aria-hidden="true" />}
                </span>
              </Card>
            </button>
          );
        })}
      </div>

      <Celebracion
        abierta={abierto}
        onCerrar={() => setAbierto(false)}
        etiqueta={textoHito.etiqueta}
        titulo={textoHito.titulo}
        mensaje={textoHito.mensaje}
      />
    </AppShell>
  );
}

'use client';

// Hábitos — checklist diario de los 3 rituales del MVP (ver ESTADO.md). Persistencia local
// (localStorage) por fecha: el check se resetea cada día — sin backend todavía (Sesión 6).

import { useEffect, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { HabitosPropios } from '@/components/app-interna/HabitosPropios';
import { RachaCard } from '@/components/app-interna/RachaCard';
import { AppShell, Card, ScreenTitle } from '@/components/app-interna/ui';
import { Celebracion } from '@/components/app-interna/Celebracion';
import { HABITOS } from '@/lib/app-demo-data';
import { useFechaHoy } from '@/lib/useFechaHoy';
import { guardarDiaEnNube, sincronizarHabitos } from '@/lib/habitos-nube';
import { MINIMO_RACHA, calcularRacha, claveHabitos, claveHitos, fechaLocal, type ResumenRacha } from '@/lib/racha';

function hoyKey() {
  return claveHabitos(fechaLocal());
}

function hitosKey() {
  return claveHitos(fechaLocal());
}

// Gratificación escalonada (hoy 6 hábitos recomendados): desde el 4.º ya hay felicitación y el día
// suma a la racha; el 5.º y el 6.º la hacen más grande.
const TOTAL = HABITOS.length;
const HITOS: Record<number, { etiqueta: string; titulo: string; mensaje: string }> = {
  [MINIMO_RACHA]: { etiqueta: 'Bien hecho', titulo: '¡Tu día ya suma a tu racha!', mensaje: `Con ${MINIMO_RACHA} hábitos te cuidaste hoy. Cada paso cuenta.` },
  [TOTAL - 1]: { etiqueta: 'Excelente', titulo: `¡${TOTAL - 1} de ${TOTAL} hábitos, qué constancia!`, mensaje: 'Estás cuidándote de verdad. Solo te falta uno.' },
  [TOTAL]: { etiqueta: 'Felicitaciones', titulo: '¡Completaste tus hábitos de hoy!', mensaje: 'Hoy elegiste cuidarte. Tu constancia es tu fuerza.' },
};

export default function HabitosPage() {
  const [hechos, setHechos] = useState<Record<string, boolean>>({});
  const [hito, setHito] = useState<number>(5);
  const [abierto, setAbierto] = useState(false);
  const [hitosVistos, setHitosVistos] = useState<number[]>([]);
  const [racha, setRacha] = useState<ResumenRacha>({ actual: 0, mejor: 0, semana: Array(7).fill(false) });
  const [version, setVersion] = useState(0);

  // Los hábitos de HOY. Se vuelven a leer cada vez que cambia el día (también si la app quedó abierta
  // en segundo plano toda la noche): los checks de ayer no pasan a hoy.
  const hoy = useFechaHoy();

  // Al abrir (y al cambiar de día) se sincroniza con la cuenta: recupera el historial si se reinstaló la app.
  useEffect(() => {
    if (!hoy) return;
    sincronizarHabitos().then((cambio) => {
      if (cambio) setVersion((v) => v + 1);
    });
  }, [hoy]);

  useEffect(() => {
    if (!hoy) return;
    let guardados: Record<string, boolean> = {};
    let vistos: number[] = [];
    try {
      const raw = localStorage.getItem(claveHabitos(hoy));
      if (raw) guardados = JSON.parse(raw);
      const rawVistos = localStorage.getItem(claveHitos(hoy));
      if (rawVistos) vistos = JSON.parse(rawVistos);
    } catch {
      /* sin datos guardados hoy: arranca en cero */
    }
    setHechos(guardados);
    setHitosVistos(vistos);
    setAbierto(false);
  }, [hoy, version]);

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
    void guardarDiaEnNube(fechaLocal(), next); // copia en la cuenta (si no hay internet, sube después)
    // Gratificación escalonada: al llegar al 4.º, 5.º y 6.º hábito (cada hito una sola vez por día).
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

  // La racha se recalcula con los días reales cada vez que cambian los hábitos de hoy.
  useEffect(() => {
    setRacha(calcularRacha(HABITOS.map((h) => h.id), new Date(), hechos));
  }, [hechos, hoy, version]);

  const completados = HABITOS.filter((h) => hechos[h.id]).length;
  const textoHito = HITOS[hito];

  return (
    <AppShell>
      <ScreenTitle subtitulo={`${completados} de ${HABITOS.length} hoy · con ${MINIMO_RACHA} ya sumas a tu racha. Selecciona cada uno al realizarlo.`}>
        Tus Hábitos Saludables
      </ScreenTitle>

      <RachaCard racha={racha.actual} mejor={racha.mejor} semana={racha.semana} hoyHecho={completados >= MINIMO_RACHA} />

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
                <Lock size={14} strokeWidth={1.8} color="var(--text-tertiary)" aria-label="Recomendado por Refugio PAS, no se puede editar" className="shrink-0" />
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

      <HabitosPropios hechos={hechos} onToggle={toggle} nombresRecomendados={HABITOS.map((h) => h.nombre)} />

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

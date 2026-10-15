'use client';

// Diario — registro de journaling + historial de ánimo. Persistencia local (localStorage),
// arranca con 3 entradas de ejemplo (32: "la app nunca se enseña vacía") + lo que el usuario
// escriba se guarda encima, más reciente primero.

import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';
import { AppShell, Card, EmptyState, MoodPicker, ScreenTitle } from '@/components/app-interna/ui';
import { ANIMOS, DIARIO_SEED, type Animo, type EntradaDiario } from '@/lib/app-demo-data';

const FECHA_FMT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

function formatearFecha(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return 'Hoy';
  if (d.toDateString() === ayer.toDateString()) return 'Ayer';
  return FECHA_FMT.format(d);
}

export default function DiarioPage() {
  const [entradas, setEntradas] = useState<EntradaDiario[]>(DIARIO_SEED);
  const [animo, setAnimo] = useState<Animo | null>(null);
  const [intensidad, setIntensidad] = useState(5);
  const [texto, setTexto] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('refugio-diario');
      if (raw) setEntradas([...(JSON.parse(raw) as EntradaDiario[]), ...DIARIO_SEED]);
    } catch {
      /* sin entradas propias guardadas: se muestran solo las de ejemplo */
    }
    try {
      const prompt = sessionStorage.getItem('refugio-diario-prompt');
      if (prompt) {
        setTexto(`${prompt}\n`);
        sessionStorage.removeItem('refugio-diario-prompt');
      }
    } catch {
      /* sin prompt precargado: el diario abre en blanco igual */
    }
  }, []);

  const guardar = () => {
    if (!animo || texto.trim().length === 0) return;
    const nueva: EntradaDiario = { id: `local-${Date.now()}`, fecha: new Date().toISOString(), animo, intensidad, texto: texto.trim() };
    setEntradas((prev) => [nueva, ...prev]);
    try {
      const raw = localStorage.getItem('refugio-diario');
      const propias = raw ? (JSON.parse(raw) as EntradaDiario[]) : [];
      localStorage.setItem('refugio-diario', JSON.stringify([nueva, ...propias]));
    } catch {
      /* localStorage puede fallar en modo privado — la entrada queda igual en esta sesión */
    }
    setAnimo(null);
    setIntensidad(5);
    setTexto('');
  };

  const pctIntensidad = ((intensidad - 1) / 9) * 100;

  return (
    <AppShell>
      <ScreenTitle subtitulo="Un espacio para lo que sientes, sin juzgarte">Tu diario</ScreenTitle>

      <Card className="p-5">
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">¿Cómo te sientes ahora?</p>
        <div className="mt-3">
          <MoodPicker opciones={ANIMOS} seleccion={animo} onSelect={(v) => setAnimo(v as Animo)} />
        </div>

        <div className="mt-5">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">Intensidad (1 a 10)</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[12px] text-[var(--text-tertiary)]">1</span>
            <input
              type="range"
              min={1}
              max={10}
              value={intensidad}
              onChange={(e) => setIntensidad(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, var(--accent) ${pctIntensidad}%, color-mix(in oklab, var(--text-tertiary) 15%, transparent) ${pctIntensidad}%)`,
              }}
              aria-label={`Intensidad: ${intensidad} de 10`}
            />
            <span className="text-[12px] text-[var(--text-tertiary)]">10</span>
          </div>
          <p className="mt-2 text-center text-[14px] font-semibold text-[var(--accent-ink)]">{intensidad}</p>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe lo que viviste hoy, sin juzgarlo…"
          rows={3}
          className="mt-4 w-full resize-none rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)] bg-[var(--bg)] p-3 text-[14px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        />
        <button
          type="button"
          onClick={guardar}
          disabled={!animo || texto.trim().length === 0}
          className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] text-[14px] font-semibold outline-none transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] ${
            !animo || texto.trim().length === 0
              ? 'cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-tertiary)]'
              : 'bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] text-[var(--text-primary)] hover:bg-[color-mix(in_oklab,var(--accent-cta)_90%,white)]'
          }`}
        >
          <PenLine size={16} aria-hidden="true" /> Guardar entrada
        </button>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {entradas.length === 0 ? (
          <EmptyState icon={PenLine} titulo="Todavía no escribiste nada. Cuando lo hagas, aparecerá aquí." />
        ) : (
          entradas.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--accent-ink)]">{e.animo}</span>
                <span className="text-[12px] text-[var(--text-tertiary)]">{formatearFecha(e.fecha)}</span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-primary)]">{e.texto}</p>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}

'use client';

// Diario — registro de journaling + historial de ánimo e intensidad. Persistencia local (localStorage),
// arranca con 3 entradas de ejemplo (32: "la app nunca se enseña vacía") + lo que el usuario
// escriba se guarda encima, más reciente primero. La intensidad de cada entrada SE VE en el historial
// y en el gráfico de la semana; el borrador (ánimo, intensidad y texto) no se pierde al salir.

import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';
import { ANIMO_EMOJI, AppShell, Card, EmptyState, MoodPicker, ScreenTitle } from '@/components/app-interna/ui';
import { ANIMOS, DIARIO_SEED, type Animo, type EntradaDiario } from '@/lib/app-demo-data';
import { fechaLocal } from '@/lib/racha';
import { guardarAnimo, leerRegistros, type RegistroAnimo } from '@/lib/animo';
import { useFechaHoy } from '@/lib/useFechaHoy';
import { sincronizarTodo, subirEntradaDiario } from '@/lib/datos-nube';

const CLAVE_BORRADOR = 'refugio-diario-borrador';
const LETRAS_DIA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Intensidad y ánimo de cada uno de los últimos 7 días. Sale del ánimo que la persona elige (se refleja
 * al instante, sin necesidad de escribir) y, para días anteriores a esa función, de las entradas guardadas.
 */
function intensidadSemana(entradas: EntradaDiario[], registros: Record<string, RegistroAnimo>) {
  const porDia = new Map<string, { valor: number; animo: Animo }>();
  [...entradas]
    .filter((e) => e.id.startsWith('local-') && typeof e.intensidad === 'number')
    .sort((x, y) => x.fecha.localeCompare(y.fecha))
    .forEach((e) => porDia.set(fechaLocal(new Date(e.fecha)), { valor: e.intensidad as number, animo: e.animo }));
  Object.entries(registros).forEach(([fecha, r]) => porDia.set(fecha, { valor: r.intensidad, animo: r.animo }));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dato = porDia.get(fechaLocal(d));
    return {
      letra: LETRAS_DIA[d.getDay()],
      nombre: NOMBRES_DIA[d.getDay()],
      valor: dato?.valor ?? null,
      animo: dato?.animo ?? null,
      hoy: i === 6,
    };
  });
}

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
  const [guardada, setGuardada] = useState(false);
  const [diaElegido, setDiaElegido] = useState<number | null>(null);
  const [borradorListo, setBorradorListo] = useState(false);
  const [registros, setRegistros] = useState<Record<string, RegistroAnimo>>({});
  const hoy = useFechaHoy();
  const [version, setVersion] = useState(0);

  // Recupera de la cuenta las entradas y el ánimo que falten en este celular (por ejemplo, tras reinstalar).
  useEffect(() => {
    if (!hoy) return;
    sincronizarTodo().then((cambio) => {
      if (cambio) setVersion((v) => v + 1);
    });
  }, [hoy]);

  // Al abrir y cada vez que cambia el día: entradas, ánimo de la semana y borrador de HOY
  // (el borrador y el ánimo de ayer no pasan a hoy).
  useEffect(() => {
    if (!hoy) return;
    try {
      const raw = localStorage.getItem('refugio-diario');
      if (raw) setEntradas([...(JSON.parse(raw) as EntradaDiario[]), ...DIARIO_SEED]);
    } catch {
      /* sin entradas propias guardadas: se muestran solo las de ejemplo */
    }
    const registrosHoy = leerRegistros();
    setRegistros(registrosHoy);
    setDiaElegido(null);

    let animoInicial: Animo | null = registrosHoy[hoy]?.animo ?? null;
    let intensidadInicial = registrosHoy[hoy]?.intensidad ?? 5;
    let textoInicial = '';
    try {
      const b = localStorage.getItem(CLAVE_BORRADOR);
      if (b) {
        const d = JSON.parse(b) as { fecha?: string; animo: Animo | null; intensidad: number; texto: string };
        if (d.fecha === hoy) {
          if (d.animo) animoInicial = d.animo;
          if (typeof d.intensidad === 'number') intensidadInicial = Math.min(10, Math.max(1, d.intensidad));
          if (d.texto) textoInicial = d.texto;
        } else {
          localStorage.removeItem(CLAVE_BORRADOR);
        }
      }
    } catch {
      /* sin borrador guardado */
    }
    setAnimo(animoInicial);
    setIntensidad(intensidadInicial);
    setTexto(textoInicial);
    setBorradorListo(true);
    try {
      const prompt = sessionStorage.getItem('refugio-diario-prompt');
      if (prompt) {
        setTexto(`${prompt}\n`);
        sessionStorage.removeItem('refugio-diario-prompt');
      }
    } catch {
      /* sin prompt precargado: el diario abre en blanco igual */
    }
  }, [hoy, version]);

  // El borrador se guarda solo mientras la persona escribe o mueve la escala.
  useEffect(() => {
    if (!borradorListo) return;
    try {
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ fecha: fechaLocal(), animo, intensidad, texto }));
    } catch {
      /* modo privado: el borrador queda solo en esta sesión */
    }
  }, [animo, intensidad, texto, borradorListo]);

  // Elegir el ánimo o mover la escala se refleja al instante en el gráfico (no hace falta escribir ni guardar).
  const elegirAnimo = (v: Animo) => {
    setAnimo(v);
    guardarAnimo(v, intensidad);
    setRegistros(leerRegistros());
  };
  const cambiarIntensidad = (n: number) => {
    setIntensidad(n);
    if (animo) {
      guardarAnimo(animo, n);
      setRegistros(leerRegistros());
    }
  };

  const guardar = () => {
    if (!animo || texto.trim().length === 0) return;
    guardarAnimo(animo, intensidad);
    setRegistros(leerRegistros());
    const nueva: EntradaDiario = { id: `local-${Date.now()}`, fecha: new Date().toISOString(), animo, intensidad, texto: texto.trim() };
    setEntradas((prev) => [nueva, ...prev]);
    try {
      const raw = localStorage.getItem('refugio-diario');
      const propias = raw ? (JSON.parse(raw) as EntradaDiario[]) : [];
      localStorage.setItem('refugio-diario', JSON.stringify([nueva, ...propias]));
    } catch {
      /* localStorage puede fallar en modo privado — la entrada queda igual en esta sesión */
    }
    void subirEntradaDiario(nueva); // copia en la cuenta (si no hay internet, sube después)
    setAnimo(null);
    setIntensidad(5);
    setTexto('');
    try {
      localStorage.removeItem(CLAVE_BORRADOR);
    } catch {
      /* nada que borrar */
    }
    setGuardada(true);
    setTimeout(() => setGuardada(false), 4000);
  };

  const semana = intensidadSemana(entradas, registros);
  const hayDatosSemana = semana.some((d) => d.valor !== null);

  const pctIntensidad = ((intensidad - 1) / 9) * 100;

  return (
    <AppShell>
      <ScreenTitle subtitulo="Un espacio para lo que sientes, sin juzgarte">Tu diario</ScreenTitle>

      <Card className="p-5">
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">¿Cómo te sientes ahora?</p>
        <div className="mt-3">
          <MoodPicker opciones={ANIMOS} seleccion={animo} onSelect={(v) => elegirAnimo(v as Animo)} />
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
              onChange={(e) => cambiarIntensidad(Number(e.target.value))}
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

      {guardada && (
        <p role="status" className="mt-3 rounded-[var(--radius-button)] bg-[var(--chip-bg)] px-4 py-3 text-center text-[14px] font-medium text-[var(--accent-ink)]">
          Entrada guardada. Puedes verla abajo, con su intensidad.
        </p>
      )}

      <Card className="mt-6 p-5">
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">Tu intensidad esta semana</p>
        {hayDatosSemana ? (
          <>
            <div className="mt-4 flex items-end justify-between gap-2">
              {semana.map((d, i) => {
                const elegido = (diaElegido ?? semana.length - 1) === i && d.valor !== null;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={d.valor === null}
                    onClick={() => setDiaElegido(i)}
                    aria-pressed={elegido}
                    aria-label={d.valor === null ? `${d.nombre}: sin registro` : `${d.nombre}: ${d.animo}, intensidad ${d.valor} de 10`}
                    className="flex min-h-11 flex-1 flex-col items-center gap-1.5 rounded-[var(--radius-button)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-default"
                  >
                    <span className="text-[12px] font-semibold tabular-nums text-[var(--accent-ink)]">{d.valor ?? ''}</span>
                    <span className="flex h-20 w-full items-end justify-center">
                      {d.valor !== null ? (
                        <span
                          className={`block w-full max-w-7 rounded-t-[8px] bg-gradient-to-t from-[var(--logo-rosa-2)] to-[var(--accent)] transition-opacity duration-150 ${elegido ? 'opacity-100 ring-2 ring-[var(--accent-ink)]' : 'opacity-70'}`}
                          style={{ height: `${d.valor * 10}%` }}
                        />
                      ) : (
                        <span className="block size-1.5 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)]" />
                      )}
                    </span>
                    <span className={`text-[12px] ${d.hoy ? 'font-semibold text-[var(--accent-ink)]' : 'text-[var(--text-tertiary)]'}`}>{d.letra}</span>
                  </button>
                );
              })}
            </div>
            {(() => {
              const i = diaElegido ?? semana.length - 1;
              const d = semana[i];
              if (!d || d.valor === null || !d.animo) {
                return <p className="mt-3 text-center text-[13px] text-[var(--text-secondary)]">Toca una barra para ver cómo te sentías ese día.</p>;
              }
              return (
                <p role="status" aria-live="polite" className="mt-3 flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--chip-bg)] px-3 py-2 text-[14px] text-[var(--text-primary)]">
                  <span aria-hidden="true" className="text-[24px] leading-none">{ANIMO_EMOJI[ANIMOS.indexOf(d.animo)]}</span>
                  <span>
                    <span className="capitalize">{d.hoy ? 'Hoy' : d.nombre}</span>: <strong>{d.animo}</strong> · Intensidad {d.valor}/10
                  </span>
                </p>
              );
            })()}
          </>
        ) : (
          <p className="mt-2 text-[13px] leading-snug text-[var(--text-secondary)]">
            Cuando guardes tu primera entrada, aquí verás cómo cambia la intensidad de tus emociones día a día.
          </p>
        )}
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {entradas.length === 0 ? (
          <EmptyState icon={PenLine} titulo="Todavía no escribiste nada. Cuando lo hagas, aparecerá aquí." />
        ) : (
          entradas.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--accent-ink)]">
                  {e.animo}
                  {typeof e.intensidad === 'number' && <span className="ml-2 normal-case tracking-normal text-[var(--text-secondary)]">· Intensidad {e.intensidad}/10</span>}
                </span>
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

'use client';

// "Mis hábitos": la persona agrega hasta 3 propios. Los recomendados por Refugio PAS NO se editan ni
// se borran (solo estos). No cuentan para la racha ni para los hitos de 3/4/5: esos miden los
// hábitos recomendados. Persistencia local por ahora (Sesión 6 los pasa a la cuenta).

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/app-interna/ui';

interface HabitoPropio {
  id: string;
  nombre: string;
}

const CLAVE = 'refugio-habitos-propios';
const MAXIMO = 3;
const LARGO = 40;

export function HabitosPropios({
  hechos,
  onToggle,
  nombresRecomendados,
}: {
  hechos: Record<string, boolean>;
  onToggle: (id: string) => void;
  nombresRecomendados: string[];
}) {
  const reduce = useReducedMotion() ?? false;
  const [lista, setLista] = useState<HabitoPropio[]>([]);
  const [cargado, setCargado] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [quitando, setQuitando] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) setLista((JSON.parse(raw) as HabitoPropio[]).slice(0, MAXIMO));
    } catch {
      /* sin hábitos propios guardados */
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (agregando) campo.current?.focus();
  }, [agregando]);

  const guardar = (siguiente: HabitoPropio[]) => {
    setLista(siguiente);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    } catch {
      /* modo privado: queda en esta sesión */
    }
  };

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    if (lista.length >= MAXIMO) return;
    const nombre = texto.trim().replace(/\s+/g, ' ');
    if (!nombre) {
      setError('Escribe cómo se llama tu hábito.');
      return;
    }
    const igual = (n: string) => n.toLowerCase() === nombre.toLowerCase();
    if (lista.some((h) => igual(h.nombre)) || nombresRecomendados.some(igual)) {
      setError('Ya tienes un hábito con ese nombre.');
      return;
    }
    guardar([...lista, { id: `p-${Date.now().toString(36)}`, nombre }]);
    setTexto('');
    setError('');
    setAgregando(false);
  };

  const quitar = (id: string) => {
    guardar(lista.filter((h) => h.id !== id));
    setQuitando(null);
  };

  if (!cargado) return null;
  const hechosPropios = lista.filter((h) => hechos[h.id]).length;

  return (
    <section aria-labelledby="mis-habitos" className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="mis-habitos" className="text-[20px] font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
          Mis hábitos
        </h2>
        {lista.length > 0 && (
          <span className="text-[13px] text-[var(--text-secondary)]">
            {hechosPropios} de {lista.length} hoy
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {lista.map((h) => {
            const hecho = !!hechos[h.id];
            return (
              <motion.div
                key={h.id}
                layout={!reduce}
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className={`flex flex-wrap items-center gap-x-2 pr-2 ${hecho ? 'bg-[color-mix(in_oklab,var(--accent)_6%,var(--surface))]' : ''}`}>
                  <button
                    type="button"
                    onClick={() => onToggle(h.id)}
                    aria-pressed={hecho}
                    className="flex min-w-0 flex-1 items-center gap-4 rounded-[var(--radius-card)] p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border ${
                        hecho
                          ? 'border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)]'
                      }`}
                    >
                      <Sparkles size={20} strokeWidth={1.8} color={hecho ? 'var(--accent)' : 'var(--text-secondary)'} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block break-words text-[15px] font-semibold text-[var(--text-primary)] ${
                          hecho ? 'line-through decoration-[var(--accent)]' : ''
                        }`}
                      >
                        {h.nombre}
                      </span>
                      <span className="block text-[13px] text-[var(--text-tertiary)]">Hábito tuyo</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                        hecho ? 'bg-[var(--accent)]' : 'border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)]'
                      }`}
                    >
                      {hecho && <Check size={14} strokeWidth={2.5} color="var(--bg)" aria-hidden="true" />}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuitando(quitando === h.id ? null : h.id)}
                    aria-label={`Quitar el hábito ${h.nombre}`}
                    aria-expanded={quitando === h.id}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full outline-none hover:bg-[var(--chip-bg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <Trash2 size={18} strokeWidth={1.8} color="var(--text-tertiary)" aria-hidden="true" />
                  </button>
                  {quitando === h.id && (
                    <div className="flex basis-full items-center justify-between gap-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_14%,transparent)] py-1 pl-4">
                      <span className="text-[14px] text-[var(--text-secondary)]">¿Quitar este hábito?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => quitar(h.id)}
                          className="min-h-11 rounded-[var(--radius-button)] px-3 text-[14px] font-semibold text-[var(--accent-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        >
                          Sí, quitar
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuitando(null)}
                          className="min-h-11 rounded-[var(--radius-button)] px-3 text-[14px] text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {agregando ? (
          <form onSubmit={agregar} className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
            <label htmlFor="habito-nuevo" className="text-[14px] font-semibold text-[var(--text-primary)]">
              ¿Qué hábito quieres sumar?
            </label>
            <input
              id="habito-nuevo"
              ref={campo}
              value={texto}
              maxLength={LARGO}
              onChange={(e) => {
                setTexto(e.target.value);
                setError('');
              }}
              placeholder="Ej: Caminar 10 minutos"
              className="mt-2 h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-4 text-[16px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
            {error && (
              <p role="alert" className="mt-2 text-[13px] text-[var(--accent-ink)]">
                {error}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="flex h-12 flex-1 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[15px] font-semibold text-[var(--text-primary)] ring-1 ring-inset ring-[var(--accent-ink)] outline-none focus-visible:ring-2"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgregando(false);
                  setTexto('');
                  setError('');
                }}
                className="h-12 rounded-[var(--radius-button)] px-4 text-[15px] font-medium text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : lista.length < MAXIMO ? (
          <button
            type="button"
            onClick={() => setAgregando(true)}
            className="flex min-h-14 items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[color-mix(in_oklab,var(--accent)_40%,transparent)] px-4 py-3 text-[15px] font-semibold text-[var(--accent-ink)] outline-none hover:bg-[var(--chip-bg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
            {lista.length === 0 ? 'Agregar un hábito tuyo' : 'Agregar otro hábito'}
          </button>
        ) : (
          <p className="text-center text-[13px] text-[var(--text-secondary)]">
            Llegaste al máximo de {MAXIMO} hábitos propios. Quita uno para sumar otro.
          </p>
        )}
      </div>

      <p className="mt-3 text-[13px] leading-snug text-[var(--text-secondary)]">
        Tus hábitos son solo para ti. Los recomendados de arriba son los que suman a tu racha.
      </p>
    </section>
  );
}

'use client';

// "¿Cómo te sientes ahora?" — aparece al terminar el audio del Orbe. Compara el ánimo de ANTES de la
// sesión con el de AHORA y se lo devuelve a la persona con calidez ("pasaste de Tenso/a a Tranquilo/a").
// Sin IA y sin diagnóstico: es solo su propio registro. Guarda cada cambio en el teléfono
// (`refugio-cambios-animo`) para poder mostrar su semana más adelante.

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Headphones } from 'lucide-react';
import { ANIMO_EMOJI, MoodPicker } from '@/components/app-interna/ui';
import { Hairline } from '@/components/landing/ui';
import { ANIMOS, type Animo } from '@/lib/app-demo-data';

const CLAVE = 'refugio-cambios-animo';
const MAXIMO_REGISTROS = 60;

function guardarCambio(antes: Animo | null, despues: Animo) {
  try {
    const previos = JSON.parse(localStorage.getItem(CLAVE) ?? '[]') as unknown[];
    const nuevos = [...previos, { fecha: new Date().toISOString(), antes, despues }].slice(-MAXIMO_REGISTROS);
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    /* sin guardado: el mensaje se muestra igual */
  }
}

export function DespuesDeSesion({
  antes,
  onElegir,
}: {
  /** Ánimo que tenía al empezar la sesión (null si todavía no había marcado ninguno hoy). */
  antes: Animo | null;
  /** Para actualizar el "ánimo de hoy" de Inicio con el de ahora. */
  onElegir: (a: Animo) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [despues, setDespues] = useState<Animo | null>(null);

  const elegir = (a: string) => {
    const animo = a as Animo;
    setDespues(animo);
    guardarCambio(antes, animo);
    onElegir(animo);
  };

  const iAntes = antes ? ANIMOS.indexOf(antes) : -1;
  const iDespues = despues ? ANIMOS.indexOf(despues) : -1;
  const delta = iAntes >= 0 && iDespues >= 0 ? iDespues - iAntes : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mt-5"
    >
      <Hairline emphasis surface="surface" className="shadow-[var(--shadow-2)]">
        <div className="p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-ink)]">Sesión completada</p>
          <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
            ¿Cómo te sientes ahora?
          </p>
          <div className="mt-4">
            <MoodPicker opciones={ANIMOS} seleccion={despues} onSelect={elegir} />
          </div>

          {despues && (
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : 0.2 }}
              className="mt-5 rounded-[var(--radius-card)] bg-[var(--chip-bg)] p-4 text-center"
              role="status"
              aria-live="polite"
            >
              {antes && (
                <div className="flex items-center justify-center gap-3" aria-hidden="true">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[var(--surface)] text-[24px] shadow-[var(--shadow-1)]">
                    {ANIMO_EMOJI[iAntes]}
                  </span>
                  <ArrowRight size={18} color="var(--accent-ink)" />
                  <span className="flex size-12 items-center justify-center rounded-full bg-[var(--surface)] text-[24px] shadow-[var(--shadow-1)]">
                    {ANIMO_EMOJI[iDespues]}
                  </span>
                </div>
              )}
              <p className="mt-3 text-[15px] leading-snug text-[var(--text-primary)]">
                {delta === null
                  ? `Registramos que ahora estás ${despues}. Si marcas cómo te sentías antes de empezar, la próxima vez te mostramos tu cambio.`
                  : delta > 0
                    ? `Pasaste de ${antes} a ${despues}. Tu cuerpo lo notó: ese alivio es tuyo.`
                    : delta === 0
                      ? `Sigues en ${despues}. A veces el alivio se nota más con la práctica de cada día.`
                      : `Gracias por registrarlo con sinceridad. Hoy tu cuerpo pide más calma: repite la sesión o prueba otro audio.`}
              </p>
              {delta !== null && delta < 0 && (
                <Link
                  href="/app/biblioteca"
                  className="mt-3 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-button)] px-3 text-[14px] font-semibold text-[var(--accent-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <Headphones size={16} aria-hidden="true" /> Ver la Biblioteca
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </Hairline>
    </motion.div>
  );
}

'use client';

// Piezas de "app instalable y sin conexión": registro del service worker, aviso de conexión
// y tarjeta para instalar en la pantalla de inicio.

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { Hairline } from '@/components/landing/ui';

/** Registra el service worker (solo en producción, para no estorbar al desarrollar). */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* sin service worker la app funciona igual, solo que no sin conexión */
    });
  }, []);
  return null;
}

/** Aviso tranquilo cuando se pierde la conexión: el Orbe S.O.S. sigue funcionando. */
export function AvisoConexion() {
  const [sinConexion, setSinConexion] = useState(false);
  useEffect(() => {
    const actualizar = () => setSinConexion(!navigator.onLine);
    actualizar();
    window.addEventListener('online', actualizar);
    window.addEventListener('offline', actualizar);
    return () => {
      window.removeEventListener('online', actualizar);
      window.removeEventListener('offline', actualizar);
    };
  }, []);
  if (!sinConexion) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-[var(--chip-bg)] px-4 py-2 text-center text-[13px] font-medium text-[var(--text-primary)] backdrop-blur"
    >
      <WifiOff size={16} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />
      Estás sin conexión. Tu Orbe S.O.S. sigue funcionando.
    </div>
  );
}

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CLAVE_DESCARTE = 'refugio-instalar-descartado';
const DIAS_DESCARTE = 14;

/** Tarjeta "Ten tu Refugio a un toque": botón en Android/Chrome, pasos en iPhone. Se oculta si ya está instalada. */
export function InstalarApp({ siempre = false }: { siempre?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [esIOS, setEsIOS] = useState(false);
  const [instalada, setInstalada] = useState(true);
  const [descartada, setDescartada] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    setEsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    try {
      const t = Number(localStorage.getItem(CLAVE_DESCARTE) ?? 0);
      setDescartada(!siempre && !!t && Date.now() - t < DIAS_DESCARTE * 86400000);
    } catch {
      setDescartada(false);
    }
    const alPreguntar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    const alInstalar = () => setInstalada(true);
    window.addEventListener('beforeinstallprompt', alPreguntar);
    window.addEventListener('appinstalled', alInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', alPreguntar);
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, [siempre]);

  if (instalada || descartada || (!evento && !esIOS)) return null;

  const descartar = () => {
    setDescartada(true);
    try {
      localStorage.setItem(CLAVE_DESCARTE, String(Date.now()));
    } catch {
      /* sin guardado: reaparecerá en la próxima visita */
    }
  };

  const instalar = async () => {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === 'accepted') setInstalada(true);
    else descartar();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-5"
    >
      <Hairline surface="surface" className="shadow-[var(--shadow-1)]">
        <div className="relative p-5">
          {!siempre && (
            <button
              type="button"
              onClick={descartar}
              aria-label="Ahora no"
              className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full outline-none hover:bg-[var(--chip-bg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <X size={18} strokeWidth={1.8} color="var(--text-tertiary)" aria-hidden="true" />
            </button>
          )}
          <div className="flex items-start gap-3 pr-8">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
            >
              <Smartphone size={20} strokeWidth={1.8} color="var(--accent-ink)" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[var(--text-primary)]">Ten tu Refugio a un toque</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--text-secondary)]">
                Instálalo en tu pantalla de inicio: abre más rápido y tu Orbe S.O.S. funciona aunque no tengas internet.
              </p>
            </div>
          </div>

          {evento ? (
            <button
              type="button"
              onClick={instalar}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[15px] font-semibold text-[var(--text-primary)] ring-1 ring-inset ring-[var(--accent-ink)] outline-none focus-visible:ring-2"
            >
              <Download size={18} strokeWidth={1.8} aria-hidden="true" /> Instalar la app
            </button>
          ) : (
            <ol className="mt-4 flex flex-col gap-2 text-[14px] leading-snug text-[var(--text-primary)]">
              <li className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)] text-[12px] font-semibold text-[var(--accent-ink)]">1</span>
                <span>
                  Toca el botón <Share size={14} className="inline align-[-2px]" aria-label="Compartir" /> <strong>Compartir</strong> de Safari.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)] text-[12px] font-semibold text-[var(--accent-ink)]">2</span>
                <span>
                  Elige <strong>Añadir a pantalla de inicio</strong>.
                </span>
              </li>
            </ol>
          )}
        </div>
      </Hairline>
    </motion.div>
  );
}

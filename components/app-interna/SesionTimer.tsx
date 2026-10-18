'use client';

// Temporizador de sesión reutilizable (Orbe de Inicio, del onboarding y de la Biblioteca).
// Mockup HONESTO (19 §5.2) cuando NO se pasa `audioSrc`: el temporizador de respiración ES la
// experiencia. Con `audioSrc` se reproduce el audio real y el avance sigue al audio.
//
// Control (heurística 3 de Nielsen): tocar el Orbe en marcha lo PAUSA, tocarlo en pausa lo
// reanuda, y "Terminar sesión" siempre está a la vista. Si el audio falla se avisa con la
// solución ("toca el Orbe para reintentar") — nunca se traga el error en silencio.

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Headphones } from 'lucide-react';

type Estado = 'idle' | 'preparando' | 'activo' | 'pausado' | 'completo' | 'error';
const DURACION_PREPARACION = 3;
const DURACION_FASE = 4; // segundos por inhalación/exhalación

export function SesionTimer({
  duracionMin,
  onCompletar,
  onIniciar,
  tamano = 140,
  audioSrc,
  etiqueta,
  sinAvisoAudifonos = false,
}: {
  duracionMin: number;
  onCompletar?: () => void;
  /** Se avisa cuando la persona toca el Orbe para empezar (permite guardar su ánimo "antes"). */
  onIniciar?: () => void;
  /** Diámetro del Orbe en px — permite una versión más compacta (ej. en tarjetas). */
  tamano?: number;
  /** Audio real de la sesión (mp3). Si no se pasa, el temporizador simula la respiración. */
  audioSrc?: string;
  /** Rótulo corto sobre la duración, solo en reposo (ej. "AUDIO S.O.S."). */
  etiqueta?: string;
  /** Oculta la pastilla de audífonos cuando la pantalla ya da ese aviso con su propio texto. */
  sinAvisoAudifonos?: boolean;
}) {
  const reduce = useReducedMotion();
  const total = duracionMin * 60;
  const radio = tamano / 2 - 8;
  const interior = Math.round(tamano * 0.74);
  const grande = tamano >= 150;
  const [restante, setRestante] = useState(total);
  const [estado, setEstado] = useState<Estado>('idle');
  const [cuentaPreparacion, setCuentaPreparacion] = useState(DURACION_PREPARACION);
  const [fase, setFase] = useState<'inhala' | 'exhala'>('inhala');
  const completoRef = useRef(false);
  const reanudaRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Antesala: cuenta regresiva de 3s antes de empezar de verdad — le da tiempo a prepararse.
  useEffect(() => {
    if (estado !== 'preparando') return;
    if (cuentaPreparacion <= 0) {
      setEstado('activo');
      return;
    }
    const id = setTimeout(() => setCuentaPreparacion((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [estado, cuentaPreparacion]);

  // Ritmo de respiración: alterna inhala/exhala cada 4s mientras la sesión está activa.
  useEffect(() => {
    if (estado !== 'activo') return;
    setFase('inhala');
    const id = setInterval(() => {
      setFase((f) => (f === 'inhala' ? 'exhala' : 'inhala'));
    }, DURACION_FASE * 1000);
    return () => clearInterval(id);
  }, [estado]);

  // Con audio real: arranca desde cero al entrar en "activo" (o continúa si venía de pausa).
  useEffect(() => {
    if (!audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (estado === 'activo') {
      if (!reanudaRef.current) audio.currentTime = 0;
      reanudaRef.current = false;
      audio.play().catch(() => setEstado('error'));
    } else if (estado === 'pausado') {
      audio.pause();
    } else if (estado === 'idle' || estado === 'error') {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [estado, audioSrc]);

  useEffect(() => {
    if (!audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (Number.isFinite(audio.duration)) setRestante(Math.max(0, Math.ceil(audio.duration - audio.currentTime)));
    };
    const onEnded = () => {
      if (completoRef.current) return;
      completoRef.current = true;
      setRestante(0);
      setEstado('completo');
      onCompletar?.();
    };
    const onError = () => setEstado('error');
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [audioSrc, onCompletar]);

  // Sin audio real: el propio temporizador simula la sesión, segundo a segundo.
  useEffect(() => {
    if (audioSrc || estado !== 'activo' || restante <= 0) return;
    const id = setInterval(() => setRestante((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [audioSrc, estado, restante]);

  useEffect(() => {
    if (audioSrc) return;
    if (restante === 0 && estado === 'activo' && !completoRef.current) {
      completoRef.current = true;
      setEstado('completo');
      onCompletar?.();
    }
  }, [audioSrc, restante, estado, onCompletar]);

  const tocarOrbe = () => {
    if (estado === 'idle') {
      onIniciar?.();
      setCuentaPreparacion(DURACION_PREPARACION);
      setEstado('preparando');
    } else if (estado === 'activo') {
      reanudaRef.current = true;
      setEstado('pausado');
    } else if (estado === 'pausado') {
      reanudaRef.current = true;
      setEstado('activo');
    } else if (estado === 'error') {
      setRestante(total);
      setCuentaPreparacion(DURACION_PREPARACION);
      setEstado('preparando');
    }
  };

  const terminar = () => {
    reanudaRef.current = false;
    completoRef.current = false;
    setRestante(total);
    setEstado('idle');
  };

  const minutos = Math.floor(restante / 60);
  const segundos = String(restante % 60).padStart(2, '0');
  const progreso = 1 - restante / total;
  const mostrarTiempo = estado === 'activo' || estado === 'pausado' || estado === 'completo';
  const enSesion = estado === 'activo' || estado === 'pausado' || estado === 'preparando';

  const etiquetaAria: Record<Estado, string> = {
    idle: 'Toca para comenzar',
    preparando: 'Preparándose',
    activo: 'Sesión en curso, toca para pausar',
    pausado: 'Sesión en pausa, toca para continuar',
    completo: 'Sesión completada',
    error: 'No se pudo reproducir el audio, toca para reintentar',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="auto" />}
      <button
        type="button"
        onClick={tocarOrbe}
        disabled={estado === 'preparando' || estado === 'completo'}
        aria-label={etiquetaAria[estado]}
        className="relative flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4"
        style={{ width: tamano, height: tamano }}
      >
        <svg viewBox={`0 0 ${tamano} ${tamano}`} className="absolute inset-0 -rotate-90">
          <circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={radio}
            fill="none"
            stroke="color-mix(in oklab, var(--accent) 12%, transparent)"
            strokeWidth="6"
          />
          <motion.circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={radio}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * radio}
            initial={false}
            animate={{ strokeDashoffset: 2 * Math.PI * radio * (1 - progreso) }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <motion.div
          className="flex flex-col items-center justify-center rounded-full text-center"
          style={{
            width: interior,
            height: interior,
            background:
              'radial-gradient(circle at 32% 28%, color-mix(in oklab, var(--accent) 38%, white), color-mix(in oklab, var(--accent-2) 55%, white) 75%)',
            boxShadow: 'var(--shadow-2)',
          }}
          animate={reduce || estado !== 'activo' ? undefined : { scale: fase === 'inhala' ? 1.16 : 1 }}
          transition={{ duration: DURACION_FASE, ease: 'easeInOut' }}
        >
          {estado === 'idle' && (
            <>
              {etiqueta && (
                <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--text-primary)]">{etiqueta}</span>
              )}
              <span
                className={`font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)] ${
                  etiqueta ? 'mt-1 text-[28px] leading-none' : 'text-[22px]'
                }`}
              >
                {duracionMin} min
              </span>
              {grande && !etiqueta && (
                <span className="mt-1 px-4 text-[13px] font-medium text-[var(--text-primary)]">Toca para comenzar</span>
              )}
            </>
          )}
          {estado === 'preparando' && (
            <>
              <span className="text-[13px] font-medium text-[var(--text-primary)]">Prepárate…</span>
              <span className="text-[28px] font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                {cuentaPreparacion}
              </span>
            </>
          )}
          {mostrarTiempo && (
            <>
              <span className="text-[20px] font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                {minutos}:{segundos}
              </span>
              {estado === 'pausado' && <span className="text-[13px] font-medium text-[var(--text-primary)]">En pausa</span>}
              {estado === 'activo' && grande && <span className="text-[13px] text-[var(--text-primary)]">Toca para pausar</span>}
            </>
          )}
          {estado === 'error' && (
            <span className="px-3 text-[13px] font-semibold leading-tight text-[var(--text-primary)]">Toca para reintentar</span>
          )}
        </motion.div>
      </button>

      {audioSrc && !sinAvisoAudifonos && (estado === 'idle' || estado === 'preparando') && (
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: reduce ? 0 : 0.4 }}
          className="flex max-w-[38ch] items-center justify-center gap-2 rounded-full bg-[var(--chip-bg)] px-3 py-2 text-center text-[13px] font-medium leading-snug text-[var(--text-primary)]"
        >
          <motion.span
            aria-hidden="true"
            className="flex shrink-0"
            animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Headphones size={18} strokeWidth={1.8} color="var(--accent-ink)" />
          </motion.span>
          Utiliza audífonos para una experiencia más inmersiva y mejores resultados
        </motion.p>
      )}
      {estado === 'error' && (
        <p role="alert" className="max-w-[28ch] text-center text-[13px] leading-snug text-[var(--text-secondary)]">
          No pudimos reproducir el audio. Revisa tu conexión y toca el Orbe para reintentar.
        </p>
      )}
      {enSesion && (
        <button
          type="button"
          onClick={terminar}
          className="flex min-h-11 items-center justify-center rounded-[var(--radius-button)] px-4 text-[14px] font-medium text-[var(--text-secondary)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {estado === 'preparando' ? 'Cancelar' : 'Terminar sesión'}
        </button>
      )}
      {estado === 'completo' && <p className="text-[13px] font-medium text-[var(--accent-ink)]">Sesión completada.</p>}
    </div>
  );
}

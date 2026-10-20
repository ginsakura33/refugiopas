'use client';

// Reproductor de un audio de la Biblioteca, con el registro de calma ANTES y DESPUÉS (escala de 1 a 10).
// Pasos: (1) cuándo conviene escucharlo → (2) ¿qué tan en calma te sientes ahora? → (3) el audio → (4) ¿y ahora?
// → (5) tu cambio. El archivo vive en un espacio PRIVADO: se pide un enlace temporal con la sesión de la persona
// (solo funciona con un plan vigente). Si falla algo, el mensaje es amable y se puede reintentar.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Headphones, Heart, Loader2, Moon, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AudioDef } from '@/lib/app-demo-data';
import { guardarSesion } from '@/lib/sesiones-audio';

type Fase = 'inicio' | 'antes' | 'escuchando' | 'despues' | 'resultado';

const TTL_ENLACE = 3 * 60 * 60; // 3 h: de sobra para un audio de 11 minutos

const tiempo = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

// Escala 1 a 10 de calma: botones táctiles de 44px, con nombre accesible y los dos extremos explicados.
function EscalaCalma({ valor, onChange, etiqueta }: { valor: number | null; onChange: (n: number) => void; etiqueta: string }) {
  return (
    <div>
      <div role="radiogroup" aria-label={etiqueta} className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const activo = valor === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={activo}
              aria-label={`${n} de 10`}
              onClick={() => onChange(n)}
              className={`flex min-h-11 items-center justify-center rounded-[var(--radius-button)] text-[16px] font-semibold tabular-nums outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                activo
                  ? 'bg-[var(--accent-cta)] text-[var(--bg)] ring-1 ring-inset ring-[var(--accent-ink)]'
                  : 'bg-[var(--surface-2)] text-[var(--text-primary)]'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-[var(--text-secondary)]">
        <span>1 · Nada en calma</span>
        <span>10 · En total calma</span>
      </div>
    </div>
  );
}

export function ReproductorAudio({ audio, onGuardada }: { audio: AudioDef; onGuardada?: () => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [fase, setFase] = useState<Fase>('inicio');
  const [url, setUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [antes, setAntes] = useState<number | null>(null);
  const [despues, setDespues] = useState<number | null>(null);
  const [suena, setSuena] = useState(false);
  const [pos, setPos] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const reintentoAutomatico = useRef(false);

  // Pide el enlace temporal (solo funciona con un plan vigente).
  const pedirEnlace = useCallback(async () => {
    if (!audio.src) return;
    setCargando(true);
    setError('');
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new Error('sin-internet');
      const { data, error: e } = await createClient().storage.from('audios').createSignedUrl(audio.src, TTL_ENLACE);
      if (e || !data?.signedUrl) throw e ?? new Error('sin-enlace');
      setUrl(data.signedUrl);
    } catch (err) {
      setUrl(null);
      setError(
        (err as Error)?.message === 'sin-internet'
          ? 'Este audio necesita internet. Conéctate e inténtalo de nuevo.'
          : 'No pudimos cargar el audio. Revisa tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  }, [audio.src]);

  // El enlace se pide en cuanto la persona abre el audio, para que "empezar" suene al instante.
  useEffect(() => {
    void pedirEnlace();
  }, [pedirEnlace]);

  // Eventos del audio.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const alTiempo = () => setPos(el.currentTime);
    const alMetadatos = () => setDuracion(Number.isFinite(el.duration) ? el.duration : 0);
    const alPlay = () => setSuena(true);
    const alPausa = () => setSuena(false);
    const alTerminar = () => {
      setSuena(false);
      setFase('despues');
    };
    const alFallar = () => {
      setSuena(false);
      // Si el enlace venció a mitad del audio, se renueva una vez sin molestar.
      if (!reintentoAutomatico.current) {
        reintentoAutomatico.current = true;
        const donde = el.currentTime;
        void pedirEnlace().then(() => {
          el.currentTime = donde;
        });
      } else {
        setError('Se cortó el audio. Revisa tu conexión e inténtalo de nuevo.');
      }
    };
    el.addEventListener('timeupdate', alTiempo);
    el.addEventListener('loadedmetadata', alMetadatos);
    el.addEventListener('play', alPlay);
    el.addEventListener('pause', alPausa);
    el.addEventListener('ended', alTerminar);
    el.addEventListener('error', alFallar);
    return () => {
      el.removeEventListener('timeupdate', alTiempo);
      el.removeEventListener('loadedmetadata', alMetadatos);
      el.removeEventListener('play', alPlay);
      el.removeEventListener('pause', alPausa);
      el.removeEventListener('ended', alTerminar);
      el.removeEventListener('error', alFallar);
    };
  }, [pedirEnlace]);

  // Controles en la pantalla bloqueada / notificación del celular.
  useEffect(() => {
    if (!('mediaSession' in navigator) || fase !== 'escuchando') return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: audio.titulo,
      artist: 'Psic. Ginette Rivas · Refugio PAS',
      artwork: [{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
    });
    const el = ref.current;
    navigator.mediaSession.setActionHandler('play', () => void el?.play());
    navigator.mediaSession.setActionHandler('pause', () => el?.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => el && (el.currentTime = Math.max(0, el.currentTime - 15)));
    navigator.mediaSession.setActionHandler('seekforward', () => el && (el.currentTime = Math.min(el.duration || 0, el.currentTime + 15)));
    return () => {
      for (const a of ['play', 'pause', 'seekbackward', 'seekforward'] as const) navigator.mediaSession.setActionHandler(a, null);
    };
  }, [fase, audio.titulo]);

  // Al salir de la pantalla, el audio se detiene.
  useEffect(() => {
    const el = ref.current;
    return () => el?.pause();
  }, []);

  const empezar = () => {
    // Se llama desde el toque de la persona: así el navegador permite que suene al instante.
    setFase('escuchando');
    reintentoAutomatico.current = false;
    void ref.current?.play().catch(() => {
      /* si el navegador lo bloquea, la persona toca "reproducir" */
    });
  };

  const alternar = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  };

  const saltar = (seg: number) => {
    const el = ref.current;
    if (el) el.currentTime = Math.min(el.duration || 0, Math.max(0, el.currentTime + seg));
  };

  const terminarYa = () => {
    ref.current?.pause();
    setFase('despues');
  };

  const guardar = (omitir: boolean) => {
    if (antes === null) return;
    guardarSesion(audio.id, antes, omitir ? null : despues);
    setFase('resultado');
    onGuardada?.();
  };

  const repetir = () => {
    const el = ref.current;
    if (el) el.currentTime = 0;
    setPos(0);
    setAntes(null);
    setDespues(null);
    setFase('inicio');
  };

  const cambio = antes !== null && despues !== null ? despues - antes : null;

  return (
    <div className="flex flex-col gap-4">
      <audio ref={ref} src={url ?? undefined} preload="metadata" />

      {error && (
        <div role="alert" className="rounded-[var(--radius-button)] bg-[var(--chip-bg)] p-3">
          <p className="text-[14px] text-[var(--text-primary)]">{error}</p>
          <button
            type="button"
            onClick={() => void pedirEnlace()}
            className="mt-2 min-h-11 rounded-[var(--radius-button)] bg-[var(--accent-cta)] px-4 text-[14px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {fase === 'inicio' && (
        <>
          {audio.momentoTexto && (
            <div className="flex items-start gap-3 rounded-[var(--radius-button)] bg-[var(--chip-bg)] p-3">
              <Moon size={18} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" className="mt-0.5 shrink-0" />
              <p className="text-[14px] leading-snug text-[var(--text-primary)]">
                <span className="font-semibold">Cuándo escucharlo. </span>
                {audio.momentoTexto}
              </p>
            </div>
          )}
          <p className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
            <Headphones size={16} aria-hidden="true" /> Con audífonos se siente más inmersivo.
          </p>
          <button
            type="button"
            onClick={() => setFase('antes')}
            disabled={cargando || (!url && !error)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
          >
            {cargando ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            {cargando ? 'Preparando tu audio…' : 'Empezar'}
          </button>
        </>
      )}

      {fase === 'antes' && (
        <>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">Antes de empezar: ¿qué tan en calma te sientes ahora?</p>
          <EscalaCalma valor={antes} onChange={setAntes} etiqueta="Tu calma antes del audio, de 1 a 10" />
          <button
            type="button"
            onClick={empezar}
            disabled={antes === null || !url}
            className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
          >
            <Play size={18} aria-hidden="true" /> Comenzar el audio
          </button>
        </>
      )}

      {fase === 'escuchando' && (
        <>
          <div>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(duracion))}
              step={1}
              value={Math.min(Math.floor(pos), Math.max(1, Math.floor(duracion)))}
              onChange={(e) => {
                const el = ref.current;
                if (el) el.currentTime = Number(e.target.value);
              }}
              aria-label="Avance del audio"
              aria-valuetext={`${tiempo(pos)} de ${tiempo(duracion || audio.duracionMin * 60)}`}
              className="h-2 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, var(--accent) ${duracion ? (pos / duracion) * 100 : 0}%, color-mix(in oklab, var(--text-tertiary) 15%, transparent) 0%)`,
              }}
            />
            <div className="mt-1 flex justify-between text-[12px] tabular-nums text-[var(--text-secondary)]">
              <span>{tiempo(pos)}</span>
              <span>{tiempo(duracion || audio.duracionMin * 60)}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => saltar(-15)}
              aria-label="Retroceder 15 segundos"
              className="flex size-12 items-center justify-center rounded-full text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <RotateCcw size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={alternar}
              aria-label={suena ? 'Pausar' : 'Reproducir'}
              className="flex size-16 items-center justify-center rounded-full bg-[var(--accent-cta)] shadow-[var(--shadow-2)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {suena ? <Pause size={26} color="var(--bg)" aria-hidden="true" /> : <Play size={26} color="var(--bg)" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => saltar(15)}
              aria-label="Adelantar 15 segundos"
              className="flex size-12 items-center justify-center rounded-full text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <RotateCw size={22} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={terminarYa}
            className="min-h-11 rounded-[var(--radius-button)] text-[13px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Terminar ahora
          </button>
        </>
      )}

      {fase === 'despues' && (
        <>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">Terminaste. ¿Y ahora, qué tan en calma te sientes?</p>
          <EscalaCalma valor={despues} onChange={setDespues} etiqueta="Tu calma después del audio, de 1 a 10" />
          <button
            type="button"
            onClick={() => guardar(false)}
            disabled={despues === null}
            className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
          >
            <Check size={18} aria-hidden="true" /> Guardar mi registro
          </button>
          <button
            type="button"
            onClick={() => guardar(true)}
            className="min-h-11 rounded-[var(--radius-button)] text-[13px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Omitir por ahora
          </button>
        </>
      )}

      {fase === 'resultado' && (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 text-center">
          <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <Heart size={22} strokeWidth={1.8} color="var(--accent)" />
          </span>
          {cambio === null ? (
            <p className="text-[15px] text-[var(--text-primary)]">Tu registro quedó guardado. Gracias por cuidarte hoy.</p>
          ) : cambio > 0 ? (
            <>
              <p className="text-[20px] font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
                De {antes} a {despues}
              </p>
              <p className="text-[14px] text-[var(--text-secondary)]">Tu calma subió {cambio} {cambio === 1 ? 'punto' : 'puntos'}. Ese cambio es tuyo.</p>
            </>
          ) : (
            <>
              <p className="text-[20px] font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
                De {antes} a {despues}
              </p>
              <p className="text-[14px] text-[var(--text-secondary)]">
                {cambio === 0 ? 'Tu calma se mantuvo.' : 'A veces el cuerpo necesita más de una escucha.'} Puedes repetirlo cuando quieras; no hay prisa.
              </p>
            </>
          )}
          <button
            type="button"
            onClick={repetir}
            className="min-h-11 rounded-[var(--radius-button)] px-4 text-[14px] font-semibold text-[var(--accent-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Escuchar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

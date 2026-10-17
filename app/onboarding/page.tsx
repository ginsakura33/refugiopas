'use client';

// Recorrido de inicio de Refugio PAS — Sesión 4 (ver docs/sistema/02B, 50-DISENO-ONBOARDING-PAYWALL.md).
// Modelo onboarding-first anónimo: el test + el arquetipo + la primera sesión del Orbe son
// GRATIS y sin registro (CTA_HREF de la landing apunta aquí). El pago se pide después, en /paywall.
// Contenido del test y de los arquetipos: REAL, extraído del ebook de Ginette Rivas (ver
// lib/onboarding-content.ts) — nunca inventado (regla de oro 3/57).

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Sparkles, Compass, HandHeart, Star } from 'lucide-react';
import {
  AnimatedStep,
  CtaFijo,
  OnboardingHeader,
  OnboardingScreen,
  OptionChip,
  PreguntaTitulo,
  ReconocimientoScreen,
  SliderCompromiso,
} from '@/components/onboarding/ui';
import { SesionTimer } from '@/components/app-interna/SesionTimer';
import { ARQUETIPOS, ORDEN_ARQUETIPOS, TEST_PAS, TEST_PAS_NOTA, type ArquetipoId } from '@/lib/onboarding-content';

const ICONO_ARQUETIPO: Record<ArquetipoId, typeof Heart> = {
  introspectiva: Compass,
  solar: Sparkles,
  visionaria: Star,
  empatica: HandHeart,
  luminosa: Heart,
};

const DOLORES = [
  { value: 'emociones', label: 'Absorber las emociones de otros' },
  { value: 'ruido', label: 'El ruido y el caos a mi alrededor' },
  { value: 'limites', label: 'Sentir culpa al poner límites' },
  { value: 'rumiacion', label: 'No poder dejar de pensar de noche' },
];

const OBJECIONES = [
  { value: 'aburrio', label: 'Sí, y me aburrí' },
  { value: 'no_sirvio', label: 'Sí, pero no me sirvió' },
  { value: 'primera_vez', label: 'No, es mi primera vez' },
];

const MOMENTOS = [
  { value: 'casa', label: 'Al llegar a casa' },
  { value: 'trabajo', label: 'En el trabajo' },
  { value: 'noche', label: 'De noche, antes de dormir' },
  { value: 'cualquiera', label: 'En cualquier momento' },
];

const RECONOCIMIENTO_OBJECION: Record<string, string> = {
  aburrio:
    'No es que la meditación no sea para ti — es que las apps genéricas no tienen un protocolo para un sistema nervioso PAS. El Orbe sí.',
  no_sirvio:
    'Si no te sirvió, no fue falta de disciplina: te faltaba un protocolo hecho para tu sensibilidad, no una meditación genérica.',
  primera_vez:
    'Empezar por algo hecho específicamente para personas altamente sensibles — y no una app genérica — es la diferencia.',
};

const TOTAL_PASOS = 20;

export default function OnboardingPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [testRespuestas, setTestRespuestas] = useState<(boolean | null)[]>(Array(10).fill(null));
  const [arquetipo, setArquetipo] = useState<ArquetipoId | null>(null);
  const [dolor, setDolor] = useState<string | null>(null);
  const [dolorOtro, setDolorOtro] = useState('');
  const [mostrarOtroDolor, setMostrarOtroDolor] = useState(false);
  const [objecion, setObjecion] = useState<string | null>(null);
  const [minutos, setMinutos] = useState(5);
  const [momento, setMomento] = useState<string | null>(null);

  const siesCount = testRespuestas.filter((r) => r === true).length;

  // La landing manda el plan elegido (?plan=anual|mensual); se guarda para preseleccionarlo en el paywall.
  useEffect(() => {
    try {
      const plan = new URLSearchParams(window.location.search).get('plan');
      if (plan === 'anual' || plan === 'mensual') sessionStorage.setItem('refugio-plan', plan);
    } catch {
      /* sin sessionStorage: el paywall abre con el plan anual recomendado */
    }
  }, []);

  const siguiente = () => setPaso((p) => Math.min(p + 1, TOTAL_PASOS - 1));
  // Desde el Orbe (19) atrás salta el loading (18): volver a él lo reiniciaría y empujaría de nuevo al Orbe (bucle).
  const atras = () => setPaso((p) => (p === 19 ? 17 : Math.max(p - 1, 0)));

  // Auto-avance con guarda: un doble toque no puede saltarse la pregunta siguiente.
  const avanzando = useRef(false);
  const avanzarConPausa = () => {
    if (avanzando.current) return;
    avanzando.current = true;
    setTimeout(() => {
      avanzando.current = false;
      siguiente();
    }, 300);
  };

  const feedbackMinutos =
    minutos <= 3 ? 'Un buen punto de partida' : minutos <= 7 ? 'Meta realista para empezar' : 'Ambiciosa — te acompañamos';

  const guardarYContinuar = () => {
    const datos = {
      siesCount,
      arquetipo,
      dolor: dolor === 'otro' ? dolorOtro : dolor,
      objecion,
      minutos,
      momento,
      totalRespuestas: 10 + 5,
    };
    try {
      sessionStorage.setItem('refugio-onboarding', JSON.stringify(datos));
    } catch {
      /* sessionStorage puede fallar en modo privado — el paywall usa un plan genérico si no hay datos */
    }
    router.push('/paywall');
  };

  const arquetipoData = arquetipo ? ARQUETIPOS[arquetipo] : null;

  // Atrás deshabilitado SOLO durante el loading (paso 18 — el flujo ya se comprometió, 50 → B2).
  // En el paso 19 (la sesión del Orbe) SÍ se permite salir: atrapar sin salida a alguien en medio
  // de un ejercicio de calma contradice la promesa del producto (hallazgo revisor-visual).
  const mostrarAtras = paso > 0 && paso !== 18;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(680px 420px at 50% -10%, color-mix(in oklab, var(--accent) 8%, transparent) 0%, transparent 60%), ' +
            'radial-gradient(520px 360px at 100% 100%, color-mix(in oklab, var(--accent-2) 16%, transparent) 0%, transparent 55%)',
        }}
      />
      <OnboardingHeader progreso={(paso + 1) / TOTAL_PASOS} onBack={mostrarAtras ? atras : undefined} />

      <AnimatedStep stepKey={String(paso)}>
        <OnboardingScreen>
          {/* Pasos 0-9: test de alta sensibilidad (10 preguntas reales, 1 por pantalla) */}
          {paso < 10 && (
            <>
              <PreguntaTitulo microcopy={`Pregunta ${paso + 1} de 10 · responde con sinceridad`}>
                {TEST_PAS[paso]}
              </PreguntaTitulo>
              <div className="flex flex-col gap-3">
                <OptionChip
                  index={0}
                  label="Sí"
                  seleccionado={testRespuestas[paso] === true}
                  onClick={() => {
                    setTestRespuestas((r) => r.map((v, i) => (i === paso ? true : v)));
                    avanzarConPausa();
                  }}
                />
                <OptionChip
                  index={1}
                  label="No"
                  seleccionado={testRespuestas[paso] === false}
                  onClick={() => {
                    setTestRespuestas((r) => r.map((v, i) => (i === paso ? false : v)));
                    avanzarConPausa();
                  }}
                />
              </div>
            </>
          )}

          {/* Paso 10: resultado del test */}
          {paso === 10 && (
            <>
              <ReconocimientoScreen
                titulo={
                  siesCount >= 5
                    ? 'Es muy probable que seas una Persona Altamente Sensible'
                    : 'Tu sensibilidad tiene su propio ritmo'
                }
                visual={
                  <span role="img" aria-label={`${siesCount} de 10`} className="flex items-baseline gap-1 text-[var(--text-primary)] [font-family:var(--font-display)]">
                    <span className="text-[56px] font-bold leading-none tabular-nums">{siesCount}</span>
                    <span className="text-[22px] text-[var(--text-secondary)]">de 10</span>
                  </span>
                }
              >
                <p>
                  {siesCount >= 5
                    ? 'Tu forma de percibir el mundo tiene un nombre y un porqué. Sigamos conociendo tu tipo de sensibilidad.'
                    : 'No necesitas 10 síes para merecer un momento de calma real. Sigamos conociendo tu tipo de sensibilidad.'}
                </p>
                <p className="mt-4 text-[13px] leading-snug text-[var(--text-secondary)]">{TEST_PAS_NOTA}</p>
                <p className="mt-2 text-[13px] leading-snug text-[var(--text-secondary)]">
                  Refugio PAS te acompaña entre sesiones: no sustituye a tu terapeuta.
                </p>
              </ReconocimientoScreen>
              <CtaFijo onClick={siguiente}>Continuar</CtaFijo>
            </>
          )}

          {/* Paso 11: arquetipo */}
          {paso === 11 && (
            <>
              <PreguntaTitulo microcopy="Elige la frase con la que más resuenas">¿Cuál te representa más?</PreguntaTitulo>
              <div className="flex flex-col gap-3">
                {ORDEN_ARQUETIPOS.map((id, i) => (
                  <OptionChip
                    key={id}
                    index={i}
                    label={ARQUETIPOS[id].vibraEn}
                    icono={ICONO_ARQUETIPO[id]}
                    seleccionado={arquetipo === id}
                    onClick={() => {
                      setArquetipo(id);
                      avanzarConPausa();
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Paso 12: dolor principal */}
          {paso === 12 && (
            <>
              <PreguntaTitulo>¿Qué te agobia más seguido?</PreguntaTitulo>
              {!mostrarOtroDolor ? (
                <div className="flex flex-col gap-3">
                  {DOLORES.map((d, i) => (
                    <OptionChip
                      key={d.value}
                      index={i}
                      label={d.label}
                      seleccionado={dolor === d.value}
                      onClick={() => {
                        setDolor(d.value);
                        avanzarConPausa();
                      }}
                    />
                  ))}
                  <OptionChip
                    index={DOLORES.length}
                    label="Otra cosa (escríbela)"
                    seleccionado={false}
                    onClick={() => setMostrarOtroDolor(true)}
                  />
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    autoFocus
                    value={dolorOtro}
                    onChange={(e) => setDolorOtro(e.target.value)}
                    placeholder="Cuéntame qué te agobia"
                    className="h-14 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 text-[16px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  />
                  <CtaFijo
                    disabled={dolorOtro.trim().length === 0}
                    onClick={() => {
                      setDolor('otro');
                      siguiente();
                    }}
                  >
                    Continuar
                  </CtaFijo>
                </>
              )}
            </>
          )}

          {/* Paso 13: objeción */}
          {paso === 13 && (
            <>
              <PreguntaTitulo>¿Ya probaste apps de meditación?</PreguntaTitulo>
              <div className="flex flex-col gap-3">
                {OBJECIONES.map((o, i) => (
                  <OptionChip
                    key={o.value}
                    index={i}
                    label={o.label}
                    seleccionado={objecion === o.value}
                    onClick={() => {
                      setObjecion(o.value);
                      avanzarConPausa();
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Paso 14: reconocimiento objeción */}
          {paso === 14 && (
            <>
              <ReconocimientoScreen titulo="Tiene sentido">
                <p>{objecion ? RECONOCIMIENTO_OBJECION[objecion] : RECONOCIMIENTO_OBJECION.primera_vez}</p>
              </ReconocimientoScreen>
              <CtaFijo onClick={siguiente}>Continuar</CtaFijo>
            </>
          )}

          {/* Paso 15: slider de minutos */}
          {paso === 15 && (
            <>
              <PreguntaTitulo>¿Cuántos minutos al día quieres dedicarle a tu calma?</PreguntaTitulo>
              <SliderCompromiso
                valor={minutos}
                min={2}
                max={10}
                sufijo="minutos/día"
                feedback={feedbackMinutos}
                onChange={setMinutos}
              />
              <CtaFijo onClick={siguiente}>Fijar mi meta</CtaFijo>
            </>
          )}

          {/* Paso 16: momento del día */}
          {paso === 16 && (
            <>
              <PreguntaTitulo microcopy="Así sabemos cuándo recordártelo">¿Cuándo sueles sentir la sobrecarga?</PreguntaTitulo>
              <div className="flex flex-col gap-3">
                {MOMENTOS.map((m, i) => (
                  <OptionChip
                    key={m.value}
                    index={i}
                    label={m.label}
                    seleccionado={momento === m.value}
                    onClick={() => {
                      setMomento(m.value);
                      avanzarConPausa();
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Paso 17: reconocimiento final — etiquetado positivo con el arquetipo real */}
          {paso === 17 && arquetipoData && (
            <>
              <ReconocimientoScreen
                destacado
                titulo={`Tus respuestas te describen: eres ${arquetipoData.nombre}`}
                visual={
                  <span
                    aria-hidden="true"
                    className="flex size-16 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)]"
                  >
                    {(() => {
                      const Icono = ICONO_ARQUETIPO[arquetipoData.id];
                      return <Icono size={30} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />;
                    })()}
                  </span>
                }
              >
                <p>
                  Tu don natural es {arquetipoData.donNatural}. Tu desafío: {arquetipoData.desafio} — el Orbe que Respira es
                  tu herramienta para {arquetipoData.caminoEvolucion}.
                </p>
              </ReconocimientoScreen>
              <CtaFijo onClick={siguiente}>Ver mi Orbe</CtaFijo>
            </>
          )}

          {/* Paso 18: loading "construyendo tu refugio" */}
          {paso === 18 && (
            <LoadingRefugio
              siesCount={siesCount}
              arquetipoNombre={arquetipoData?.nombre ?? 'tu arquetipo'}
              minutos={minutos}
              momentoLabel={MOMENTOS.find((m) => m.value === momento)?.label ?? 'cuando lo necesites'}
              onFinish={siguiente}
            />
          )}

          {/* Paso 19: primera victoria — sesión real del Orbe */}
          {paso === 19 && arquetipoData && (
            <PrimeraVictoria onContinuar={guardarYContinuar} />
          )}
        </OnboardingScreen>
      </AnimatedStep>
    </div>
  );
}

function LoadingRefugio({
  siesCount,
  arquetipoNombre,
  minutos,
  momentoLabel,
  onFinish,
}: {
  siesCount: number;
  arquetipoNombre: string;
  minutos: number;
  momentoLabel: string;
  onFinish: () => void;
}) {
  const lineas = useMemo(
    () => [
      `Analizando tu test de sensibilidad: ${siesCount} de 10 síes`,
      `Reconociendo tu arquetipo: ${arquetipoNombre}`,
      `Ajustando tu ritual a ${minutos} minutos, ${momentoLabel.toLowerCase()}`,
      'Preparando tu Orbe que Respira',
    ],
    [siesCount, arquetipoNombre, minutos, momentoLabel]
  );
  const [activaIdx, setActivaIdx] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;
    const avanzar = () => {
      i += 1;
      if (i >= lineas.length) {
        timers.push(setTimeout(onFinish, 700));
        return;
      }
      setActivaIdx(i);
      timers.push(setTimeout(avanzar, 900));
    };
    timers.push(setTimeout(avanzar, 900));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round(((activaIdx + 1) / lineas.length) * 100);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div className="relative flex size-28 items-center justify-center">
        <svg viewBox="0 0 112 112" className="absolute inset-0 -rotate-90">
          <circle cx="56" cy="56" r="48" fill="none" stroke="color-mix(in oklab, var(--accent) 12%, transparent)" strokeWidth="8" />
          <circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 48}
            strokeDashoffset={2 * Math.PI * 48 * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>
        <span className="text-[22px] font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
          {pct}%
        </span>
      </div>
      <h1 className="text-[22px] font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Construyendo tu Refugio…
      </h1>
      <ul className="flex w-full flex-col gap-3 text-left">
        {lineas.map((l, i) => (
          <li
            key={l}
            className={`flex items-start gap-3 text-[15px] ${i <= activaIdx ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] opacity-40'}`}
          >
            <span
              aria-hidden="true"
              className={`mt-1 size-2.5 shrink-0 rounded-full ${i < activaIdx ? 'bg-[var(--accent)]' : i === activaIdx ? 'animate-pulse bg-[var(--accent)]' : 'border border-current'}`}
            />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrimeraVictoria({ onContinuar }: { onContinuar: () => void }) {
  const [listo, setListo] = useState(false);
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);

  // El CTA siempre está vivo: si la sesión no terminó, se pregunta antes de salir (control y libertad).
  const tocarCta = () => {
    if (listo) onContinuar();
    else setConfirmandoSalida(true);
  };

  return (
    <>
      <PreguntaTitulo microcopy="Tu primera sesión es gratis, aquí mismo">Respira 2 minutos con el Orbe</PreguntaTitulo>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <SesionTimer duracionMin={2} tamano={220} audioSrc="/audio/orbe-liberacion-2min-v2.mp3" sinAvisoAudifonos onCompletar={() => setListo(true)} />
        <p className="max-w-[36ch] text-balance text-center text-[14px] leading-snug text-[var(--text-secondary)]">
          Busca un lugar cómodo, ponte audífonos para una experiencia inmersiva y mejores resultados. Respira siguiendo la voz de Ginette Rivas.
        </p>
      </div>

      {confirmandoSalida && !listo ? (
        <div role="alertdialog" aria-label="Salir de la sesión" className="mt-auto rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
          <p className="text-center text-[15px] font-semibold text-[var(--text-primary)]">¿Salir antes de terminar tu respiración?</p>
          <p className="mt-1 text-center text-[13px] text-[var(--text-secondary)]">Podrás repetir esta sesión cuando quieras dentro de la app.</p>
          <div className="mt-4 flex flex-col gap-2">
            <CtaFijo onClick={() => setConfirmandoSalida(false)}>Volver a la sesión</CtaFijo>
            <button
              type="button"
              onClick={onContinuar}
              className="flex min-h-11 items-center justify-center rounded-[var(--radius-button)] text-[15px] font-medium text-[var(--text-secondary)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Salir y ver mis planes
            </button>
          </div>
        </div>
      ) : (
        <CtaFijo onClick={tocarCta}>{listo ? 'Ver mis planes' : 'Continuar'}</CtaFijo>
      )}
    </>
  );
}

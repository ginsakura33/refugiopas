'use client';

// Inicio — pantalla principal de la app (Sesión 5). Composición: saludo con fecha real,
// tarjeta SOS con el Orbe, 3 chips de estado, chequeo de ánimo diario (53-PANTALLA-CANONICA.md).
// Sin backend todavía: arquetipo/racha se leen de sessionStorage (dejado por el onboarding) con
// fallback a datos de ejemplo — nunca pantalla vacía (32-DEL-MVP-AL-PRODUCTO.md).

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Flame, Compass, Headphones, ArrowRight, BookHeart, Quote } from 'lucide-react';
import { AppShell, Card, MoodPicker, StatChip } from '@/components/app-interna/ui';
import { SesionTimer } from '@/components/app-interna/SesionTimer';
import { DespuesDeSesion } from '@/components/app-interna/DespuesDeSesion';
import { InstalarApp } from '@/components/app-interna/PwaApp';
import { ANIMOS, AUDIOS, HABITOS, MODULOS, PERFIL_DEMO, fraseDelDia, type Animo } from '@/lib/app-demo-data';
import { calcularRacha } from '@/lib/racha';
import { ARQUETIPOS, type ArquetipoId } from '@/lib/onboarding-content';
import { LogoMarca } from '@/components/Logo';
import { Hairline, useReveal } from '@/components/landing/ui';

const FECHA_RAW = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
const FECHA_LABEL = FECHA_RAW.charAt(0).toUpperCase() + FECHA_RAW.slice(1);
const FRASE_HOY = fraseDelDia();

export default function InicioPage() {
  const [nombre, setNombre] = useState(PERFIL_DEMO.nombre);
  const [arquetipoNombre, setArquetipoNombre] = useState(PERFIL_DEMO.arquetipoNombre);
  const [animoHoy, setAnimoHoy] = useState<Animo | null>(null);
  const [modulosCompletados, setModulosCompletados] = useState(0);
  const [sesionTerminada, setSesionTerminada] = useState(false);
  const [rachaActual, setRachaActual] = useState(0);
  const animoAntesRef = useRef<Animo | null>(null);
  const animoHoyRef = useRef<Animo | null>(null);
  animoHoyRef.current = animoHoy;
  const { contenedor, item } = useReveal(0.08);

  // Ánimo de ANTES: el que tenía marcado al tocar el Orbe. Al terminar el audio se pregunta el de ahora.
  const alIniciarSesion = useCallback(() => {
    animoAntesRef.current = animoHoyRef.current;
    setSesionTerminada(false);
  }, []);
  const alCompletarSesion = useCallback(() => setSesionTerminada(true), []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('refugio-onboarding');
      if (raw) {
        const datos = JSON.parse(raw);
        const id = datos?.arquetipo as ArquetipoId | undefined;
        if (id && ARQUETIPOS[id]) setArquetipoNombre(ARQUETIPOS[id].nombre);
      }
      setRachaActual(calcularRacha(HABITOS.map((h) => h.id)).actual);
      const animoGuardado = localStorage.getItem('refugio-animo-hoy');
      if (animoGuardado) setAnimoHoy(animoGuardado as Animo);
      const modulosGuardados = localStorage.getItem('refugio-modulos-completados');
      if (modulosGuardados) {
        const hechos = JSON.parse(modulosGuardados) as Record<string, boolean>;
        setModulosCompletados(MODULOS.filter((m) => hechos[m.id]).length);
      }
    } catch {
      /* sin datos guardados: se usan los de ejemplo */
    }
  }, []);

  const elegirAnimo = (a: string) => {
    setAnimoHoy(a as Animo);
    try {
      localStorage.setItem('refugio-animo-hoy', a);
    } catch {
      /* localStorage puede fallar en modo privado — no bloquea la interacción */
    }
  };

  const tipoCorto = arquetipoNombre.replace(/^(el|la) /i, '').replace(/^Alma /i, '');

  return (
    <AppShell>
      <motion.div variants={contenedor} initial="hidden" animate="visible" className="flex flex-1 flex-col">
        <motion.div variants={item} className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-[var(--text-tertiary)]">{FECHA_LABEL}</p>
            <h1 className="mt-1 text-[26px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
              Hola, {nombre}
            </h1>
          </div>
          <LogoMarca size={72} />
        </motion.div>

        <motion.div variants={item} className="flex flex-col items-center gap-3 py-2">
          <SesionTimer
            duracionMin={2}
            tamano={168}
            etiqueta="AUDIO S.O.S."
            audioSrc="/audio/orbe-liberacion-2min-v2.mp3"
            onIniciar={alIniciarSesion}
            onCompletar={alCompletarSesion}
          />
          <p className="text-center text-[14px] text-[var(--text-secondary)]">Toca el Orbe para comenzar y liberar la sobrecarga.</p>
        </motion.div>

        {sesionTerminada && <DespuesDeSesion antes={animoAntesRef.current} onElegir={(a) => elegirAnimo(a)} />}

        <motion.div variants={item} className="mt-5">
          <Hairline surface="surface" className="shadow-[var(--shadow-1)]">
            <div className="p-5">
              <p className="text-[15px] font-semibold text-[var(--text-primary)]">¿Cómo te sientes hoy?</p>
              <div className="mt-4">
                <MoodPicker opciones={ANIMOS} seleccion={animoHoy} onSelect={elegirAnimo} />
              </div>
              {animoHoy && (
                <>
                  <p role="status" className="mt-4 text-center text-[13px] text-[var(--text-secondary)]">
                    Ánimo de hoy guardado: {animoHoy}.
                  </p>
                  <Link
                    href="/app/diario"
                    className="mt-3 flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-button)] bg-[var(--chip-bg)] text-[13px] font-semibold text-[var(--accent-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    Escribir sobre esto en tu diario <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </Hairline>
        </motion.div>

        <InstalarApp />

        <motion.div variants={item} className="mt-5">
          <Card className="flex items-start gap-3 p-5">
            <Quote size={20} strokeWidth={2} color="var(--accent-ink)" aria-hidden="true" className="mt-1 shrink-0" />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--accent-ink)]">Frase del día</p>
              <p className="mt-1 text-[18px] italic leading-snug text-[var(--text-primary)] [font-family:var(--font-display)]">
                {FRASE_HOY}
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} whileTap={{ scale: 0.98 }} className="mt-5">
          <Link href="/app/modulos" className="block rounded-[var(--radius-card)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            <Card className="flex items-center gap-4 p-5">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
              >
                <BookHeart size={20} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[var(--text-primary)]">Tu proceso PAS</p>
                <p className="text-[13px] text-[var(--text-secondary)]">{modulosCompletados} de {MODULOS.length} módulos</p>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={MODULOS.length}
                  aria-valuenow={modulosCompletados}
                  aria-label="Módulos completados"
                  className="mt-2 flex gap-1"
                >
                  {MODULOS.map((m, i) => (
                    <span
                      key={m.id}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < modulosCompletados ? 'bg-[var(--accent)]' : 'bg-[color-mix(in_oklab,var(--text-tertiary)_16%,transparent)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-tertiary)" aria-hidden="true" />
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item} className="mt-auto flex gap-3 pt-5">
          <StatChip label="Tu tipo" valor={tipoCorto} icon={Compass} href="/app/perfil" />
          <StatChip label="días de racha" valor={String(rachaActual)} icon={Flame} href="/app/habitos" />
          <StatChip label="audios" valor={String(AUDIOS.length)} icon={Headphones} href="/app/biblioteca" />
        </motion.div>
      </motion.div>
    </AppShell>
  );
}

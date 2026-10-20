'use client';

// PAYWALL de secuencia (2 pantallas) — Sesión 4 (ver docs/sistema/02B/50 sección C).
// 1) recap del valor personalizado + inversión visible · 2) precio + timeline compacto de la
// prueba (SOLO el plan anual: 7 días — decisión del usuario 2026-10-12; el mensual se paga desde
// el primer día) + CTA + garantía + salida limpia. La pantalla aparte del timeline se quitó
// (2026-10-11): repetía lo que ya muestra el timeline compacto de la pantalla de precio.
// Hotmart (Sesión 6): el CTA final lleva a la página de pago real del plan elegido
// (NEXT_PUBLIC_HOTMART_CHECKOUT_ANUAL / _MENSUAL). Mientras esas variables no existan, lleva al
// acceso por correo — nunca un checkout falso que parezca procesar un cobro real (docs/sistema/50 → C3ter).

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { limpiarDatosLocales, subirPendientes } from '@/lib/datos-nube';
import { leerPlan, type PlanReal } from '@/lib/perfil';
import { PantallaAccesoPendiente } from '@/components/paywall/AccesoPendiente';

// Páginas de pago de Hotmart (públicas). Sin ellas configuradas, el botón lleva al acceso por correo.
const CHECKOUT = {
  anual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_ANUAL,
  mensual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_MENSUAL,
} as const;
import { CheckCustom, Hairline, useReveal } from '@/components/landing/ui';
import { CtaFijo } from '@/components/onboarding/ui';
import { ARQUETIPOS, type ArquetipoId } from '@/lib/onboarding-content';

interface DatosOnboarding {
  siesCount: number;
  arquetipo: ArquetipoId | null;
  dolor: string | null;
  frecuencia: string | null;
  preferencia: string | null;
  objecion: string | null;
  minutos: number;
  momento: string | null;
  totalRespuestas: number;
}

const MOMENTO_LABEL: Record<string, string> = {
  casa: 'al llegar a casa',
  trabajo: 'en el trabajo',
  noche: 'antes de dormir',
  cualquiera: 'cuando lo necesites',
};

// Las 3 funciones reales del MVP — se listan SIEMPRE las 3 (52/50: máx 3 beneficios), pero la
// que el usuario eligió como preferencia en el onboarding (paso "¿cómo te gustaría
// autorregularte?") se ordena PRIMERO: el paywall responde exactamente lo que pidió
// (LA ESCALERA de 02B — el paywall muestra la inversión del onboarding en el momento del precio).
const BENEFICIOS: Record<'sos' | 'nocturno' | 'lecciones', string> = {
  sos: 'Baja la sobrecarga en 2 minutos, incluso sin internet',
  nocturno: 'Audios guiados para soltar el día y dormir en paz',
  lecciones: 'Lecciones cortas para entender y cuidar tu sensibilidad',
};
const ORDEN_BENEFICIOS_DEFAULT: ('sos' | 'nocturno' | 'lecciones')[] = ['sos', 'nocturno', 'lecciones'];

function ordenarBeneficios(preferencia: string | null): string[] {
  const pref = preferencia as 'sos' | 'nocturno' | 'lecciones' | null;
  const orden = pref && BENEFICIOS[pref] ? [pref, ...ORDEN_BENEFICIOS_DEFAULT.filter((b) => b !== pref)] : ORDEN_BENEFICIOS_DEFAULT;
  return orden.map((b) => BENEFICIOS[b]);
}

export default function PaywallPage() {
  const router = useRouter();
  const irAlPago = (plan: 'anual' | 'mensual') => {
    const url = CHECKOUT[plan];
    if (url) window.location.assign(url);
    else router.push('/entrar');
  };
  const [pantalla, setPantalla] = useState(0);
  const [datos, setDatos] = useState<DatosOnboarding | null>(null);
  // Si la persona llegó aquí porque su acceso no está activo (plan vencido, cancelado, sin compra…).
  const [pendiente, setPendiente] = useState<{ correo: string | null; plan: PlanReal | null } | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('acceso') !== 'pendiente') return;
    Promise.all([createClient().auth.getSession(), leerPlan()]).then(([{ data }, plan]) =>
      setPendiente({ correo: data.session?.user.email ?? null, plan })
    );
  }, []);

  const cerrarSesion = async () => {
    setSaliendo(true);
    // Lo escrito sin conexión se sube antes de limpiar el celular; si no se pudo, se conserva (y no se mezcla con otra cuenta).
    const quedoGuardado = await Promise.race([subirPendientes(), new Promise<boolean>((r) => setTimeout(() => r(false), 6000))]);
    await createClient().auth.signOut();
    if (quedoGuardado) limpiarDatosLocales();
    router.push('/entrar');
    router.refresh();
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('refugio-onboarding');
      if (raw) setDatos(JSON.parse(raw));
    } catch {
      /* sin datos: se usa el plan genérico de abajo */
    }
  }, []);

  const arquetipo = datos?.arquetipo ? ARQUETIPOS[datos.arquetipo] : null;
  const momentoLabel = datos?.momento ? MOMENTO_LABEL[datos.momento] ?? 'cuando lo necesites' : 'cuando lo necesites';
  const totalRespuestas = datos?.totalRespuestas ?? 0;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(720px 420px at 50% -10%, color-mix(in oklab, var(--accent) 9%, transparent) 0%, transparent 60%), ' +
            'radial-gradient(560px 380px at 100% 20%, color-mix(in oklab, var(--accent-2) 20%, transparent) 0%, transparent 55%)',
        }}
      />

      <div className="flex h-16 items-center px-4">
        {!pendiente && (
        <button
          type="button"
          onClick={() => (pantalla === 1 ? setPantalla(0) : router.push('/onboarding'))}
          aria-label={pantalla === 1 ? 'Volver al resumen' : 'Cerrar'}
          className="flex size-11 items-center justify-center rounded-full text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <X size={20} aria-hidden="true" />
        </button>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pantalla}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            {pendiente ? (
              <PantallaAccesoPendiente
                correo={pendiente.correo}
                plan={pendiente.plan}
                saliendo={saliendo}
                onElegirPlan={() => {
                  setPendiente(null);
                  setPantalla(1);
                }}
                onSalir={cerrarSesion}
              />
            ) : pantalla === 0 ? (
              <PantallaRecap
                arquetipoNombre={arquetipo?.nombre ?? 'tu Refugio'}
                momentoLabel={momentoLabel}
                totalRespuestas={totalRespuestas}
                beneficios={ordenarBeneficios(datos?.preferencia ?? null)}
                onSiguiente={() => setPantalla(1)}
              />
            ) : (
              <PantallaPrecio onEmpezar={irAlPago} onAhoraNo={() => router.push('/')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PantallaRecap({
  arquetipoNombre,
  momentoLabel,
  totalRespuestas,
  beneficios,
  onSiguiente,
}: {
  arquetipoNombre: string;
  momentoLabel: string;
  totalRespuestas: number;
  beneficios: string[];
  onSiguiente: () => void;
}) {
  const { contenedor, item } = useReveal();
  return (
    <>
      <motion.div
        variants={contenedor}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col justify-center"
      >
        <motion.h1
          variants={item}
          className="text-balance text-[28px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]"
        >
          Tu Refugio para calmarte en <span className="text-[var(--accent)]">2 minutos</span> está listo
        </motion.h1>
        <motion.p variants={item} className="mt-2 text-[14px] text-[var(--text-secondary)]">
          {totalRespuestas > 0
            ? `Hecho con tus ${totalRespuestas} respuestas, para ${arquetipoNombre} — con tu ritual pensado para ${momentoLabel}.`
            : 'Pensado para personas altamente sensibles: audios, hábitos y un espacio solo tuyo.'}
        </motion.p>

        <motion.div variants={item}>
          <Hairline surface="surface" className="mt-8 shadow-[var(--shadow-1)]">
            <ul className="flex flex-col gap-4 p-5">
              {beneficios.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] leading-snug text-[var(--text-primary)]">
                  <CheckCustom />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Hairline>
        </motion.div>
      </motion.div>
      <div className="mt-8">
        <CtaFijo onClick={onSiguiente}>Ver mi plan</CtaFijo>
      </div>
    </>
  );
}

interface Plan {
  id: 'anual' | 'mensual';
  nombre: string;
  precioMes: string;
  detalle: string;
  ahorro?: string;
  ctaLabel: string;
}

const PLANES: Record<'anual' | 'mensual', Plan> = {
  anual: {
    id: 'anual',
    nombre: 'Anual',
    precioMes: '$4.99',
    detalle: 'Se cobra $59.88/año',
    ahorro: 'Ahorras 4 meses',
    ctaLabel: 'Empezar mis 7 días gratis',
  },
  mensual: {
    id: 'mensual',
    nombre: 'Mensual',
    precioMes: '$7.99',
    detalle: 'Se cobra $7.99 hoy y luego cada mes',
    ctaLabel: 'Empezar con el plan mensual',
  },
};

const PASOS_PRUEBA = [
  { titulo: 'Hoy', detalle: 'Acceso completo', cobro: false },
  { titulo: 'Día 6', detalle: 'Te avisamos', cobro: false },
  { titulo: 'Día 7', detalle: 'Cobro: $59.88', cobro: true },
];

function PantallaPrecio({ onEmpezar, onAhoraNo }: { onEmpezar: (plan: 'anual' | 'mensual') => void; onAhoraNo: () => void }) {
  const { contenedor, item } = useReveal();
  const [seleccion, setSeleccion] = useState<'anual' | 'mensual'>(() => {
    try {
      return sessionStorage.getItem('refugio-plan') === 'mensual' ? 'mensual' : 'anual';
    } catch {
      return 'anual';
    }
  });
  const plan = PLANES[seleccion];
  // Anti doble toque: el CTA se bloquea y avisa mientras se pasa al siguiente paso.
  const [yendo, setYendo] = useState(false);
  const empezar = () => {
    if (yendo) return;
    setYendo(true);
    onEmpezar(seleccion);
  };

  return (
    <>
      <motion.div variants={contenedor} initial="hidden" animate="visible" className="flex-1">
        <motion.h1
          variants={item}
          className="text-balance text-[26px] font-bold leading-[1.2] text-[var(--text-primary)] [font-family:var(--font-display)]"
        >
          {seleccion === 'anual' ? (
            <>
              Empieza gratis. Sigue por <span className="text-[var(--accent)]">$0.17 al día</span>
            </>
          ) : (
            <>
              Empieza hoy por <span className="text-[var(--accent)]">$7.99 al mes</span>
            </>
          )}
        </motion.h1>

        <motion.div variants={item} className="mt-5 rounded-[var(--radius-card)] bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]">
          {seleccion === 'mensual' ? (
            <div key="mensual" className="px-1 py-1 text-center">
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">Hoy: acceso completo</p>
              <p className="mt-0.5 text-[12px] leading-snug text-[var(--text-secondary)]">
                Se cobra $7.99 hoy y se renueva cada mes. Cancelas cuando quieras.
              </p>
            </div>
          ) : (
          <ol key="anual" className="relative grid grid-cols-3">
            <motion.div
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0 }}
              className="absolute left-[16.67%] right-[16.67%] top-[5px] h-px bg-[color-mix(in_oklab,var(--accent)_45%,transparent)]"
            />
            {PASOS_PRUEBA.map((p, i) => (
              <li key={p.titulo} className="relative flex flex-col items-center text-center">
                <motion.span
                  aria-hidden="true"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`size-[11px] rounded-full ${p.cobro ? 'border-2 border-[var(--accent)] bg-[var(--surface)]' : 'bg-[var(--accent)]'}`}
                />
                <span className="mt-2 text-[13px] font-semibold text-[var(--text-primary)]">{p.titulo}</span>
                <span className="mt-0.5 text-[12px] leading-snug text-[var(--text-secondary)]">{p.detalle}</span>
              </li>
            ))}
          </ol>
          )}
        </motion.div>

        <div className="mt-5 flex flex-col gap-3">
          <motion.button
            type="button"
            variants={item}
            onClick={() => setSeleccion('anual')}
            className="relative text-left outline-none"
            aria-pressed={seleccion === 'anual'}
          >
            <span className="absolute -top-[10px] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--accent-ink)] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--bg)]">
              7 DÍAS GRATIS · MÁS POPULAR
            </span>
            <Hairline
              emphasis={seleccion === 'anual'}
              surface="surface"
              className={`transition-shadow duration-150 ${
                seleccion === 'anual' ? 'shadow-[0_12px_36px_color-mix(in_oklab,var(--accent)_16%,transparent)]' : 'shadow-[var(--shadow-1)]'
              }`}
            >
              <div className="rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--accent)_5%,transparent)] p-5">
                <p className="text-[16px] font-semibold text-[var(--text-primary)]">Anual</p>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                    $4.99
                  </span>
                  <span className="text-[13px] text-[var(--text-secondary)]">/mes</span>
                </p>
                <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Se cobra $59.88/año</p>
                <p className="mt-1 text-[14px] font-semibold text-[var(--accent-ink)]">Ahorras 4 meses</p>
              </div>
            </Hairline>
          </motion.button>
          <motion.button
            type="button"
            variants={item}
            onClick={() => setSeleccion('mensual')}
            aria-pressed={seleccion === 'mensual'}
            className={`rounded-[var(--radius-card)] border-2 bg-[var(--surface)] p-5 text-left outline-none transition-colors duration-150 ${
              seleccion === 'mensual'
                ? 'border-[var(--accent)] shadow-[var(--shadow-1)]'
                : 'border-[color-mix(in_oklab,var(--accent-2)_75%,transparent)]'
            }`}
          >
            <p className="text-[16px] font-semibold text-[var(--text-primary)]">Mensual</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-[32px] font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                $7.99
              </span>
              <span className="text-[13px] text-[var(--text-secondary)]">/mes</span>
            </p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">Se cobra $7.99 cada mes</p>
          </motion.button>
        </div>
      </motion.div>

      <div className="mt-4">
        <CtaFijo disabled={yendo} onClick={empezar}>
          {yendo ? 'Un momento…' : plan.ctaLabel}
        </CtaFijo>
        <p className="mt-2 text-center text-[13px] text-[var(--text-secondary)]">
          {plan.detalle} · Cancela cuando quieras
        </p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[13px] font-medium text-[var(--text-primary)]">
          <ShieldCheck size={16} color="var(--accent-ink)" aria-hidden="true" />
          Garantía del Primer Alivio: tienes 15 días para pedir tu reembolso si no sientes alivio real
        </p>
        <p className="mt-2 text-center">
          <button
            type="button"
            onClick={onAhoraNo}
            className="min-h-11 rounded-[var(--radius-button)] px-4 text-[14px] text-[var(--text-secondary)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Ahora no
          </button>
        </p>
        <p className="text-center text-[14px] text-[var(--text-secondary)]">
          ¿Ya compraste?{' '}
          <a href="/entrar" className="inline-flex min-h-11 items-center font-semibold text-[var(--accent-ink)] underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            Entra aquí
          </a>
        </p>
      </div>
    </>
  );
}

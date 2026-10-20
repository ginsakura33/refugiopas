'use client';

// Para quien ya tiene cuenta pero su acceso no está activo (plan vencido, cancelado, reembolsado o sin
// compra con ese correo). Explica QUÉ pasó en palabras simples, tranquiliza (sus datos siguen guardados)
// y da una salida clara; nunca la trata como una persona nueva.

import { motion } from 'motion/react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useReveal } from '@/components/landing/ui';
import type { PlanReal } from '@/lib/perfil';

const SOPORTE = process.env.NEXT_PUBLIC_SOPORTE_EMAIL;

function textoPorEstado(estado: PlanReal['estado'] | undefined) {
  switch (estado) {
    case 'vencida':
      return {
        titulo: 'Tu plan terminó',
        cuerpo: 'Puede que el último pago no se haya completado o que el plan haya terminado. Renuévalo y vuelves a tu Refugio justo donde lo dejaste.',
        boton: 'Renovar mi plan',
      };
    case 'cancelada':
      return {
        titulo: 'Tu plan ya terminó',
        cuerpo: 'Cancelaste tu plan y el acceso llegó a su fin. Cuando quieras volver, tu Refugio te espera.',
        boton: 'Volver a mi Refugio',
      };
    case 'reembolsada':
      return {
        titulo: 'Esta compra fue reembolsada',
        cuerpo: 'Te devolvimos tu pago, por eso el acceso está cerrado. Si quieres volver, puedes elegir un plan de nuevo.',
        boton: 'Elegir un plan',
      };
    default:
      return {
        titulo: 'No encontramos un plan activo',
        cuerpo: 'Entraste correctamente, pero con este correo no hay una compra activa. Si compraste con otro correo, entra con ese.',
        boton: 'Elegir un plan',
      };
  }
}

export function PantallaAccesoPendiente({
  correo,
  plan,
  saliendo,
  onElegirPlan,
  onSalir,
}: {
  correo: string | null;
  plan: PlanReal | null;
  saliendo: boolean;
  onElegirPlan: () => void;
  onSalir: () => void;
}) {
  const { contenedor, item } = useReveal(0.08);
  const texto = textoPorEstado(plan?.estado);
  return (
    <motion.div variants={contenedor} initial="hidden" animate="visible" className="flex flex-1 flex-col justify-center">
      <motion.h1 variants={item} className="text-[28px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
        {texto.titulo}
      </motion.h1>
      <motion.p variants={item} className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">
        {texto.cuerpo}
      </motion.p>
      {correo && (
        <motion.p variants={item} className="mt-3 text-[13px] text-[var(--text-tertiary)]">
          Entraste como <span className="font-semibold text-[var(--text-secondary)]">{correo}</span>
        </motion.p>
      )}
      <motion.div variants={item} className="mt-5 flex items-start gap-2 rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
        <ShieldCheck size={18} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" className="mt-0.5 shrink-0" />
        <p className="text-[14px] text-[var(--text-secondary)]">Tu diario, tus hábitos y tu racha siguen guardados en tu cuenta. No se pierde nada.</p>
      </motion.div>
      <motion.div variants={item} className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={onElegirPlan}
          className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {texto.boton}
        </button>
        <button
          type="button"
          onClick={onSalir}
          disabled={saliendo}
          className="flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] text-[14px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
        >
          <LogOut size={16} aria-hidden="true" /> {saliendo ? 'Guardando lo tuyo…' : 'Entrar con otro correo'}
        </button>
        {SOPORTE && (
          <a
            href={`mailto:${SOPORTE}`}
            className="flex min-h-11 items-center justify-center text-[13px] font-semibold text-[var(--accent-ink)] underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Escríbenos si crees que es un error
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

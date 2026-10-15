'use client';

// Perfil — cuenta y plan. Sin backend real todavía: "Cerrar sesión" es un mockup honesto que
// vuelve a la landing (Sesión 6 conecta Supabase Auth de verdad, ver ESTADO.md).

import { useRouter } from 'next/navigation';
import { Compass, CreditCard, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { AppShell, Card } from '@/components/app-interna/ui';
import { LogoMarca } from '@/components/Logo';
import { PERFIL_DEMO } from '@/lib/app-demo-data';

export default function PerfilPage() {
  const router = useRouter();

  const filas = [
    { icon: Mail, label: 'Correo', valor: PERFIL_DEMO.email },
    { icon: Compass, label: 'Tu arquetipo', valor: PERFIL_DEMO.arquetipoNombre },
    { icon: CreditCard, label: 'Tu plan', valor: PERFIL_DEMO.plan },
  ];

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">Tu cuenta</h1>
        <LogoMarca size={72} />
      </div>

      <Card className="flex flex-col divide-y divide-[color-mix(in_oklab,var(--text-tertiary)_14%,transparent)]">
        {filas.map((f) => {
          const Icono = f.icon;
          return (
            <div key={f.label} className="flex items-center gap-3 p-4">
              <Icono size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-[12px] text-[var(--text-tertiary)]">{f.label}</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">{f.valor}</p>
              </div>
            </div>
          );
        })}
      </Card>

      <p className="mt-4 flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
        <ShieldCheck size={13} aria-hidden="true" /> Garantía del Primer Alivio · cancela cuando quieras
      </p>

      <button
        type="button"
        onClick={() => router.push('/')}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[14px] font-semibold text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <LogOut size={16} aria-hidden="true" /> Cerrar sesión
      </button>
    </AppShell>
  );
}

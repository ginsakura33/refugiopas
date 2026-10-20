'use client';

// Perfil — cuenta y plan. Sin backend real todavía: "Cerrar sesión" es un mockup honesto que
// vuelve a la landing (Sesión 6 conecta Supabase Auth de verdad, ver ESTADO.md).

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, CreditCard, LogOut, Mail, Megaphone, ShieldCheck } from 'lucide-react';
import { AppShell, Card } from '@/components/app-interna/ui';
import { LogoMarca } from '@/components/Logo';
import { InstalarApp } from '@/components/app-interna/PwaApp';
import { RecordatorioSuave } from '@/components/app-interna/RecordatorioSuave';
import { FotoPerfil } from '@/components/app-interna/FotoPerfil';
import { PERFIL_DEMO } from '@/lib/app-demo-data';
import { createClient } from '@/lib/supabase/client';
import { limpiarDatosLocales, subirPendientes } from '@/lib/datos-nube';

export default function PerfilPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState<string>(PERFIL_DEMO.email);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cierre, setCierre] = useState<'reposo' | 'guardando' | 'aviso'>('reposo');
  const avisoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (cierre === 'aviso') avisoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [cierre]);

  // Correo real de la sesión (si no se puede leer, queda el de ejemplo).
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user?.email) setCorreo(data.user.email);
      });
    // Solo los administradores ven el acceso al panel de anuncios (la base de datos decide).
    createClient()
      .from('admins')
      .select('user_id')
      .maybeSingle()
      .then(({ data }) => setEsAdmin(!!data));
  }, []);

  const cerrarSesion = async (forzar = false) => {
    // Antes de borrar lo del celular se comprueba que todo lo que escribiste ya está en tu cuenta.
    if (!forzar) {
      setCierre('guardando');
      const quedoGuardado = await Promise.race([subirPendientes(), new Promise<boolean>((r) => setTimeout(() => r(false), 8000))]);
      if (!quedoGuardado) {
        setCierre('aviso');
        return;
      }
    }
    // El recordatorio se apaga en este celular antes de cerrar la sesión (privacidad en celulares compartidos).
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/suscribir', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
    } catch {
      /* sin recordatorio activo: nada que apagar */
    }
    await createClient().auth.signOut();
    limpiarDatosLocales(); // tu diario, ánimo y hábitos siguen en tu cuenta; en este celular ya no queda nada tuyo
    // Se borran las pantallas guardadas de esta cuenta (el audio del Orbe se queda).
    try {
      const claves = await caches.keys();
      await Promise.all(claves.filter((k) => k.startsWith('refugio-paginas-')).map((k) => caches.delete(k)));
    } catch {
      /* sin caché del navegador: nada que borrar */
    }
    router.push('/');
    router.refresh();
  };

  const filas = [
    { icon: Mail, label: 'Correo', valor: correo },
    { icon: Compass, label: 'Tu arquetipo', valor: PERFIL_DEMO.arquetipoNombre },
    { icon: CreditCard, label: 'Tu plan', valor: PERFIL_DEMO.plan },
  ];

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">Tu cuenta</h1>
        <LogoMarca size={72} />
      </div>

      <div className="mb-6">
        <FotoPerfil />
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

      {esAdmin && (
        <Link
          href="/app/admin"
          className="mt-4 flex min-h-12 items-center gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-4 text-[15px] font-semibold text-[var(--text-primary)] shadow-[var(--shadow-1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Megaphone size={20} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" /> Panel de anuncios
        </Link>
      )}

      <RecordatorioSuave />

      <InstalarApp siempre />

      {cierre === 'aviso' && (
        <div ref={avisoRef} role="alert" className="mt-8 rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">No pudimos guardar lo último en tu cuenta</p>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Puede que no tengas internet. Si cierras ahora, lo que escribiste hace poco podría no recuperarse. Si no escribiste nada nuevo, puedes cerrar sin problema.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => cerrarSesion()}
              className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[14px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Reintentar guardar
            </button>
            <button
              type="button"
              onClick={() => cerrarSesion(true)}
              className="min-h-12 rounded-[var(--radius-button)] text-[14px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Cerrar sesión igual
            </button>
          </div>
        </div>
      )}

      {cierre !== 'aviso' && (
        <button
          type="button"
          onClick={() => cerrarSesion()}
          disabled={cierre === 'guardando'}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[14px] font-semibold text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
        >
          <LogOut size={16} aria-hidden="true" /> {cierre === 'guardando' ? 'Guardando lo tuyo…' : 'Cerrar sesión'}
        </button>
      )}
    </AppShell>
  );
}

'use client';

// Perfil — cuenta y plan. Sin backend real todavía: "Cerrar sesión" es un mockup honesto que
// vuelve a la landing (Sesión 6 conecta Supabase Auth de verdad, ver ESTADO.md).

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Compass, CreditCard, LogOut, Mail, Megaphone, Pencil, ShieldCheck, UserRound } from 'lucide-react';
import { AppShell, Card } from '@/components/app-interna/ui';
import { LogoMarca } from '@/components/Logo';
import { InstalarApp } from '@/components/app-interna/PwaApp';
import { RecordatorioSuave } from '@/components/app-interna/RecordatorioSuave';
import { FotoPerfil } from '@/components/app-interna/FotoPerfil';
import { ARQUETIPOS } from '@/lib/onboarding-content';
import { describirPlan, guardarNombre, leerPerfil, leerPlan, type PlanReal } from '@/lib/perfil';
import { createClient } from '@/lib/supabase/client';
import { limpiarDatosLocales, subirPendientes } from '@/lib/datos-nube';

export default function PerfilPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState<string>('');
  const [nombre, setNombre] = useState<string | null>(null);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [borradorNombre, setBorradorNombre] = useState('');
  const [errorNombre, setErrorNombre] = useState(false);
  const [arquetipo, setArquetipo] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanReal | null>(null);
  const [cargado, setCargado] = useState(false);
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
    // Nombre, arquetipo y plan REALES de la cuenta.
    Promise.all([leerPerfil(), leerPlan()]).then(([p, pl]) => {
      setNombre(p.nombre);
      setArquetipo(p.arquetipo ? ARQUETIPOS[p.arquetipo].nombre : null);
      setPlan(pl);
      setCargado(true);
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

  const guardarMiNombre = async () => {
    setErrorNombre(false);
    const ok = await guardarNombre(borradorNombre);
    if (!ok) return setErrorNombre(true);
    setNombre(borradorNombre.trim().replace(/s+/g, ' ').slice(0, 40) || null);
    setEditandoNombre(false);
  };

  const filas = [
    { icon: Mail, label: 'Correo', valor: correo || '…' },
    { icon: Compass, label: 'Tu arquetipo', valor: !cargado ? '…' : arquetipo ?? 'Por descubrir' },
    { icon: CreditCard, label: 'Tu plan', valor: !cargado ? '…' : describirPlan(plan) },
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
        <div className="flex items-center gap-3 p-4">
          <UserRound size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <label htmlFor="mi-nombre" className="text-[12px] text-[var(--text-tertiary)]">
              Cómo te llamamos
            </label>
            {editandoNombre ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void guardarMiNombre();
                }}
                className="mt-1 flex items-center gap-2"
              >
                <input
                  id="mi-nombre"
                  autoFocus
                  value={borradorNombre}
                  onChange={(e) => setBorradorNombre(e.target.value)}
                  maxLength={40}
                  autoComplete="given-name"
                  placeholder="Tu nombre"
                  className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3 text-[15px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                />
                <button
                  type="submit"
                  aria-label="Guardar nombre"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-cta)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <Check size={18} color="var(--bg)" aria-hidden="true" />
                </button>
              </form>
            ) : (
              <p id="mi-nombre" className="text-[14px] font-medium text-[var(--text-primary)]">
                {!cargado ? '…' : nombre ?? 'Aún no me has dicho tu nombre'}
              </p>
            )}
            {errorNombre && (
              <p role="alert" className="mt-1 text-[13px] text-[var(--text-secondary)]">
                No pudimos guardar tu nombre. Revisa tu conexión e inténtalo de nuevo.
              </p>
            )}
          </div>
          {!editandoNombre && cargado && (
            <button
              type="button"
              onClick={() => {
                setBorradorNombre(nombre ?? '');
                setEditandoNombre(true);
              }}
              aria-label={nombre ? 'Cambiar mi nombre' : 'Añadir mi nombre'}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <Pencil size={16} aria-hidden="true" />
            </button>
          )}
        </div>
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

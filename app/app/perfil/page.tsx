'use client';

// Perfil — tu espacio: foto y nombre, tu constancia (racha + proceso PAS), tus logros y los ajustes de tu
// cuenta. Estructura inspirada en la referencia de la dueña (cabecera con foto, tarjeta de resumen con
// anillo, cuadrícula de logros, lista de ajustes) y adaptada a una app de calma: sin puntos, niveles ni
// ligas; los logros solo se ganan (nunca se pierden) y los pendientes muestran una pista amable.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Bell, ChevronRight, CreditCard, Download, Flame, Lock, LogOut, Mail, Megaphone, Pencil, ShieldCheck, Trophy } from 'lucide-react';
import { AppShell, Card } from '@/components/app-interna/ui';
import { InstalarApp } from '@/components/app-interna/PwaApp';
import { RecordatorioSuave } from '@/components/app-interna/RecordatorioSuave';
import { AvatarPerfil, useFotoPerfil } from '@/components/app-interna/FotoPerfil';
import { Hairline, useReveal } from '@/components/landing/ui';
import { ARQUETIPOS } from '@/lib/onboarding-content';
import { describirPlan, leerPerfil, leerPlan, type PlanReal } from '@/lib/perfil';
import { calcularResumenPerfil, type ResumenPerfil } from '@/lib/logros';
import { descargarMisDatos } from '@/lib/exportar';
import { createClient } from '@/lib/supabase/client';
import { limpiarDatosLocales, sincronizarTodo, subirPendientes } from '@/lib/datos-nube';

// Anillo de progreso (proceso PAS): el arco se dibuja al cargar; con "reducir movimiento" aparece ya dibujado.
function Anillo({ hechos, total }: { hechos: number; total: number }) {
  const reduce = useReducedMotion() ?? false;
  const R = 24;
  const largo = 2 * Math.PI * R;
  const avance = total > 0 ? hechos / total : 0;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`${hechos} de ${total} módulos completados`} className="shrink-0">
      <circle cx="32" cy="32" r={R} fill="none" stroke="color-mix(in oklab, var(--text-tertiary) 18%, transparent)" strokeWidth="6" />
      <motion.circle
        cx="32"
        cy="32"
        r={R}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={largo}
        initial={{ strokeDashoffset: reduce ? largo * (1 - avance) : largo }}
        animate={{ strokeDashoffset: largo * (1 - avance) }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="37" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--text-primary)" style={{ fontFamily: 'var(--font-display)' }}>
        {hechos}/{total}
      </text>
    </svg>
  );
}

// Coral oscurecido: conserva el tono cálido de la marca y supera el contraste AA sobre fondo blanco.
const COLOR_SUAVE = 'color-mix(in oklab, var(--logo-cor-2) 55%, black)';

const CLASE_FILA =
  'flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] px-4 text-left shadow-[var(--shadow-1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

function FilaAjuste({ icono: Icono, texto, detalle, onClick, href, tono = 'normal', cargando = false }: {
  icono: typeof Bell;
  texto: string;
  detalle?: string;
  onClick?: () => void;
  href?: string;
  tono?: 'normal' | 'suave';
  cargando?: boolean;
}) {
  const color = tono === 'suave' ? COLOR_SUAVE : 'var(--accent-ink)';
  const cuerpo: ReactNode = (
    <>
      <Icono size={18} strokeWidth={1.8} color={color} aria-hidden="true" />
      <span className="flex-1">
        <span className="block text-[15px] font-medium text-[var(--text-primary)]" style={tono === 'suave' ? { color: COLOR_SUAVE } : undefined}>
          {texto}
        </span>
        {detalle && <span className="block text-[13px] text-[var(--text-secondary)]">{detalle}</span>}
      </span>
      {tono === 'normal' && <ChevronRight size={16} color="var(--text-tertiary)" aria-hidden="true" />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={CLASE_FILA}>
        {cuerpo}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={cargando} className={`${CLASE_FILA} disabled:opacity-60`}>
      {cuerpo}
    </button>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const { contenedor, item } = useReveal(0.06);
  const [correo, setCorreo] = useState<string>('');
  const [nombre, setNombre] = useState<string | null>(null);
  const foto = useFotoPerfil();
  const [arquetipo, setArquetipo] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanReal | null>(null);
  const [cargado, setCargado] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [resumen, setResumen] = useState<ResumenPerfil | null>(null);
  const [descarga, setDescarga] = useState<'reposo' | 'preparando' | 'lista' | 'error'>('reposo');
  const [cierre, setCierre] = useState<'reposo' | 'guardando' | 'aviso'>('reposo');
  const avisoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cierre === 'aviso') avisoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [cierre]);

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
    // Constancia y logros: primero con lo que hay en el celular y luego con lo que traiga la cuenta.
    setResumen(calcularResumenPerfil());
    sincronizarTodo().then((cambio) => {
      if (cambio) setResumen(calcularResumenPerfil());
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

  const bajarDatos = async () => {
    setDescarga('preparando');
    const ok = await descargarMisDatos();
    setDescarga(ok ? 'lista' : 'error');
  };

  const logrados = resumen?.logros.filter((l) => l.logrado).length ?? 0;
  const tipo = arquetipo ? arquetipo.replace(/^el /i, '').replace(/^./, (c) => c.toUpperCase()) : null;

  return (
    <AppShell>
      <motion.div variants={contenedor} initial="hidden" animate="visible" className="flex flex-col">
        {/* Cabecera: foto + nombre + tipo */}
        <motion.div variants={item} className="mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/app/perfil/editar"
              aria-label="Editar perfil: cambiar tu foto o tu nombre"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <AvatarPerfil url={foto.url} subiendo={foto.subiendo} camarita />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[24px] font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)]">
                {!cargado ? '…' : nombre ?? 'Tu cuenta'}
              </h1>
              <p className="mt-0.5 text-[15px] text-[var(--text-secondary)]">
                {!cargado ? ' ' : tipo ? `Alma ${tipo.replace(/^Alma /, '')}` : 'Tu tipo de alma sensible, por descubrir'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Resumen: constancia + proceso PAS */}
        <motion.div variants={item}>
          <Hairline emphasis surface="surface" className="shadow-[var(--shadow-2)]">
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Flame size={22} strokeWidth={1.8} color="var(--accent)" fill="color-mix(in oklab, var(--accent-cta) 40%, transparent)" aria-hidden="true" />
                  <span className="text-[24px] font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">{resumen?.racha.actual ?? 0}</span>
                  <span className="text-[14px] text-[var(--text-secondary)]">{resumen?.racha.actual === 1 ? 'día' : 'días'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={20} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />
                  <span className="text-[20px] font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">{resumen?.racha.mejor ?? 0}</span>
                  <span className="text-[14px] text-[var(--text-secondary)]">mejor racha</span>
                </div>
              </div>
              <Link
                href="/app/modulos"
                className="mt-4 flex min-h-16 items-center gap-4 rounded-[var(--radius-button)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <Anillo hechos={resumen?.modulosHechos ?? 0} total={resumen?.modulosTotal ?? 4} />
                <span className="flex-1">
                  <span className="block text-[16px] font-semibold text-[var(--text-primary)]">Tu proceso PAS</span>
                  <span className="block text-[13px] text-[var(--text-secondary)]">
                    {resumen?.modulosHechos ?? 0} de {resumen?.modulosTotal ?? 4} módulos completados
                  </span>
                </span>
                <ChevronRight size={16} color="var(--text-tertiary)" aria-hidden="true" />
              </Link>
            </div>
          </Hairline>
        </motion.div>

        {/* Logros */}
        <motion.section variants={item} aria-labelledby="logros" className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 id="logros" className="text-[20px] font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
              Tus logros
            </h2>
            <span className="text-[13px] text-[var(--text-secondary)]">
              {logrados}/{resumen?.logros.length ?? 6}
            </span>
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {(resumen?.logros ?? []).map((l) => {
              const Icono = l.icono;
              return (
                <li
                  key={l.id}
                  aria-label={`${l.titulo}: ${l.logrado ? 'conseguido' : `pendiente, ${l.pista}`}`}
                  className="flex flex-col items-center rounded-[var(--radius-card)] bg-[var(--surface)] px-2 py-4 text-center shadow-[var(--shadow-1)]"
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-12 items-center justify-center rounded-full ${
                      l.logrado
                        ? 'bg-[var(--surface)] shadow-[var(--shadow-2)] ring-1 ring-[color-mix(in_oklab,var(--accent)_35%,transparent)]'
                        : 'bg-[var(--surface-2)]'
                    }`}
                  >
                    {l.logrado ? (
                      <Icono size={22} strokeWidth={1.8} color="var(--accent)" />
                    ) : (
                      <Lock size={18} strokeWidth={1.8} color="var(--text-tertiary)" />
                    )}
                  </span>
                  <span className="mt-2 text-[13px] font-semibold leading-tight text-[var(--text-primary)]">{l.titulo}</span>
                  {!l.logrado && <span className="mt-1 text-[12px] leading-tight text-[var(--text-secondary)]">{l.pista}</span>}
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* Mi cuenta */}
        <motion.section variants={item} aria-labelledby="cuenta" className="mt-8">
          <h2 id="cuenta" className="text-[20px] font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
            Mi cuenta
          </h2>
          <Card className="mt-4 flex flex-col divide-y divide-[color-mix(in_oklab,var(--text-tertiary)_14%,transparent)]">
            <div className="flex items-center gap-3 p-4">
              <Mail size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-[var(--text-tertiary)]">Correo</p>
                <p className="break-words text-[14px] font-medium text-[var(--text-primary)]">{correo || '…'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <CreditCard size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-[var(--text-tertiary)]">Tu plan</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">{!cargado ? '…' : describirPlan(plan)}</p>
              </div>
            </div>
          </Card>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
            <ShieldCheck size={13} aria-hidden="true" /> Garantía del Primer Alivio · cancela cuando quieras
          </p>
        </motion.section>

        {/* Ajustes */}
        <motion.section variants={item} aria-labelledby="ajustes" className="mt-8 flex flex-col gap-3">
          <h2 id="ajustes" className="text-[20px] font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
            Ajustes
          </h2>

          <FilaAjuste icono={Pencil} texto="Editar perfil" detalle="Tu foto y tu nombre" href="/app/perfil/editar" />

          <RecordatorioSuave />
          <FilaAjuste icono={Bell} texto="Novedades" detalle="Clases, talleres y audios nuevos" href="/app/novedades" />
          <InstalarApp siempre />
          <FilaAjuste
            icono={Download}
            texto="Descargar mi diario y mis datos"
            detalle={
              descarga === 'preparando'
                ? 'Preparando tu archivo…'
                : descarga === 'lista'
                  ? 'Listo: ábrelo desde tus descargas'
                  : descarga === 'error'
                    ? 'No pudimos prepararlo. Toca para reintentar'
                    : 'Un documento para leer, guardar o imprimir'
            }
            onClick={bajarDatos}
            cargando={descarga === 'preparando'}
          />
          {esAdmin && <FilaAjuste icono={Megaphone} texto="Panel de anuncios" detalle="Publicar novedades para tus alumnas" href="/app/admin" />}
        </motion.section>

        {/* Cerrar sesión */}
        <motion.div variants={item} className="mt-8">
          {cierre === 'aviso' ? (
            <div ref={avisoRef} role="alert" className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
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
          ) : (
            <FilaAjuste
              icono={LogOut}
              texto={cierre === 'guardando' ? 'Guardando lo tuyo…' : 'Cerrar sesión'}
              tono="suave"
              onClick={() => cerrarSesion()}
              cargando={cierre === 'guardando'}
            />
          )}
        </motion.div>
      </motion.div>
    </AppShell>
  );
}

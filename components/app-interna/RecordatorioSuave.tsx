'use client';

// Recordatorio suave (notificación push): la persona elige la hora y puede apagarlo cuando quiera.
// Pide permiso con calma, solo al tocar el botón. En iPhone solo funciona con la app instalada.

import { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Card } from '@/components/app-interna/ui';
import { createClient } from '@/lib/supabase/client';

const CLAVE_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Estado = 'cargando' | 'sinSoporte' | 'instalarPrimero' | 'apagado' | 'activo' | 'bloqueado' | 'trabajando';

function aUint8(base64: string): Uint8Array<ArrayBuffer> {
  const relleno = '='.repeat((4 - (base64.length % 4)) % 4);
  const crudo = atob((base64 + relleno).replace(/-/g, '+').replace(/_/g, '/'));
  const salida = new Uint8Array(new ArrayBuffer(crudo.length));
  for (let i = 0; i < crudo.length; i++) salida[i] = crudo.charCodeAt(i);
  return salida;
}

export function RecordatorioSuave() {
  const [estado, setEstado] = useState<Estado>('cargando');
  const [hora, setHora] = useState('20:00');
  const [mensaje, setMensaje] = useState('');

  const revisar = useCallback(async () => {
    const soporta = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!CLAVE_PUBLICA;
    const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const instalada =
      window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (esIOS && !instalada) return setEstado('instalarPrimero');
    if (!soporta) return setEstado('sinSoporte');
    if (Notification.permission === 'denied') return setEstado('bloqueado');

    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    const { data } = await createClient().from('recordatorio_prefs').select('activo, hora').maybeSingle();
    if (data?.hora) setHora(data.hora);
    setEstado(sub && data?.activo ? 'activo' : 'apagado');
  }, []);

  useEffect(() => {
    revisar().catch(() => setEstado('sinSoporte'));
  }, [revisar]);

  const activar = async () => {
    setMensaje('');
    setEstado('trabajando');
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') return setEstado(permiso === 'denied' ? 'bloqueado' : 'apagado');
      const reg = await navigator.serviceWorker.ready;
      const previa = await reg.pushManager.getSubscription();
      const sub = previa ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aUint8(CLAVE_PUBLICA!) }));
      const r = await fetch('/api/push/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), hora, zona: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      });
      if (!r.ok) {
        setMensaje(r.status === 409 ? 'Este celular ya está asociado a otra cuenta. Cierra esa sesión primero.' : 'No pudimos activarlo. Inténtalo de nuevo en un momento.');
        return setEstado('apagado');
      }
      setEstado('activo');
    } catch {
      setMensaje('No pudimos activarlo. Inténtalo de nuevo en un momento.');
      setEstado('apagado');
    }
  };

  const apagar = async () => {
    setMensaje('');
    setEstado('trabajando');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      await fetch('/api/push/suscribir', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub ? { endpoint: sub.endpoint } : {}),
      });
      await sub?.unsubscribe();
    } catch {
      /* si algo falla aquí, el servidor ya no enviará: el permiso se marcó apagado */
    }
    setEstado('apagado');
  };

  if (estado === 'cargando' || estado === 'sinSoporte') return null;

  return (
    <Card className="mt-4 p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
        >
          {estado === 'activo' ? <Bell size={20} strokeWidth={1.8} color="var(--accent-ink)" /> : <BellOff size={20} strokeWidth={1.8} color="var(--text-secondary)" />}
        </span>
        <div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">Recordatorio suave</p>
          <p className="mt-1 text-[13px] leading-snug text-[var(--text-secondary)]">
            {estado === 'activo'
              ? `Te escribiremos una vez al día, a las ${hora}. Puedes apagarlo cuando quieras.`
              : 'Un aviso amable, una vez al día y a la hora que elijas. Sin presión.'}
          </p>
        </div>
      </div>

      {estado === 'instalarPrimero' && (
        <p className="mt-3 text-[13px] leading-snug text-[var(--text-primary)]">
          En iPhone, primero instala la app: toca <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>. Después vuelve aquí.
        </p>
      )}
      {estado === 'bloqueado' && (
        <p className="mt-3 text-[13px] leading-snug text-[var(--text-primary)]">
          Los avisos de Refugio PAS están bloqueados en tu celular. Actívalos en los ajustes del navegador o de la app y vuelve aquí.
        </p>
      )}

      {(estado === 'apagado' || estado === 'activo' || estado === 'trabajando') && (
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex items-center justify-between gap-3 text-[14px] text-[var(--text-primary)]">
            ¿A qué hora?
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              disabled={estado === 'trabajando'}
              className="h-11 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-[16px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={activar}
              disabled={estado === 'trabajando' || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(hora)}
              className="flex h-12 flex-1 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[15px] font-semibold text-[var(--text-primary)] ring-1 ring-inset ring-[var(--accent-ink)] outline-none focus-visible:ring-2 disabled:opacity-60"
            >
              {estado === 'trabajando' ? 'Un momento…' : estado === 'activo' ? 'Guardar nueva hora' : 'Activar recordatorio'}
            </button>
            {estado === 'activo' && (
              <button
                type="button"
                onClick={apagar}
                className="h-12 rounded-[var(--radius-button)] px-4 text-[15px] font-medium text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                Apagar
              </button>
            )}
          </div>
        </div>
      )}
      {mensaje && (
        <p role="alert" className="mt-3 text-[13px] text-[var(--accent-ink)]">
          {mensaje}
        </p>
      )}
    </Card>
  );
}

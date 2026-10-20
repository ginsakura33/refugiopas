'use client';

// Ingreso con enlace "de mano" (token_hash). El enlace solo se gasta al TOCAR el botón (las vistas
// previas y los antivirus del correo abren enlaces pero no tocan botones). La validación se hace en
// el propio navegador de la persona, así la sesión queda guardada ahí mismo; si algo falla se muestra
// el motivo real. Solo acepta enlaces de ingreso (magiclink / email).

import { useEffect, useRef, useState } from 'react';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { LogoMarca } from '@/components/Logo';

const TIPOS = ['magiclink', 'email'];

export default function ConfirmarPage() {
  const [datos, setDatos] = useState<{ tokenHash: string; tipo: string } | null>(null);
  const [estado, setEstado] = useState<'listo' | 'entrando' | 'error'>('listo');
  const [detalle, setDetalle] = useState('');
  const bloqueado = useRef(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const tokenHash = p.get('token_hash') ?? '';
    const tipo = p.get('type') ?? '';
    if (tokenHash && TIPOS.includes(tipo)) setDatos({ tokenHash, tipo });
    else window.location.replace('/entrar?error=enlace');
  }, []);

  const entrar = async () => {
    if (!datos || bloqueado.current) return;
    bloqueado.current = true;
    setEstado('entrando');
    const { error } = await createClient().auth.verifyOtp({ token_hash: datos.tokenHash, type: datos.tipo as EmailOtpType });
    if (error) {
      setDetalle(`${error.message}${error.code ? ` (${error.code})` : ''}`);
      setEstado('error');
      bloqueado.current = false;
      return;
    }
    window.location.replace('/app');
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[var(--bg)] px-4 text-center">
      <LogoMarca size={96} />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">Refugio PAS</h1>
        <p className="mt-2 text-[15px] text-[var(--text-secondary)]">Toca el botón para entrar a tu espacio.</p>
      </div>
      <button
        type="button"
        onClick={entrar}
        disabled={!datos || estado === 'entrando'}
        className="min-h-12 w-full max-w-[320px] rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
      >
        {estado === 'entrando' ? 'Entrando…' : 'Entrar'}
      </button>
      {estado === 'error' && (
        <p role="alert" className="max-w-[320px] text-[14px] text-[var(--text-secondary)]">
          Ese enlace ya se usó o venció. Pide uno nuevo. <span className="block text-[12px] text-[var(--text-tertiary)]">Detalle: {detalle} · llave {datos?.tokenHash.slice(0, 8)}…{datos?.tokenHash.length}</span>
        </p>
      )}
    </main>
  );
}

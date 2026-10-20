'use client';

// PANTALLA DE LOGIN — Sesión 4 (ver docs/sistema/50 sección E). Magic link por email como
// método primario (decisión de ESTADO.md: Supabase Auth con magic link + Google OAuth).
// Conectado a Supabase Auth (Sesión 6): envía el enlace de acceso real por correo. El botón de
// Google solo aparece cuando NEXT_PUBLIC_AUTH_GOOGLE=1 (cuando el proveedor esté configurado).
// Además del enlace, la persona puede entrar ESCRIBIENDO el código de 6 dígitos del mismo correo: así
// funciona también en una app instalada o en otro navegador, donde el enlace no siempre puede completarse.

import { LogoMarca } from '@/components/Logo';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Estado = 'idle' | 'enviando' | 'enviado' | 'error';
const GOOGLE_ACTIVO = process.env.NEXT_PUBLIC_AUTH_GOOGLE === '1';

export default function EntrarPage() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');

  const [mensajeError, setMensajeError] = useState('');
  const [codigo, setCodigo] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'enlace') {
      setEstado('error');
      setMensajeError('Ese enlace ya se usó o venció. Pide uno nuevo y ábrelo desde el mismo dispositivo.');
    }
  }, []);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || estado === 'enviando') return;
    setEstado('enviando');
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      // Solo entra quien ya tiene cuenta (se crea al comprar). Nadie se registra por aquí.
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    // Respuesta UNIFORME exista o no la cuenta (no revela quién compró): salvo límite de envíos.
    if (error && error.status !== 429) {
      setEstado('enviado');
      return;
    }
    if (error) {
      setEstado('error');
      setMensajeError(
        error.status === 429
          ? 'Pediste varios enlaces seguidos. Espera unos minutos y vuelve a intentarlo.'
          : 'No pudimos enviar el enlace. Revisa tu correo e inténtalo de nuevo.'
      );
      return;
    }
    setEstado('enviado');
  };

  const entrarConCodigo = async (e: FormEvent) => {
    e.preventDefault();
    const token = codigo.replace(/s/g, '');
    if (!/^d{6,8}$/.test(token) || verificando) return;
    setErrorCodigo('');
    setVerificando(true);
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token, type: 'email' });
    if (error) {
      setErrorCodigo('Ese código no es correcto o ya venció. Usa el del último correo que te llegó.');
      setVerificando(false);
      return;
    }
    window.location.assign('/app'); // recarga completa: el servidor ya ve la sesión
  };

  const conGoogle = async () => {
    await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-[16px] font-semibold text-[var(--text-primary)]">
          <LogoMarca size={56} />
          <span className="sr-only">Refugio PAS</span>
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-4 pb-10 pt-6">
        {estado !== 'enviado' ? (
          <>
            <h1 className="text-[26px] font-bold leading-[1.2] text-[var(--text-primary)] [font-family:var(--font-display)]">
              Entra a tu Refugio
            </h1>
            <p className="mt-2 text-[14px] leading-snug text-[var(--text-secondary)]">
              Para guardarlo y verlo en cualquier dispositivo
            </p>

            {estado === 'error' && (
              <p role="alert" className="mt-6 rounded-[var(--radius-button)] bg-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] px-4 py-3 text-[14px] leading-snug text-[var(--text-primary)]">
                {mensajeError}
              </p>
            )}

            <form onSubmit={enviar} className={`${estado === 'error' ? 'mt-4' : 'mt-8'} flex flex-col gap-3`}>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="h-14 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 text-[16px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={estado === 'enviando'}
                className={`flex h-[52px] w-full items-center justify-center rounded-[var(--radius-button)] text-[17px] font-semibold outline-none transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] focus-visible:ring-offset-2 ${
                  estado === 'enviando'
                    ? 'cursor-not-allowed bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] text-[var(--text-primary)] opacity-65'
                    : 'bg-[var(--accent-cta)] ring-1 ring-inset ring-[var(--accent-ink)] text-[var(--text-primary)] hover:bg-[color-mix(in_oklab,var(--accent-cta)_90%,white)]'
                }`}
              >
                {estado === 'enviando' ? 'Enviando…' : 'Enviarme mi enlace de acceso'}
              </button>
            </form>

            {GOOGLE_ACTIVO && (
            <button
              type="button"
              onClick={conGoogle}
              className="mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] text-[15px] font-medium text-[var(--text-primary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <span aria-hidden="true" className="text-[16px] font-bold">G</span>
              Continuar con Google
            </button>
            )}

            <p className="mt-4 flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)]">
              <Lock size={14} aria-hidden="true" /> Sin contraseñas: te llegará un enlace de un solo uso
            </p>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
            >
              <Mail size={28} color="var(--accent)" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-[22px] font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
              Revisa tu correo
            </h1>
            <p className="mt-2 max-w-[34ch] text-[15px] leading-snug text-[var(--text-secondary)]">
              Si {email} tiene una compra activa, el enlace llega en unos minutos. Revisa también spam y promociones.
            </p>

            <form onSubmit={entrarConCodigo} className="mt-8 flex w-full flex-col gap-3 text-left">
              <label htmlFor="codigo" className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
                <KeyRound size={16} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" /> ¿Prefieres escribir el código?
              </label>
              <p className="text-[13px] leading-snug text-[var(--text-secondary)]">
                En el mismo correo viene un código de 6 dígitos. Escríbelo aquí: es lo más seguro si usas la app instalada.
              </p>
              <input
                id="codigo"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/[^ds]/g, ''));
                  setErrorCodigo('');
                }}
                placeholder="123456"
                className="h-14 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 text-center text-[24px] font-semibold tracking-[0.3em] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
              {errorCodigo && (
                <p role="alert" className="text-[14px] text-[var(--accent-ink)]">
                  {errorCodigo}
                </p>
              )}
              <button
                type="submit"
                disabled={verificando || !/^d{6,8}$/.test(codigo.replace(/s/g, ''))}
                className="flex h-[52px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[17px] font-semibold text-[var(--text-primary)] ring-1 ring-inset ring-[var(--accent-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {verificando ? 'Entrando…' : 'Entrar con el código'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

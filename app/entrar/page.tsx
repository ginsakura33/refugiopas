'use client';

// PANTALLA DE LOGIN — Sesión 4 (ver docs/sistema/50 sección E). Magic link por email como
// método primario (decisión de ESTADO.md: Supabase Auth con magic link + Google OAuth).
// ⚠️ Supabase todavía NO está conectado (llega en Sesión 6): el formulario simula los 3
// estados (enviando/enviado/error) con estado local, sin backend real todavía.

import { LogoMarca } from '@/components/Logo';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Mail, Lock } from 'lucide-react';

type Estado = 'idle' | 'enviando' | 'enviado';

export default function EntrarPage() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEstado('enviando');
    setTimeout(() => setEstado('enviado'), 900);
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

            <form onSubmit={enviar} className="mt-8 flex flex-col gap-3">
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

            <button
              type="button"
              className="mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] text-[15px] font-medium text-[var(--text-primary)] outline-none hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <span aria-hidden="true" className="text-[16px] font-bold">G</span>
              Continuar con Google
            </button>

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
            <p className="mt-2 max-w-[32ch] text-[15px] leading-snug text-[var(--text-secondary)]">
              Te enviamos el enlace a {email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

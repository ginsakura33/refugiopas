'use client';

// Editar perfil — todo lo que la persona puede cambiar de sí misma, en un solo lugar: su foto (cambiar o quitar)
// y cómo la llamamos. Antes estaba repartido entre la cabecera del Perfil y una fila de Ajustes.

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { AppShell, Card, ScreenTitle } from '@/components/app-interna/ui';
import { EditorFoto } from '@/components/app-interna/FotoPerfil';
import { guardarNombre, leerPerfil } from '@/lib/perfil';

const limpiar = (t: string) => t.trim().replace(/\s+/g, ' ').slice(0, 40);

export default function EditarPerfilPage() {
  const [actual, setActual] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [cargado, setCargado] = useState(false);
  const [estado, setEstado] = useState<'reposo' | 'guardando' | 'guardado' | 'error'>('reposo');

  useEffect(() => {
    leerPerfil().then((p) => {
      setActual(p.nombre);
      setTexto(p.nombre ?? '');
      setCargado(true);
    });
  }, []);

  const sinCambios = limpiar(texto) === (actual ?? '');

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (sinCambios || estado === 'guardando') return;
    setEstado('guardando');
    const r = await guardarNombre(texto);
    if (!r.ok) return setEstado('error');
    setActual(r.nombre);
    setTexto(r.nombre ?? '');
    setEstado('guardado');
  };

  return (
    <AppShell>
      <Link
        href="/app/perfil"
        className="mb-4 flex min-h-11 w-fit items-center gap-1.5 rounded-[var(--radius-button)] pr-3 text-[13px] font-medium text-[var(--text-tertiary)] outline-none hover:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Tu perfil
      </Link>

      <ScreenTitle subtitulo="Tu foto y cómo te llamamos">Editar perfil</ScreenTitle>

      <Card className="p-5">
        <EditorFoto />
      </Card>

      <Card className="mt-4 p-5">
        <form onSubmit={guardar}>
          <label htmlFor="mi-nombre" className="text-[15px] font-semibold text-[var(--text-primary)]">
            ¿Cómo quieres que te llamemos?
          </label>
          <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">Así te saludamos en Inicio.</p>
          <input
            id="mi-nombre"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              if (estado !== 'reposo') setEstado('reposo');
            }}
            maxLength={40}
            autoComplete="given-name"
            placeholder="Tu nombre"
            disabled={!cargado}
            className="mt-3 min-h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3 text-[16px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!cargado || sinCambios || estado === 'guardando'}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[16px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
          >
            <Check size={18} aria-hidden="true" /> {estado === 'guardando' ? 'Guardando…' : 'Guardar nombre'}
          </button>
          {estado === 'guardado' && (
            <p role="status" className="mt-3 text-center text-[14px] text-[var(--accent-ink)]">
              {actual ? `Listo, te llamaremos ${actual}.` : 'Listo: ya no tienes un nombre guardado.'}
            </p>
          )}
          {estado === 'error' && (
            <p role="alert" className="mt-3 text-center text-[14px] text-[var(--text-secondary)]">
              No pudimos guardar tu nombre. Revisa tu conexión e inténtalo de nuevo.
            </p>
          )}
        </form>
      </Card>
    </AppShell>
  );
}

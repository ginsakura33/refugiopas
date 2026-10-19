'use client';

// Panel privado de anuncios (solo administradores). Si la persona no es admin, vuelve a Inicio.
// Publicar crea un anuncio que aparece en Novedades de las personas elegidas; "Archivar" lo oculta.

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, Megaphone, Send } from 'lucide-react';
import { AppShell, Card, ScreenTitle } from '@/components/app-interna/ui';
import { fechaEvento, fechaRelativa, type Anuncio } from '@/lib/novedades';

const CAMPO =
  'mt-2 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-4 text-[16px] text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export default function AdminPage() {
  const router = useRouter();
  const [lista, setLista] = useState<Anuncio[] | null>(null);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [audiencia, setAudiencia] = useState<'todos' | 'anual'>('todos');
  const [enlace, setEnlace] = useState('');
  const [boton, setBoton] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    const r = await fetch('/api/admin/anuncios');
    if (r.status === 403 || r.status === 401) return router.replace('/app');
    if (r.ok) setLista(((await r.json()) as { anuncios: Anuncio[] }).anuncios);
  }, [router]);

  useEffect(() => {
    cargar().catch(() => setLista([]));
  }, [cargar]);

  const publicar = async (e: FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setError('');
    setOk('');
    setEnviando(true);
    try {
      const r = await fetch('/api/admin/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, mensaje, audiencia, enlace, boton, fecha_evento: fecha ? new Date(fecha).toISOString() : undefined }),
      });
      const datos = (await r.json()) as { error?: string };
      if (!r.ok) {
        setError(datos.error ?? 'No se pudo publicar.');
        return;
      }
      setTitulo('');
      setMensaje('');
      setEnlace('');
      setBoton('');
      setFecha('');
      setAudiencia('todos');
      setOk('Anuncio publicado. Ya aparece en Novedades.');
      await cargar();
    } catch {
      setError('No se pudo publicar. Revisa tu conexión.');
    } finally {
      setEnviando(false);
    }
  };

  const cambiar = async (id: string, activo: boolean) => {
    await fetch('/api/admin/anuncios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, activo }) });
    await cargar();
  };

  return (
    <AppShell>
      <ScreenTitle subtitulo="Solo tú ves esta pantalla">Panel de anuncios</ScreenTitle>

      <Card className="p-5">
        <form onSubmit={publicar} className="flex flex-col gap-4">
          <label className="text-[14px] font-semibold text-[var(--text-primary)]">
            Título
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} required placeholder="Ej: Taller de respiración en vivo" className={`${CAMPO} h-12`} />
          </label>
          <label className="text-[14px] font-semibold text-[var(--text-primary)]">
            Mensaje
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} maxLength={600} required rows={4} placeholder="Cuenta qué es, para quién y qué se llevan." className={`${CAMPO} py-3`} />
            <span className="mt-1 block text-right text-[12px] font-normal text-[var(--text-tertiary)]">{mensaje.length}/600</span>
          </label>

          <fieldset>
            <legend className="text-[14px] font-semibold text-[var(--text-primary)]">¿Quién lo ve?</legend>
            <div className="mt-2 flex gap-2">
              {(['todos', 'anual'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAudiencia(v)}
                  aria-pressed={audiencia === v}
                  className={`min-h-11 flex-1 rounded-[var(--radius-button)] border px-3 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    audiencia === v
                      ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--accent-ink)]'
                      : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
                  }`}
                >
                  {v === 'todos' ? 'Todas las personas' : 'Solo plan anual'}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="text-[14px] font-semibold text-[var(--text-primary)]">
            Fecha y hora del evento <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
            <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${CAMPO} h-12`} />
          </label>
          <label className="text-[14px] font-semibold text-[var(--text-primary)]">
            Enlace del botón <span className="font-normal text-[var(--text-tertiary)]">(opcional, debe empezar con https://)</span>
            <input type="url" value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="https://pay.hotmart.com/…" className={`${CAMPO} h-12`} />
          </label>
          {enlace.trim() && (
            <label className="text-[14px] font-semibold text-[var(--text-primary)]">
              Texto del botón
              <input value={boton} onChange={(e) => setBoton(e.target.value)} maxLength={30} placeholder="Ej: Reservar mi lugar" className={`${CAMPO} h-12`} />
            </label>
          )}

          {error && (
            <p role="alert" className="text-[14px] text-[var(--accent-ink)]">
              {error}
            </p>
          )}
          {ok && (
            <p role="status" className="text-[14px] font-medium text-[var(--accent-ink)]">
              {ok}
            </p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] text-[15px] font-semibold text-[var(--text-primary)] ring-1 ring-inset ring-[var(--accent-ink)] outline-none focus-visible:ring-2 disabled:opacity-60"
          >
            <Send size={16} strokeWidth={1.8} aria-hidden="true" /> {enviando ? 'Publicando…' : 'Publicar anuncio'}
          </button>
        </form>
      </Card>

      <h2 className="mb-3 mt-8 text-[20px] font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">Tus anuncios</h2>
      {lista === null ? (
        <div className="h-20 animate-pulse rounded-[var(--radius-card)] bg-[color-mix(in_oklab,var(--text-tertiary)_12%,transparent)]" aria-hidden="true" />
      ) : lista.length === 0 ? (
        <p className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
          <Megaphone size={16} aria-hidden="true" /> Todavía no has publicado ninguno.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((a) => (
            <Card key={a.id} className={`p-4 ${a.activo ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-[15px] font-semibold text-[var(--text-primary)]">{a.titulo}</p>
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                    {fechaRelativa(a.publicado_at)} · {a.audiencia === 'anual' ? 'Solo plan anual' : 'Todas las personas'}
                    {a.fecha_evento ? ` · ${fechaEvento(a.fecha_evento)}` : ''}
                    {!a.activo ? ' · Archivado' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cambiar(a.id, !a.activo)}
                  aria-label={a.activo ? `Archivar ${a.titulo}` : `Publicar de nuevo ${a.titulo}`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full outline-none hover:bg-[var(--chip-bg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  {a.activo ? <Archive size={18} strokeWidth={1.8} color="var(--text-secondary)" aria-hidden="true" /> : <ArchiveRestore size={18} strokeWidth={1.8} color="var(--accent-ink)" aria-hidden="true" />}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

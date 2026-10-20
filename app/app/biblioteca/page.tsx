'use client';

// Biblioteca — audios de autohipnosis guiada. Los audios que ya están grabados y subidos se pueden escuchar
// (con el registro de calma de 1 a 10 antes y después); los que aún no, aparecen como "Próximamente", nunca como
// un audio de mentira. Debajo, "Tu registro": cómo cambia la calma de la persona con cada audio.

import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, Headphones, Hourglass, Play, Sparkles, TrendingUp } from 'lucide-react';
import { AppShell, Card, ScreenTitle } from '@/components/app-interna/ui';
import { ReproductorAudio } from '@/components/app-interna/ReproductorAudio';
import { AUDIOS, type CategoriaAudio } from '@/lib/app-demo-data';
import { sincronizarTodo } from '@/lib/datos-nube';
import { leerSesiones, resumirSesiones, type SesionAudio } from '@/lib/sesiones-audio';

const CATEGORIA_LABEL: Record<CategoriaAudio, string> = { sos: 'SOS', biblioteca: 'Biblioteca' };
const FECHA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

export default function BibliotecaPage() {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [sesiones, setSesiones] = useState<SesionAudio[]>([]);

  useEffect(() => {
    setSesiones(leerSesiones());
    // Recupera de la cuenta los registros que falten en este celular (por ejemplo, tras reinstalar).
    sincronizarTodo().then((cambio) => {
      if (cambio) setSesiones(leerSesiones());
    });
  }, []);

  const disponibles = AUDIOS.filter((a) => a.src);
  const proximos = AUDIOS.filter((a) => !a.src);
  const ordenados = [...disponibles, ...proximos];
  const resumen = resumirSesiones(sesiones);
  const tituloDe = (id: string) => AUDIOS.find((a) => a.id === id)?.titulo ?? 'Audio';

  return (
    <AppShell>
      <ScreenTitle
        subtitulo={`${disponibles.length} ${disponibles.length === 1 ? 'audio disponible' : 'audios disponibles'}${proximos.length ? ` · ${proximos.length} próximamente` : ''}, guiados por Psic. Ginette Rivas`}
      >
        Tu biblioteca
      </ScreenTitle>

      <p className="-mt-2 mb-5 flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--chip-bg)] px-4 py-3 text-[13px] font-medium leading-snug text-[var(--text-primary)]">
        <Headphones size={18} strokeWidth={1.8} color="var(--accent-ink)" className="shrink-0" aria-hidden="true" />
        Utiliza audífonos para una experiencia más inmersiva.
      </p>

      <div className="flex flex-col gap-3">
        {ordenados.map((a) => {
          const listo = !!a.src;
          const expandido = abierto === a.id;
          const suyas = resumirSesiones(sesiones, a.id);
          const cuerpo = (
            <>
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
              >
                {listo ? <Play size={18} strokeWidth={1.8} color="var(--accent)" /> : <Hourglass size={18} strokeWidth={1.8} color="var(--text-tertiary)" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] px-2 py-0.5 text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--text-primary)]">
                    {listo ? (a.etiqueta ?? CATEGORIA_LABEL[a.categoria]) : 'Próximamente'}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-[var(--text-tertiary)]">
                    <Clock3 size={12} aria-hidden="true" /> {a.duracionMin} min
                  </span>
                </div>
                <p className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">{a.titulo}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-[var(--text-secondary)]">{a.descripcion}</p>
                {listo && suyas.ultima && suyas.ultima.despues !== null && (
                  <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-[var(--accent-ink)]">
                    <TrendingUp size={12} aria-hidden="true" /> Tu última vez: {suyas.ultima.antes} <ArrowRight size={11} aria-hidden="true" /> {suyas.ultima.despues}
                  </p>
                )}
              </div>
            </>
          );
          return (
            <Card key={a.id} className={`p-4 ${listo ? '' : 'opacity-80'}`}>
              {listo ? (
                <button
                  type="button"
                  onClick={() => setAbierto(expandido ? null : a.id)}
                  aria-expanded={expandido}
                  className="flex w-full items-center gap-4 rounded-[var(--radius-button)] text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  {cuerpo}
                </button>
              ) : (
                <div className="flex w-full items-center gap-4">{cuerpo}</div>
              )}

              {listo && expandido && (
                <div className="mt-5 border-t border-[color-mix(in_oklab,var(--text-tertiary)_14%,transparent)] pt-5">
                  <ReproductorAudio audio={a} onGuardada={() => setSesiones(leerSesiones())} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <section aria-labelledby="mi-registro" className="mt-6">
        <h2 id="mi-registro" className="text-[20px] font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
          Tu registro de calma
        </h2>
        <Card className="mt-3 p-4">
          {sesiones.length === 0 ? (
            <p className="text-[14px] leading-snug text-[var(--text-secondary)]">
              Cuando escuches un audio, te preguntaremos cómo te sientes antes y después, de 1 a 10. Aquí verás cómo cambia tu calma con el tiempo.
            </p>
          ) : (
            <>
              <p className="text-[14px] leading-snug text-[var(--text-primary)]">
                {resumen.mejoraPromedio !== null && resumen.mejoraPromedio > 0 ? (
                  <>
                    {resumen.conAmbas > 1 ? 'En promedio, tu calma sube' : 'La última vez, tu calma subió'} <strong>{resumen.mejoraPromedio} {resumen.mejoraPromedio === 1 ? 'punto' : 'puntos'}</strong> después de escuchar.
                  </>
                ) : (
                  <>
                    Llevas <strong>{resumen.veces} {resumen.veces === 1 ? 'escucha registrada' : 'escuchas registradas'}</strong>. Cada una cuenta.
                  </>
                )}
              </p>
              <ul className="mt-3 divide-y divide-[color-mix(in_oklab,var(--text-tertiary)_14%,transparent)]">
                {sesiones.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium text-[var(--text-primary)]">{tituloDe(s.audioId)}</span>
                      <span className="block text-[12px] text-[var(--text-tertiary)]">{FECHA.format(new Date(s.fecha))}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[14px] font-semibold tabular-nums text-[var(--accent-ink)]">
                      {s.antes} <ArrowRight size={13} aria-hidden="true" /> {s.despues ?? '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </section>

      <Card className="mt-3 flex items-center gap-4 p-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_22%,transparent)] bg-[var(--chip-bg)]"
        >
          <Sparkles size={18} strokeWidth={1.8} color="var(--accent)" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">Cada mes, un audio nuevo</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[var(--text-secondary)]">
            Tu biblioteca y tu Refugio siguen creciendo contigo con nuevas actualizaciones.
          </p>
        </div>
      </Card>
    </AppShell>
  );
}

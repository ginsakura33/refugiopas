'use client';

// "Descargar mi diario y mis datos": arma un DOCUMENTO LEGIBLE (se abre con un toque en el celular, se lee bien
// y se puede imprimir o guardar como PDF) con TODO lo que la persona tiene en su cuenta. Lee de la base con su
// propia sesión, así que solo puede ser lo suyo. Los colores salen de los de la app; todo el texto escrito por la
// persona se escapa antes de ponerlo en el documento.

import { createClient } from '@/lib/supabase/client';
import { ANIMO_EMOJI } from '@/components/app-interna/ui';
import { ANIMOS, AUDIOS, HABITOS, MODULOS } from '@/lib/app-demo-data';
import { ARQUETIPOS, type ArquetipoId } from '@/lib/onboarding-content';
import { MINIMO_RACHA } from '@/lib/racha';
import { describirPlan } from '@/lib/perfil';

const esc = (t: unknown) =>
  String(t ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const FECHA_LARGA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });
const FECHA_HORA = new Intl.DateTimeFormat('es', { dateStyle: 'full', timeStyle: 'short' });
const dia = (f: string) => FECHA_LARGA.format(new Date(`${f}T12:00:00`));
const emojiDe = (animo: string) => ANIMO_EMOJI[(ANIMOS as readonly string[]).indexOf(animo)] ?? '';

function tema() {
  const css = getComputedStyle(document.documentElement);
  const v = (n: string, respaldo: string) => css.getPropertyValue(n).trim() || respaldo;
  return { bg: v('--bg', 'white'), surface: v('--surface', 'white'), texto: v('--text-primary', 'black'), suave: v('--text-secondary', 'gray'), acento: v('--accent', 'goldenrod'), tinte: v('--surface-2', 'white') };
}

/** Racha más larga: días seguidos con al menos MINIMO_RACHA hábitos recomendados. */
function mejorRacha(porDia: Map<string, string[]>): { dias: number; racha: number } {
  const recomendados = new Set(HABITOS.map((h) => h.id));
  const cuentan = [...porDia.entries()].filter(([, ids]) => ids.filter((i) => recomendados.has(i)).length >= MINIMO_RACHA).map(([f]) => f).sort();
  let mejor = 0;
  let actual = 0;
  let previo: Date | null = null;
  for (const f of cuentan) {
    const d = new Date(`${f}T12:00:00`);
    actual = previo && Math.round((d.getTime() - previo.getTime()) / 86400000) === 1 ? actual + 1 : 1;
    mejor = Math.max(mejor, actual);
    previo = d;
  }
  return { dias: cuentan.length, racha: mejor };
}

export async function descargarMisDatos(): Promise<boolean> {
  try {
    const sb = createClient();
    const { data: sesion } = await sb.auth.getSession();
    const usuario = sesion.session?.user;
    if (!usuario) return false;

    const [perfil, plan, habitos, animo, diario, propios, modulos, sesiones] = await Promise.all([
      sb.from('profiles').select('nombre, arquetipo, created_at').maybeSingle(),
      sb.from('subscriptions').select('plan, estado, vigente_hasta').maybeSingle(),
      sb.from('habit_logs').select('fecha, habito_id, hecho').eq('hecho', true).order('fecha', { ascending: false }).limit(20000),
      sb.from('animo_dias').select('fecha, animo, intensidad').order('fecha', { ascending: false }).limit(5000),
      sb.from('journal_entries').select('created_at, animo, intensidad, texto').order('created_at', { ascending: false }).limit(5000),
      sb.from('habitos_propios').select('id, nombre'),
      sb.from('module_progress').select('modulo_id, completado_at'),
      sb.from('sesiones_audio').select('audio_id, antes, despues, created_at').order('created_at', { ascending: false }).limit(5000),
    ]);
    if ([perfil, plan, habitos, animo, diario, propios, modulos, sesiones].some((r) => r.error)) return false;

    const nombrePropio = new Map((propios.data ?? []).map((p) => [p.id as string, p.nombre as string]));
    const nombreHabito = (id: string) => HABITOS.find((h) => h.id === id)?.nombre ?? nombrePropio.get(id) ?? 'Hábito propio';
    const porDia = new Map<string, string[]>();
    for (const f of habitos.data ?? []) porDia.set(f.fecha as string, [...(porDia.get(f.fecha as string) ?? []), f.habito_id as string]);
    const { dias, racha } = mejorRacha(porDia);
    const arquetipo = perfil.data?.arquetipo && perfil.data.arquetipo in ARQUETIPOS ? ARQUETIPOS[perfil.data.arquetipo as ArquetipoId].nombre : null;
    const t = tema();
    const hoy = new Date();

    const entradas = (diario.data ?? [])
      .map(
        (e) => `<article class="entrada"><p class="cab">${emojiDe(String(e.animo))} <strong>${esc(e.animo)}</strong>${e.intensidad ? ` · intensidad ${esc(e.intensidad)} de 10` : ''}</p><p class="fecha">${esc(FECHA_HORA.format(new Date(e.created_at as string)))}</p><p class="texto">${esc(e.texto)}</p></article>`
      )
      .join('');
    const filasAnimo = (animo.data ?? []).map((a) => `<tr><td>${esc(dia(a.fecha as string))}</td><td>${emojiDe(String(a.animo))} ${esc(a.animo)}</td><td>${esc(a.intensidad)} de 10</td></tr>`).join('');
    const filasHabitos = [...porDia.entries()].map(([f, ids]) => `<li><strong>${esc(dia(f))}:</strong> ${ids.map((i) => esc(nombreHabito(i))).join(' · ')}</li>`).join('');
    const filasCalma = (sesiones.data ?? [])
      .map((s) => {
        const cambio = s.despues === null ? null : (s.despues as number) - (s.antes as number);
        return `<tr><td>${esc(FECHA_LARGA.format(new Date(s.created_at as string)))}</td><td>${esc(AUDIOS.find((a) => a.id === s.audio_id)?.titulo ?? 'Audio')}</td><td>${esc(s.antes)} → ${s.despues === null ? '—' : esc(s.despues)}</td><td>${cambio === null ? '' : cambio > 0 ? `+${cambio}` : esc(cambio)}</td></tr>`;
      })
      .join('');
    const filasModulos = (modulos.data ?? [])
      .map((m) => {
        const def = MODULOS.find((x) => x.id === m.modulo_id);
        return `<li>${esc(def ? `Módulo ${def.numero}: ${def.titulo}` : m.modulo_id)} — completado el ${esc(FECHA_LARGA.format(new Date(m.completado_at as string)))}</li>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mi Refugio PAS · mis datos</title>
<style>
body{margin:0;background:${t.bg};color:${t.texto};font:16px/1.6 Georgia,'Times New Roman',serif}
main{max-width:640px;margin:0 auto;padding:32px 20px 64px}
h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:40px 0 12px;padding-bottom:8px;border-bottom:2px solid ${t.acento}}
.sub{color:${t.suave};margin:0 0 24px}.nota{background:${t.surface};border-left:4px solid ${t.acento};padding:12px 16px;border-radius:8px}
.datos p{margin:4px 0}.entrada{background:${t.surface};border-radius:16px;padding:16px;margin:12px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.cab{margin:0}.fecha{margin:2px 0 8px;color:${t.suave};font-size:14px}.texto{margin:0;white-space:pre-wrap;word-wrap:break-word}
table{width:100%;border-collapse:collapse;font-size:15px}td,th{text-align:left;padding:8px 6px;border-bottom:1px solid ${t.tinte}}
ul{padding-left:20px}li{margin:6px 0}.vacio{color:${t.suave};font-style:italic}
button{font:inherit;font-size:15px;padding:10px 18px;border:0;border-radius:12px;background:${t.acento};color:${t.bg};cursor:pointer}
@media print{button{display:none}body{background:white}.entrada{box-shadow:none;border:1px solid ${t.tinte};break-inside:avoid}}
</style></head><body><main>
<h1>Mi Refugio PAS</h1><p class="sub">Mi diario y mis datos · ${esc(FECHA_LARGA.format(hoy))}</p>
<p class="nota">Este documento es tuyo. Guárdalo en un lugar seguro: incluye tu diario personal. Puedes imprimirlo o guardarlo como PDF.</p>
<p style="margin-top:16px"><button type="button" onclick="window.print()">Imprimir o guardar como PDF</button></p>

<h2>Mi cuenta</h2><div class="datos">
<p><strong>Nombre:</strong> ${esc(perfil.data?.nombre ?? '—')}</p>
<p><strong>Correo:</strong> ${esc(usuario.email ?? '—')}</p>
<p><strong>Mi tipo de alma sensible:</strong> ${esc(arquetipo ?? 'Aún por descubrir')}</p>
<p><strong>Mi plan:</strong> ${esc(describirPlan(plan.data ? { plan: plan.data.plan, estado: plan.data.estado, vigenteHasta: plan.data.vigente_hasta } : null))}</p>
<p><strong>En Refugio PAS desde:</strong> ${perfil.data?.created_at ? esc(FECHA_LARGA.format(new Date(perfil.data.created_at as string))) : '—'}</p></div>

<h2>Mi diario (${(diario.data ?? []).length})</h2>${entradas || '<p class="vacio">Todavía no hay entradas en tu diario.</p>'}

<h2>Cómo me he sentido, día a día</h2>${filasAnimo ? `<table><thead><tr><th>Día</th><th>Ánimo</th><th>Intensidad</th></tr></thead><tbody>${filasAnimo}</tbody></table>` : '<p class="vacio">Todavía no hay ánimos registrados.</p>'}

<h2>Mis hábitos</h2>${porDia.size ? `<p>Días en que cuidé mis hábitos: <strong>${porDia.size}</strong> · Días que sumaron a mi racha (${MINIMO_RACHA} hábitos o más): <strong>${dias}</strong> · Mi mejor racha: <strong>${racha}</strong> ${racha === 1 ? 'día' : 'días'}</p><ul>${filasHabitos}</ul>` : '<p class="vacio">Todavía no hay hábitos marcados.</p>'}

<h2>Mi calma con los audios</h2>${filasCalma ? `<p>Cómo me sentía de 1 a 10 antes y después de cada audio.</p><table><thead><tr><th>Día</th><th>Audio</th><th>Antes → después</th><th>Cambio</th></tr></thead><tbody>${filasCalma}</tbody></table>` : '<p class="vacio">Todavía no hay registros de audios.</p>'}

<h2>Mi proceso PAS</h2>${filasModulos ? `<ul>${filasModulos}</ul>` : '<p class="vacio">Todavía no hay módulos completados.</p>'}
</main></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `mi-refugio-pas-${hoy.toISOString().slice(0, 10)}.html`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch {
    return false;
  }
}

'use client';

// "Descargar mis datos": arma un archivo con TODO lo que la persona tiene en su cuenta (lo lee de la base
// con su propia sesión, así que solo puede ser lo suyo) y lo descarga en su celular o computador.

import { createClient } from '@/lib/supabase/client';

export async function descargarMisDatos(): Promise<boolean> {
  try {
    const sb = createClient();
    const { data: sesion } = await sb.auth.getSession();
    const usuario = sesion.session?.user;
    if (!usuario) return false;

    const [perfil, plan, habitos, animo, diario, propios, modulos] = await Promise.all([
      sb.from('profiles').select('nombre, arquetipo, created_at').maybeSingle(),
      sb.from('subscriptions').select('plan, estado, vigente_hasta').maybeSingle(),
      sb.from('habit_logs').select('fecha, habito_id, hecho').order('fecha', { ascending: true }).limit(20000),
      sb.from('animo_dias').select('fecha, animo, intensidad').order('fecha', { ascending: true }).limit(5000),
      sb.from('journal_entries').select('created_at, animo, intensidad, texto').order('created_at', { ascending: true }).limit(5000),
      sb.from('habitos_propios').select('id, nombre'),
      sb.from('module_progress').select('modulo_id, completado_at'),
    ]);
    const fallo = [perfil, plan, habitos, animo, diario, propios, modulos].find((r) => r.error);
    if (fallo) return false;

    const paquete = {
      aviso: 'Estos son tus datos de Refugio PAS. Guárdalos en un lugar seguro: incluyen tu diario personal.',
      descargado_el: new Date().toISOString(),
      cuenta: { correo: usuario.email ?? null, nombre: perfil.data?.nombre ?? null, arquetipo: perfil.data?.arquetipo ?? null, creada: perfil.data?.created_at ?? null },
      plan: plan.data ?? null,
      habitos_propios: propios.data ?? [],
      habitos_marcados: habitos.data ?? [],
      animo_por_dia: animo.data ?? [],
      diario: diario.data ?? [],
      modulos_completados: modulos.data ?? [],
    };

    const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    const hoy = new Date().toISOString().slice(0, 10);
    enlace.href = url;
    enlace.download = `refugio-pas-mis-datos-${hoy}.json`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch {
    return false;
  }
}

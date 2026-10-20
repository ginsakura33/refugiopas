'use client';

// Logros del Perfil, calculados con lo que la persona REALMENTE hizo (datos de su celular, que se
// sincronizan con su cuenta). Todos son positivos: se consiguen y no se pierden, y los pendientes solo
// muestran una pista amable. Nada de puntos, niveles ni ligas: no hay competencia ni presión.

import { BookHeart, CalendarCheck, Footprints, Medal, PenLine, Route, type LucideIcon } from 'lucide-react';
import { HABITOS, MODULOS, type EntradaDiario } from '@/lib/app-demo-data';
import { calcularRacha, type ResumenRacha } from '@/lib/racha';

export interface Logro {
  id: string;
  titulo: string;
  /** Qué hacer para conseguirlo (se muestra mientras está pendiente). */
  pista: string;
  logrado: boolean;
  icono: LucideIcon;
}

export interface ResumenPerfil {
  racha: ResumenRacha;
  modulosHechos: number;
  modulosTotal: number;
  logros: Logro[];
}

function leer<T>(clave: string, vacio: T): T {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : vacio;
  } catch {
    return vacio;
  }
}

/** ¿Alguna vez marcó un hábito? Revisa los días guardados en el celular. */
function marcoAlgunHabito(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (!clave || !/^refugio-habitos-\d{4}-\d{2}-\d{2}$/.test(clave)) continue;
      const dia = JSON.parse(localStorage.getItem(clave) ?? '{}') as Record<string, boolean>;
      if (Object.values(dia).some(Boolean)) return true;
    }
  } catch {
    /* sin datos legibles: se considera que aún no */
  }
  return false;
}

export function calcularResumenPerfil(): ResumenPerfil {
  const racha = calcularRacha(HABITOS.map((h) => h.id));
  const completados = leer<Record<string, boolean>>('refugio-modulos-completados', {});
  const modulosHechos = MODULOS.filter((m) => completados[m.id]).length;
  const entradas = leer<EntradaDiario[]>('refugio-diario', []).length;
  const mitad = Math.ceil(MODULOS.length / 2);

  const logros: Logro[] = [
    { id: 'primer-paso', titulo: 'Primer paso', pista: 'Marca tu primer hábito', logrado: marcoAlgunHabito() || racha.mejor > 0, icono: Footprints },
    { id: 'semana', titulo: 'Una semana seguida', pista: 'Racha de 7 días', logrado: racha.mejor >= 7, icono: CalendarCheck },
    { id: 'mes', titulo: 'Un mes de constancia', pista: 'Racha de 30 días', logrado: racha.mejor >= 30, icono: Medal },
    { id: 'primera-entrada', titulo: 'Mi primera entrada', pista: 'Escribe en tu diario', logrado: entradas >= 1, icono: PenLine },
    { id: 'mitad', titulo: 'A mitad de camino', pista: `Completa ${mitad} módulos`, logrado: modulosHechos >= mitad, icono: Route },
    { id: 'proceso', titulo: 'Proceso completo', pista: `Completa los ${MODULOS.length} módulos`, logrado: modulosHechos >= MODULOS.length, icono: BookHeart },
  ];

  return { racha, modulosHechos, modulosTotal: MODULOS.length, logros };
}

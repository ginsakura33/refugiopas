'use client';

// Devuelve la fecha de HOY (hora local, YYYY-MM-DD) y avisa cuando cambia el día.
// Hace falta porque una app instalada puede quedar abierta en segundo plano toda la noche: sin esto
// seguiría mostrando los hábitos, el ánimo y la frase de AYER. Se vuelve a comprobar al volver a la
// app (visibilidad, foco, pageshow) y cada minuto. Empieza vacío ('') para no desfasar la hidratación.

import { useEffect, useState } from 'react';
import { fechaLocal } from '@/lib/racha';

export function useFechaHoy(): string {
  const [hoy, setHoy] = useState('');

  useEffect(() => {
    const actualizar = () => setHoy(fechaLocal());
    actualizar();
    const alVolver = () => {
      if (document.visibilityState === 'visible') actualizar();
    };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', actualizar);
    window.addEventListener('pageshow', actualizar);
    const id = setInterval(actualizar, 60000);
    return () => {
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', actualizar);
      window.removeEventListener('pageshow', actualizar);
      clearInterval(id);
    };
  }, []);

  return hoy;
}

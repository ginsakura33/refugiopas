// Contenido REAL del ebook "El Refugio de tu Sensibilidad" (Ginette Rivas) — no inventado.
// Test de alta sensibilidad: inspirado en el cuestionario de Elaine N. Aron (cita textual del
// ebook, p.9-10). Los 5 Arquetipos del Alma Sensible: creados por la autora (ebook p.14-16).

export const TEST_PAS: string[] = [
  'Te abruman los entornos ruidosos o caóticos.',
  'Sientes profundamente las emociones de los demás.',
  'Te afectan los cambios de energía en los lugares.',
  'Necesitas tiempo a solas para recargarte.',
  'Te conmueve el arte, la música o la naturaleza de manera profunda.',
  'Evitas la violencia en películas, noticias o conversaciones.',
  'Reflexionas mucho antes de tomar decisiones.',
  'Sientes que percibes detalles que los demás no notan.',
  'Te afectan las injusticias y el sufrimiento ajeno.',
  'A veces te sientes emocionalmente agotado después de socializar.',
];

export const TEST_PAS_NOTA =
  'Este test está inspirado en el cuestionario desarrollado por la psicóloga e investigadora ' +
  'Elaine N. Aron, pionera en el estudio de las Personas Altamente Sensibles (PAS). No tiene ' +
  'finalidad diagnóstica, sino orientativa y de autoconocimiento.';

export type ArquetipoId = 'introspectiva' | 'solar' | 'visionaria' | 'empatica' | 'luminosa';

export interface Arquetipo {
  id: ArquetipoId;
  nombre: string;
  subtitulo: string;
  /** Frase corta para el chip de selección (eco de "Vibra en" del ebook). */
  vibraEn: string;
  donNatural: string;
  desafio: string;
  caminoEvolucion: string;
  ejercicio: string;
}

export const ARQUETIPOS: Record<ArquetipoId, Arquetipo> = {
  introspectiva: {
    id: 'introspectiva',
    nombre: 'el Alma Introspectiva',
    subtitulo: 'PAS introvertido/a',
    vibraEn: 'Profundidad, contemplación y silencio',
    donNatural: 'la observación y la introspección',
    desafio: 'te aíslas fácilmente o te sientes incomprendido/a',
    caminoEvolucion: 'abrirte sin perder tu centro',
    ejercicio: 'Escribir cada día lo que sientes sin juzgarlo — tu palabra escrita es una forma de canalización emocional.',
  },
  solar: {
    id: 'solar',
    nombre: 'el Alma Solar',
    subtitulo: 'PAS extrovertido/a',
    vibraEn: 'Alegría, conexión y movimiento',
    donNatural: 'irradiar energía, inspirar, motivar',
    desafio: 'te sobrecargas rápido en entornos intensos',
    caminoEvolucion: 'regular tu energía y crear espacios de descanso emocional',
    ejercicio: 'Practicar la pausa antes de decir "sí" — el silencio y el descanso son tan sagrados como la acción.',
  },
  visionaria: {
    id: 'visionaria',
    nombre: 'el Alma Visionaria',
    subtitulo: 'PAS + buscadora de sensaciones',
    vibraEn: 'Curiosidad, expansión y creatividad',
    donNatural: 'la creatividad, el arte, la innovación',
    desafio: 'confundes intensidad con propósito y te dispersas',
    caminoEvolucion: 'canalizar tu energía creadora en proyectos con sentido',
    ejercicio: 'Usar un diario creativo (escritura, pintura, música) para manifestar tu energía emocional.',
  },
  empatica: {
    id: 'empatica',
    nombre: 'el Alma Empática',
    subtitulo: 'sensibilidad emocional profunda',
    vibraEn: 'Amor, compasión e intuición',
    donNatural: 'sentir lo invisible, percibir lo que otros callan',
    desafio: 'absorbes energías ajenas o cargas con lo que no te pertenece',
    caminoEvolucion: 'establecer límites sanos y protección energética',
    ejercicio: 'Visualizar una esfera de luz dorada protectora antes de dormir. Recuerda: "Siento mucho, pero no todo es mío."',
  },
  luminosa: {
    id: 'luminosa',
    nombre: 'el Alma Luminosa',
    subtitulo: 'sensibilidad espiritual o extrasensorial',
    vibraEn: 'Conexión, canalización y propósito',
    donNatural: 'percibir dimensiones sutiles: intuición, clarisentir',
    desafio: 'te da miedo tu propia percepción y confundes intuición con pensamiento',
    caminoEvolucion: 'discernir entre el ruido mental y tu voz interna',
    ejercicio: 'Una mano en el corazón y otra en el vientre, respira profundo y pregúntate: "¿Qué necesitas que escuche hoy?"',
  },
};

export const ORDEN_ARQUETIPOS: ArquetipoId[] = ['introspectiva', 'solar', 'visionaria', 'empatica', 'luminosa'];

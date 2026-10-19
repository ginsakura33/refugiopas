// Datos de ejemplo de la app por dentro — Sesión 5. Cliente-side únicamente: Supabase llega en
// Sesión 6 (ver ESTADO.md). "La app nunca se enseña vacía" (32-DEL-MVP-AL-PRODUCTO.md): nombres
// reales del mercado, valores plausibles del nicho, fechas relativas a hoy — nunca "User 1" ni 0%.

import type { LucideIcon } from 'lucide-react';
import { Sunrise, Wind, Anchor, PenLine, MoonStar, Dumbbell } from 'lucide-react';

export interface HabitoDef {
  id: string;
  nombre: string;
  horaLabel: string;
  icon: LucideIcon;
}

export const HABITOS: HabitoDef[] = [
  { id: 'manana', nombre: 'Respiración matutina', horaLabel: 'Elige tu audio guiado de la biblioteca', icon: Sunrise },
  { id: 'sos', nombre: 'Pausa SOS', horaLabel: 'Elige tu audio SOS de la biblioteca', icon: Wind },
  { id: 'grounding', nombre: 'Grounding', horaLabel: 'Anclaje a tierra 5 min', icon: Anchor },
  { id: 'escritura', nombre: 'Escritura terapéutica', horaLabel: 'Reflexión conmigo', icon: PenLine },
  { id: 'gym', nombre: 'Gym o ejercicio', horaLabel: 'Mueve tu cuerpo hoy', icon: Dumbbell },
  { id: 'noche', nombre: 'Autohipnosis nocturna', horaLabel: 'Antes de dormir', icon: MoonStar },
];

export type CategoriaAudio = 'sos' | 'biblioteca';

export interface AudioDef {
  id: string;
  titulo: string;
  categoria: CategoriaAudio;
  duracionMin: number;
  descripcion: string;
  /** Rótulo de la etiqueta de la tarjeta; si no hay, se usa el de la categoría (SOS / Biblioteca). */
  etiqueta?: string;
}

export const AUDIOS: AudioDef[] = [
  { id: 'reset-emocional', titulo: 'Regula tu Sistema Nervioso', categoria: 'sos', duracionMin: 3, descripcion: 'Baja la sobrecarga sensorial en minutos, cuando más lo necesitas.' },
  { id: 'respiracion-3-rondas', titulo: 'Respiración matutina', categoria: 'biblioteca', duracionMin: 2, descripcion: 'Inicia el día con energía y gratitud.', etiqueta: 'Eleva tu energía' },
  { id: 'jardin-interior', titulo: 'El Jardín Interior', categoria: 'biblioteca', duracionMin: 8, descripcion: 'Visualización guiada para reconectar con tu espacio de calma.', etiqueta: 'Lugar seguro' },
  { id: 'limpieza-nocturna', titulo: 'Limpieza Energética Nocturna', categoria: 'biblioteca', duracionMin: 10, descripcion: 'Cierra el día soltando lo que absorbiste de los demás.', etiqueta: 'Equilibra' },
  { id: 'herida-rechazo', titulo: 'Conexión con mi cuerpo', categoria: 'biblioteca', duracionMin: 9, descripcion: 'Reconecta con las señales de tu cuerpo y suelta la tensión acumulada.', etiqueta: 'Armoniza' },
];

// Los 4 módulos didácticos — contenido REAL de los 4 capítulos del ebook "El Refugio de tu
// Sensibilidad" (Ginette Rivas), no inventado (regla de oro 3/57): mismo título exacto, mismo
// subtítulo, la frase de apertura y las lecciones son texto real del libro (condensado para
// lectura móvil, extraído con pdftotext -enc UTF-8), nunca redactado desde cero. La reflexión de
// cierre usa las preguntas reales de los "Ejercicios de Aprendizaje" de cada capítulo.
export interface LeccionDef {
  titulo: string;
  texto: string;
}

export interface ModuloDef {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  frase: string;
  lecciones: LeccionDef[];
  reflexion: string[];
}

export const MODULOS: ModuloDef[] = [
  {
    id: 'reconocerme',
    numero: 1,
    titulo: 'Reconocerme',
    subtitulo: 'Comprendiendo tu naturaleza PAS',
    frase: 'Conocer y aceptar tu sensibilidad es el primer paso para transformarla en tu mayor fortaleza.',
    lecciones: [
      {
        titulo: '¿Qué significa ser PAS?',
        texto: 'Si te has sentido diferente a los demás, si percibes detalles que otros pasan por alto y las emociones te impactan profundamente, es probable que seas una Persona Altamente Sensible.\n\nLa alta sensibilidad no es un trastorno, ni una condición, ni una enfermedad: es un rasgo de personalidad reconocido por la ciencia y estudiado por la Dra. Elaine Aron. Afecta aproximadamente al 20% de la población y se caracteriza por una mayor profundidad en el procesamiento de la información, alta empatía y sensibilidad sensorial.\n\nCuando una PAS aprende a comprenderse, regularse y sostenerse, puede desarrollar grandes fortalezas: empatía consciente, intuición clara, creatividad y profundidad humana.',
      },
      {
        titulo: 'Mitos y realidades',
        texto: 'Muchas veces los conceptos sociales han distorsionado la forma en que una persona sensible siente, procesa y percibe el mundo. Algunos mitos frecuentes:\n\n• "Ser PAS es ser débil o frágil" — En realidad son personas resilientes, con gran capacidad de adaptación.\n• "Las PAS lloran por todo y no manejan sus emociones" — Sienten con mayor intensidad, pero muchas desarrollan una gran inteligencia emocional.\n• "Las PAS fracasan en el mundo laboral" — Destacan en trabajos que requieren empatía, creatividad y atención al detalle.\n• "Si eres PAS, siempre sufrirás por tu sensibilidad" — Bien gestionada, se convierte en tu mayor fortaleza.\n\nLa alta sensibilidad no es una debilidad: es un don que, comprendido y gestionado, se vuelve una fortaleza.',
      },
      {
        titulo: 'Tus 4 formas de sentir',
        texto: 'Las PAS se expresan en 4 tipos, y es común identificarse con más de uno:\n\n• Emocional o empático: capta emociones aunque no se digan en palabras; lee el tono de voz y el lenguaje corporal.\n• Físico o sensorial: percibe con más fuerza los ruidos, las luces y los ambientes caóticos, hasta el punto de saturarse.\n• Mental o analítico: reflexiona casi todo; puede caer en parálisis por análisis o ruido mental.\n• Intuitivo o espiritual: tiene una conexión intuitiva con su entorno y percibe cambios sutiles de energía.\n\n¿Con cuál te identificas hoy?',
      },
      {
        titulo: 'Tu sistema nervioso PAS',
        texto: 'El sistema nervioso de una PAS procesa la información de forma más profunda y detallada, y responde con más intensidad al ruido, los ambientes caóticos o los cambios inesperados. Esto no es debilidad: tu organismo necesita periodos más frecuentes de recuperación y descanso.\n\nCómo cuidarlo:\n• Evita la sobrecarga de estímulos.\n• Practica la regulación emocional: respiración, meditación, autohipnosis.\n• Duerme lo suficiente.\n• Nutre tu cuerpo y tu mente.\n• Busca contacto con la naturaleza (grounding).\n• Haz actividades creativas.\n• Date descansos de pantallas y noticias.',
      },
    ],
    reflexion: [
      'Yo noto cosas que otras personas no suelen notar como...',
      'Las situaciones que más fácilmente saturan mi sistema son...',
      'Una característica de mi sensibilidad que antes juzgaba es...',
    ],
  },
  {
    id: 'comprenderme',
    numero: 2,
    titulo: 'Comprenderme',
    subtitulo: 'Desafíos mentales y emocionales del alma sensible',
    frase: 'Cuando dejas de luchar contra tu sensibilidad, comienzas a descubrir la sabiduría que siempre ha vivido dentro de ella.',
    lecciones: [
      {
        titulo: 'Sobrecarga sensorial: cómo reconocerla',
        texto: 'Cuando hay demasiados estímulos —ruido, conversaciones, luz, pantallas, emociones ajenas— tu sistema nervioso puede saturarse fácilmente. Señales para identificarlo: irritabilidad sin razón aparente, cansancio súbito, necesidad urgente de aislarte, ansiedad o confusión mental.\n\n¿Cómo gestionarla? Crea un espacio íntimo cada día para ti —tu "centro de equilibrio"—: una pausa de respiración, escritura o silencio, sin prisas ni exigencias. Es un espacio para comprender tu realidad, no para huir de ella.',
      },
      {
        titulo: 'Lo que sientes de los demás no siempre es tuyo',
        texto: 'Una PAS no solo percibe emociones ajenas: las absorbe. Pero eso no significa que debas quedarte con ellas. Puedes llevarte a casa la tristeza de un amigo o la tensión de una sala llena de gente, y drenarla es tarea tuya.\n\nPregúntate: "¿Esto que siento es mío?" Si la respuesta es no, basta tu intención para devolverlo a quien pertenece. Respira profundo tres veces y visualiza que lo sueltas. Notarás cómo te liberas.',
      },
      {
        titulo: 'Lo que tu cuerpo te dice',
        texto: 'El cuerpo de una PAS habla: palpitaciones ante ambientes cargados, tensión en cuello y mandíbula por sobrecarga emocional, cansancio extremo tras interacciones intensas, insomnio cuando la mente no ha procesado emociones.\n\nUn ejercicio simple para esos momentos:\n1. Identifica la tensión o emoción en tu cuerpo.\n2. Inhala por la nariz contando hasta 4.\n3. Retén contando hasta 4, imaginando que limpias esa zona.\n4. Exhala por la boca soltando el aire con fuerza.',
      },
      {
        titulo: 'Poner límites sin culpa',
        texto: 'Poner límites no es egoísmo, es autocuidado. La culpa nos contamina, así que ayuda tener frases-ancla como:\n\n• "No tengo que explicarme para proteger mi energía."\n• "Decir NO es decir sí a mí."\n• "Mi paz es mi prioridad."\n\nHerramienta práctica: usa la pausa como aliada —"Te respondo en otro momento"— y reconoce lo que sientes sin justificarlo con explicaciones extensas.',
      },
    ],
    reflexion: [
      'Los tres desafíos que más quiero trabajar son...',
      '¿Qué necesitaba realmente en ese momento?',
      'Me doy permiso para...',
    ],
  },
  {
    id: 'sostenerme',
    numero: 3,
    titulo: 'Sostenerme',
    subtitulo: 'Alquimia emocional y mental para PAS',
    frase: 'Tu cuerpo no es solo el recipiente de tu sensibilidad, es el templo donde tu alma se expresa y sana.',
    lecciones: [
      {
        titulo: 'La alquimia emocional',
        texto: 'La alquimia emocional y mental es el arte de transformar conscientemente aquello que te mueve. Así como los antiguos alquimistas convertían el plomo en oro, tú puedes convertir la densidad del miedo, la tristeza o la ansiedad en claridad, presencia y poder personal.\n\nNo se trata de eliminar lo que sientes, sino de observar, acoger y redirigir esa energía hacia la transformación.',
      },
      {
        titulo: 'Tus 7 cuerpos de energía',
        texto: 'Según la metafísica, no estamos compuestos solo por un cuerpo físico, sino por siete niveles de energía:\n\n1. Físico — se cuida con alimentación, descanso y movimiento.\n2. Etérico — se equilibra con respiración y contacto con la tierra.\n3. Emocional — pide gestión emocional y prácticas de liberación.\n4. Mental inferior — se armoniza con silencio y meditación.\n5. Mental superior — se fortalece con introspección.\n6. Búdico — se despierta con compasión y servicio.\n7. Átmico — la esencia divina en ti.\n\nCuando armonizas tus siete cuerpos, vives en coherencia entre cuerpo, mente, alma y espíritu.',
      },
      {
        titulo: 'Nutrir tu sistema nervioso',
        texto: 'Lo que consumes —comida, noticias, sonidos, luz— impacta directamente tu sistema nervioso y tu claridad mental. Algunas prácticas:\n\n• Prioriza alimentos vivos y frescos, poco procesados.\n• Reduce estimulantes como el café, el azúcar refinada y los ultraprocesados.\n• Hidrátate conscientemente: agua, infusiones de manzanilla, jugos verdes.\n• Observa cómo reacciona tu cuerpo a cada alimento: ¿te recarga o te drena?',
      },
      {
        titulo: 'Calmar el estrés y la ansiedad',
        texto: 'El estrés y la ansiedad no son debilidades: son indicadores de que tu cuerpo y tu mente necesitan calma, pausa y reconexión.\n\nHerramientas de regulación:\n• Respiración 4-7-8: inhala en 4 tiempos, retén 7, exhala en 8.\n• Conexión con la naturaleza: caminar descalzo/a ayuda a descargar energía acumulada.\n• Rutinas de micro-descanso: cierra los ojos, observa tu cuerpo, agradece.\n• Música en 432 Hz o 528 Hz para armonizar tu campo emocional.',
      },
      {
        titulo: 'Autohipnosis: el Jardín Interior',
        texto: 'A través de la autohipnosis es posible acceder a tu espacio interior para sembrar raíces más amorosas y empoderadoras.\n\nVisualización breve: cierra los ojos, respira profundo tres veces. Imagina que caminas por un jardín luminoso hasta llegar a tu jardín interior, un lugar sagrado creado por ti y para ti. Siéntate bajo un árbol y encuéntrate con esa parte tuya sabia y amorosa. Pregúntale: "¿Qué mensaje tiene mi alma para mí?" Escucha en silencio, y cuando sea momento de volver, respira y repite: "Estoy a salvo en mi interior. Mi sensibilidad es mi fuerza. Confío en mí."\n\nTambién tienes el audio guiado "Regula tu Sistema Nervioso" en tu Biblioteca para vivir este ejercicio con voz y música.',
      },
    ],
    reflexion: [
      '¿Qué emoción estoy experimentando?',
      '¿Dónde la siento en mi cuerpo?',
      '¿Qué puedo hacer para atender esa necesidad de una manera saludable?',
    ],
  },
  {
    id: 'honrarme',
    numero: 4,
    titulo: 'Honrarme',
    subtitulo: 'Vivir mi sensibilidad desde la autenticidad',
    frase: 'En el jardín interior de los sensibles, cada emoción es semilla y cada pensamiento, raíz de una nueva flor de consciencia.',
    lecciones: [
      {
        titulo: 'Tu energía como creatividad',
        texto: 'Cuando tu energía emocional no se comprende ni se dirige, puede quedarse atrapada generando ansiedad o fatiga. Pero canalizada de forma consciente, se convierte en una fuerza creativa.\n\nEjercicio práctico: haz una pausa consciente de 5 a 20 minutos cuando sientas una emoción intensa. En vez de rechazarla, pregúntate: "¿Qué me está mostrando esta emoción? ¿Cómo puedo usarla como combustible creativo?" Escribe lo que surja sin filtro en tu diario.',
      },
      {
        titulo: 'Vivir en autenticidad',
        texto: 'La autenticidad surge cuando hay coherencia entre lo que sientes, piensas y haces. Tu sensibilidad no es un obstáculo: es una puerta hacia una comprensión más profunda de ti y de la vida.\n\nRecuerda:\n• Cada vez que eliges ser auténtica/o, recuperas energía vital.\n• No necesitas parecerte a nadie para aportar valor al mundo.\n• Honrar tu esencia es honrar la vida que habita en ti.\n\nElaine Aron, psicóloga e investigadora, canalizó su propia sensibilidad en investigar y visibilizar este rasgo en todo el mundo. Tú también puedes hacerlo a tu manera.',
      },
      {
        titulo: 'Tu intuición y tu niño/a interior',
        texto: 'La intuición está profundamente conectada con tu niño/a interior: esa parte espontánea, perceptiva e imaginativa de ti. Muchas PAS, desde la infancia, ya captaban lo que pasaba desapercibido para los demás, pero aprendieron a silenciar esa voz por miedo a no ser comprendidas.\n\nTu intuición no desapareció, solo quedó en pausa. Para fortalecerla: medita en silencio y escucha tu cuerpo, escribe tus sueños e ideas espontáneas, y habla con tu niño/a interno/a preguntándole qué necesita.',
      },
      {
        titulo: 'Relaciones conscientes',
        texto: 'Una PAS no se vincula desde la superficialidad: busca relaciones basadas en la profundidad, la verdad y la reciprocidad. Señales de una relación consciente:\n\n• Te sientes seguro/a para compartir lo que sientes.\n• No necesitas explicar por qué algo te afectó.\n• Tu intuición es valorada, no ignorada.\n\nLos límites no son barreras, son puentes: decir "NO" también es un acto de amor. Relaciónate con quienes eleven tu energía, no con quienes la drenen.',
      },
      {
        titulo: 'Tu manifiesto de poder',
        texto: 'Cierra este módulo leyendo esto en voz alta, para ti:\n\n"Hoy reconozco que mi sensibilidad es parte de mi esencia y elijo vivirla con consciencia. He dejado de verla como una carga para comprender que es una fuente de sabiduría, intuición y transformación.\n\nMi intuición es mi brújula. Mi energía merece ser cuidada. Mi cuerpo es mi hogar que cuido, escucho y honro.\n\nCamino con el valor de sentir sin perderme en los demás. Elijo habitar mi vida con presencia, libertad y amor. Y recuerdo, cada día, que sentir profundamente también es mi mayor fortaleza."',
      },
    ],
    reflexion: [
      'Hoy honro mi sensibilidad porque...',
      'Honro mi ritmo cuando...',
      '¿Qué decisión necesito tomar para vivir más auténticamente?',
    ],
  },
];

// Frases del día — afirmaciones REALES del ebook "El Refugio de tu Sensibilidad" (Ginette Rivas),
// textuales (capítulos 2, 3 y 4), nunca inventadas. Una por día, rotando según el día del año.
export const FRASES_DEL_DIA = [
  'Mi paz es mi prioridad.',
  'Decir NO es decir sí a mí.',
  'No tengo que explicarme para proteger mi energía.',
  'Puedo amar a alguien y aun así necesitar distancia.',
  'Lo que otros piensan de mí no define mi esencia.',
  'Mi sensibilidad no necesita aprobación.',
  'Mi verdad interior es mi brújula.',
  'Confío en mi sabiduría interior.',
  'Siento mucho, pero no todo es mío.',
  'Mi sensibilidad es mi sabiduría.',
  'Estoy a salvo en mi interior. Mi sensibilidad es mi fuerza. Confío en mí.',
  'Mi intuición es mi brújula. Mi energía merece ser cuidada.',
] as const;

export function fraseDelDia(fecha: Date = new Date()): string {
  const inicio = new Date(fecha.getFullYear(), 0, 0);
  const diaDelAnio = Math.floor((fecha.getTime() - inicio.getTime()) / 86_400_000);
  return FRASES_DEL_DIA[diaDelAnio % FRASES_DEL_DIA.length];
}

export const ANIMOS = ['Agotado/a', 'Tenso/a', 'Neutral', 'Tranquilo/a', 'En calma'] as const;
export type Animo = (typeof ANIMOS)[number];

export interface EntradaDiario {
  id: string;
  fecha: string; // ISO
  animo: Animo;
  intensidad?: number; // 1-10
  texto: string;
}

function haceDias(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DIARIO_SEED: EntradaDiario[] = [
  {
    id: 'seed-1',
    fecha: haceDias(0),
    animo: 'Tranquilo/a',
    texto: 'Hoy sentí que llegaba a casa con la energía de otros encima. El Orbe me ayudó a soltarla antes de seguir con la noche.',
  },
  {
    id: 'seed-2',
    fecha: haceDias(2),
    animo: 'Agotado/a',
    texto: 'Día largo, muchas voces a la vez. Escribí esto en vez de rumiar en la cama, y ya pude respirar distinto.',
  },
  {
    id: 'seed-3',
    fecha: haceDias(5),
    animo: 'En calma',
    texto: 'Puse un límite sin sentir culpa por primera vez en semanas. Pequeño, pero lo anoto para recordarlo.',
  },
];

export const PERFIL_DEMO = {
  nombre: 'Valeria',
  email: 'valeria@ejemplo.com',
  arquetipoNombre: 'el Alma Empática',
  plan: 'Anual · $4.99/mes',
};

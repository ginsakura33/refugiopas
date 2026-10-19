# COPY MARCADO — Página de ventas de Refugio PAS

> Fuente: `FICHA-AVATAR.md` (aprobada 2026-09-16). Cada pieza trae entre paréntesis el campo de la
> ficha del que sale (test de traza, 52 REGLA 3). Marcadores: `[acento]…[/acento]` = color de marca,
> `[b]…[/b]` = semibold. Estructura canónica inmutable de `19-PAGINA-DE-VENTAS.md`.

## BIG IDEA (guardada también en ESTADO.md)
"Valeria no se calma con meditaciones genéricas porque su sistema nervioso PAS necesita un
protocolo propio, no una app más de meditación — y **el Orbe que Respira** lo resuelve activando
2 minutos de autohipnosis guiada en español, hecha para personas altamente sensibles."

- Mecanismo bautizado: **el Orbe que Respira** (hereda el dispositivo ownable ya aprobado en
  FICHA-ARTE.md — el botón circular de la pantalla de Inicio). Aparece en HERO, SOLUCIÓN y OFERTA.
- Nivel de consciencia del tráfico principal (TikTok/Reels, campo "Dónde pasa tiempo online"):
  **Nivel 2 — consciente del problema, no de la solución** (FICHA-AVATAR: "alto en reconocer que se
  abruma, medio en el diagnóstico PAS/autohipnosis"). La página va en versión LARGA: educa el
  rasgo PAS, agita antes de vender, y solo entonces presenta el mecanismo y la oferta.

## PROCESO DE HEADLINE (10 variantes generadas y puntuadas — 4 U's, 0-3 c/u, máx 12)

| # | Variante | Útil | Urgente | Ultra-esp. | Único | Total |
|---|---|---|---|---|---|---|
| 1 | "¿Absorbes las emociones de todos y no sabes cómo soltarlas?" | 3 | 0 | 1 | 2 | 6 |
| 2 | "No te falta calma. Te falta un protocolo hecho para tu sensibilidad." | 2 | 0 | 1 | 3 | 6 |
| 3 | "El Orbe que Respira baja tu sobrecarga en 2 minutos" | 3 | 1 | 3 | 3 | **10** |
| 4 | "Cada noche que rumias sin soltar el día es sueño que no vuelve" | 2 | 2 | 1 | 1 | 6 |
| 5 | "Calma tu sistema nervioso en 2 minutos, en español" | 3 | 1 | 3 | 2 | 9 |
| 6 | "Para quienes sienten demasiado y ya se cansaron de disculparse" | 2 | 0 | 0 | 2 | 4 |
| 7 | "Cómo bajar la sobrecarga sin meditar 20 minutos, aunque ya lo intentaste" | 3 | 0 | 2 | 2 | 7 |
| 8 | "¿Cuántas apps de meditación abandonaste esta semana?" | 1 | 1 | 1 | 1 | 4 |
| 9 | "Hoy tu sobrecarga baja en 2 minutos con el Orbe" | 3 | 3 | 3 | 3 | **12** |
| 10 | "Deja de forzarte a relajar: el Orbe respira por tu sistema nervioso" | 2 | 1 | 1 | 3 | 7 |

- **Paso 3 (elegir):** gana la #9 (12/12).
- **Paso 4 (test del bar):** "Hoy tu sobrecarga baja en 2 minutos con el Orbe" — sí se diría en voz
  alta a una amiga, sin vergüenza. Pasa.
- **Paso 5 (test de intercambiabilidad):** ¿Calm o Headspace podrían firmarla igual? NO — "sobrecarga"
  es lenguaje PAS específico (no "ansiedad" genérico) y "el Orbe" es el mecanismo propio nombrado.
  Pasa sin corrección.
- **Subcampeona guardada para A/B futuro (37):** #3, casi idéntica, orden de palabras más plano.

## 1. HERO
- `h1Marked`: "Hoy tu sobrecarga baja en [acento]2 minutos[/acento] con el Orbe"
  (trace: deseo #1 "desactivar la sobrecarga sensorial en menos de 5 minutos" + mecanismo bautizado)
- `subtitleMarked`: "Audios de autohipnosis en [b]español[/b], hechos para personas altamente sensibles"
  (trace: VoC "no tiene sentido escuchar la sesión en otro idioma" + identidad PAS del avatar)
- ⚠️ Corrección tras 5ª revisión (2026-09-18): la sigla "PAS" aparecía primero en el logo y en el
  CTA sin explicarse — el revisor lo marcó como defecto de usabilidad (nadie debe adivinar qué
  significa la marca en su primer contacto). Se agregó un kicker "Para Personas Altamente
  Sensibles (PAS)" justo arriba del H1, antes de que la sigla vuelva a aparecer en el botón.
- `ctaLabel`: "Descubrir mi arquetipo PAS gratis"
- `ctaHref`: `/onboarding` (Modelo onboarding-first: primera victoria — el test — es gratis y sin
  registro; el pago se cierra en el paywall dentro del recorrido)
- `socialProof`: "Testimonios reales de personas que vivieron este proceso con Ginette Rivas,
  psicóloga clínica creadora de Refugio PAS" (jerarquía día-1, nivel 3 — resultados del propio
  fundador/autora, divulgado con nombre real; NO se presenta como resultado de la app misma,
  que aún no existe, sino de su método terapéutico — honestidad de origen)
- `visual`: mini-demo honesto (HTML/CSS, `components/OrbeHeroVisual.tsx`) que reproduce el Orbe
  que Respira ya aprobado en FICHA-ARTE.md — reemplaza el placeholder tras la 2ª revisión del
  revisor-visual ("el activo más importante de la página no tenía visual real"). Se reemplaza por
  la captura REAL de la pantalla de Inicio en cuanto la app interna exista (Sesión 5).

## 2. PROBLEMA — "¿Te suena?"
(trace: campo "Dolores que no lo dejan dormir" de FICHA-AVATAR, en orden de fuerza)
1. Ícono `HeartHandshake` — "¿Absorbes las emociones y tensiones de los demás sin saber cómo
   soltarlas?" (Dolor #1)
2. Ícono `Volume2` — "¿Te agobias en lugares ruidosos o llenos de gente?" (Dolor #2)
3. Ícono `HandHeart` — "¿Te cuesta decir que no sin sentir culpa después?" (Dolor #3)
4. Ícono `Moon` — "¿Rumias la noche entera lo que viviste, sin poder dormir?" (Dolor #4)

## 3. AGITACIÓN
(trace: "Costo de la inacción" + objeción "ya probé apps de meditación y me aburrí")
- `frases`:
  1. "Cada noche sin soltar el día es sueño reparador que ya no vuelve."
  2. "Ya probaste apps de meditación genéricas — y las abandonaste porque te aburriste."
  3. "Seguir igual no te hace menos sensible: solo te deja más agotado/a."
- `contraste`:
  - `labelHoy`: "Hoy" · `hoy`: "Sobrecarga sensorial, culpa por poner límites y noches en vela."
  - `labelFuturo`: "En 6 meses, si nada cambia" · `futuro`: "Son 6 meses menos de sueño
    reparador." (corregido 2026-09-19, pedido del usuario)

## 4. SOLUCIÓN
- `tituloMarked`: "Tu calma en [acento]2 minutos[/acento], para tu sensibilidad"
- `mecanismo`: "el Orbe que Respira"
- `bigIdeaMarked`: "No te falta fuerza de voluntad — te falta un protocolo hecho para un sistema
  nervioso PAS. [b]El Orbe que Respira[/b] lo activa en 2 minutos."
- `pasos` (trace: mecanismo real de la app — botón SOS + audio guiado):
  1. "Tocas el Orbe" — "Un toque cuando sientes la sobrecarga llegar."
  2. "Respiras con guía" — "Un audio real en español te guía 2 minutos."
  3. "Vuelves a tu centro" — "Tu sistema nervioso baja de revoluciones."
- `antesDespues`: Antes: "Sobrecarga que no sabes bajar, solo/a." · Después: "2 minutos y tu cuerpo
  reconoce el camino de vuelta a la calma."

## 5. LA APP POR DENTRO
- `tituloMarked`: "Tu refugio, [acento]siempre a un toque[/acento]"
- `frames`:
  1. "Descubre tu arquetipo PAS" — pantalla "Test de Arquetipos"
  2. "Tu Orbe que Respira, siempre visible" — pantalla "Inicio"
  3. "Audios de autohipnosis guiada en español" — pantalla "Biblioteca"
  4. "Tus hábitos de calma, día a día" — pantalla "Hábitos"
  (placeholders honestos: la app interna aún no se construye — pendiente anotado en ESTADO.md,
  se reemplazan por screenshots reales al cerrar la Sesión 5)
- Testimonios (≥3 reales, cumple el mínimo de `19`; usa 3 de los 5 aportados por el usuario).
  ⚠️ Corrección tras revisión (2026-09-16): el título y un subtítulo ahora ACLARAN de forma
  VISIBLE (no solo en comentario de código) que son testimonios de las sesiones de terapia e
  hipnosis presenciales de la autora, no de la app —hallazgo del revisor-visual, riesgo de
  prueba social engañosa (52, eje 2 de la rúbrica de copy):
  - Título: "Lo que ya vivieron en sesión con Psicóloga Ginette Rivas" (corregido 2026-09-19,
    pedido del usuario — antes "Lo que ya vivieron en terapia con Ginette Rivas")
  - Subtítulo: "Testimonios reales de sesiones online de Personas Altamente Sensibles "PAS" con
    el mismo método de autohipnosis que grabó en los audios de la app." (corregido 2026-09-19,
    pedido del usuario — antes decía "sesiones de terapia e hipnosis presenciales"; el usuario
    aclaró que las sesiones son online, no presenciales)
  ⚠️ Corrección tras 5ª revisión (2026-09-18): los testimonios #2 y #3 mencionaban "vencí la
  depresión" e "hipnosis regresiva" — el revisor lo marcó como mezcla de la promesa de alivio
  rápido (2 min) con un claim de salud mental no verificable, y en contradicción con la FAQ ("no
  sustituye tratamiento psiquiátrico"). El usuario aportó 2 testimonios nuevos que sí hablan de
  regulación con la respiración y de dormir mejor — se reemplazaron los 2 problemáticos por estos:
  1. "Te agradezco porque realmente siento mejoría en la respiración y mi sensibilidad. Siento
     que ahora aprendí a regular lo que siento sin rechazarlo, sino integrando la experiencia."
     — Clienta real · proceso de regulación emocional (reemplazó al testimonio original de
     "la experiencia de la terapia... tranquila, relajada" por pedido del usuario, 2026-09-18)
  2. "Me encantan los ejercicios que recomiendas: apenas llevo dos días y ya me he podido
     controlar. Hoy trabajé full y me regulé con la respiración." — Clienta real · práctica de
     respiración guiada
  3. "Me siento más liviana, y después de mucho tiempo he vuelto a dormir mejor y a conectar más
     conmigo misma." — Clienta real · proceso de acompañamiento emocional

## 6. OFERTA
> Nota de coherencia con `FICHA-MERCADO.md`/ESTADO.md (cosa juzgada, Sesión 1): la prueba
> gratuita va vinculada SOLO al plan anual (decisión ya aprobada por el usuario) — el
> plan mensual no lleva trial pero sí cancelación libre en cualquier momento.
> ⚠️ Precio actualizado por pedido directo del usuario (2026-09-19): mensual $4.99→$7.99,
> anual $3.33/mes→$4.99/mes ($39.99/año→$59.88/año). Reemplaza el precio original de Sesión 1
> (cosa juzgada anterior) — el usuario decidió subirlo, no una re-discusión del agente.
> ⚠️ El mismo día el usuario probó subir la prueba a 7 días (y la garantía a 14, por la regla
> dura de `FICHA-MERCADO.md` de que garantía > prueba) y luego pidió volver a como estaba:
> prueba 3 días / garantía 7 días. REVERTIDO — queda igual que antes de este experimento.
- `tituloMarked`: "Empieza gratis. Sigue por [acento]$0.17 al día[/acento]"
- `trialDias`: no se usa (2026-10-12: la prueba de 7 días es SOLO del plan anual; el mensual no tiene prueba — se comunica en el badge, CTA y features del anual)
- `stack`: ELIMINADO (2026-10-12, decisión del usuario tras el revisor-visual): los precios ancla ($180/$90/$47, tachado $317) eran inventados y repetían las tarjetas de plan.
- `garantia` (nueva, bajo las tarjetas de plan): "Garantía del Primer Alivio: tienes 15 días para pedir tu reembolso si no sientes alivio real." (plazo de FICHA-MERCADO §4; el copy YA lleva número por decisión del usuario 2026-10-12)
- `anual`: badge "7 DÍAS GRATIS · MÁS POPULAR" (ajustado tras 2ª revisión: el kit no soporta
  trial por-plan, así que el trial se hace visible en el propio badge del anual en vez del
  `TrialBadge` genérico, que habría marcado también al mensual sin trial) · precioMes "$4.99" ·
  totalAnual "Se cobra $59.88/año" ·
  ahorro "Ahorras 4 meses" (12 − 59.88/7.99 ≈ 4.5, redondeado hacia abajo) · descomposicionDia
  "menos de $0.17 al día" · ctaLabel "Empezar mi prueba de 7 días gratis" · features (la 1ª: "Incluye 7 días de prueba gratis"; el mensual NO lleva prueba):
  - "Tu Orbe que Respira, incluso sin internet"
  - "Biblioteca de audios de autohipnosis guiada"
  - "Un audio nuevo cada mes, sin costo extra"
  - "Los 4 módulos de tu proceso PAS"
  - "Hábitos con racha, recordatorio suave y hábitos propios · Diario con tu intensidad y los 4 módulos de tu proceso PAS"
- `mensual`: precioMes "$7.99" · ctaLabel "Empezar con el plan mensual" · features:
  - "Tu Orbe que Respira, incluso sin internet"
  - "Biblioteca de audios de autohipnosis guiada"
  - "Un audio nuevo cada mes, sin costo extra"
  - "Acceso completo desde el primer día"
  - "Cancelas cuando quieras"

## 7. GARANTÍA — SECCIÓN ELIMINADA (2026-09-19, pedido del usuario)
La caja completa de "la Garantía del Primer Alivio" (ícono + nombre + condición) se quitó de la
página por pedido directo del usuario — ya no se importa `<Garantia>` en `app/page.tsx`. Queda
solo la mención breve "Garantía del Primer Alivio · hasta 7 días de prueba gratis" dentro del CTA final
(sección 9) y el nombre en `psMarked` — esos NO se tocaron, el usuario pidió quitar la caja, no
toda mención al concepto.

## 8. FAQ
(trace: campo "Objeciones reales" de FICHA-AVATAR, en su orden de fuerza)
1. "¿Esto reemplaza a mi terapeuta?" → "No: Refugio PAS te acompaña entre sesiones, [b]no
   sustituye tratamiento psiquiátrico[/b] ni de crisis. Ante una emergencia, busca ayuda
   profesional de inmediato."
2. "¿Los audios son genéricos, como en otras apps?" → "No: los grabó Ginette Rivas, psicóloga
   especializada en PAS, con protocolos para sobrecarga sensorial — [b]no meditación general[/b]."
3. "Ya probé apps de meditación y me aburrí, ¿esto es distinto?" → "Sí: el Orbe no es meditación
   genérica — es un protocolo de 2 minutos [b]hecho para tu sistema nervioso[/b] altamente sensible."
4. "¿Puedo cancelar cuando quiera?" → "Sí, cancelas cuando quieras desde tu cuenta, [b]sin
   llamadas ni letra chica[/b]."
5. "¿Es seguro pagar en dólares desde mi país?" → "Sí: Hotmart procesa tu pago con tarjeta,
   PayPal u otros medios locales de forma segura."

## 9. CTA FINAL EMOCIONAL
- `h2Marked`: "Tu calma, [acento]a 2 minutos[/acento]"
- `futurePacingMarked`: "Sientes la sobrecarga llegar, tocas el Orbe, y en 2 minutos tu cuerpo
  vuelve a su centro, sin culpa, sin esperar a que pase."
- `ctaLabel`: "Descubrir mi arquetipo PAS gratis"
- `recap`: "Garantía del Primer Alivio · hasta 7 días de prueba gratis"
- `psMarked`: "PS: Refugio PAS calma tu sobrecarga sensorial en 2 minutos con el Orbe que
  Respira, en audios reales de autohipnosis en español hechos por una psicóloga especializada en
  PAS. Hoy entras con hasta 7 días gratis y la Garantía del Primer Alivio."

## Corrección de bug: los degradés de fondo no se pintaban (2026-09-16)
- Causa raíz: `SectionShell`/`Hero`/`CtaFinal` tenían `position: relative` pero NO establecían un
  contexto de apilamiento propio (`isolation`) — el div del mesh con `-z-10` terminaba apilándose
  contra la RAÍZ de la página en vez de contra su propia sección, quedando invisible detrás del
  fondo del `<body>`. Fix: se agregó `isolate` a las 3 secciones que pintan su propio mesh.
  Además, una condición mal puesta (`flush !== 'bottom'`) apagaba el tinte justo en la sección
  "Problema" (la que más lo necesitaba) — se quitó esa condición.
- A pedido del usuario ("subir un poco más de color" al rosa): se subió la intensidad del mesh
  rosa de ~9-16% a 30-38% (el dorado se deja igual, más discreto) y se reforzaron los bordes
  rosa (hairline 45%→62%, tarjeta mensual 55%→75% + borde de 2px).

## Pulido de vacíos e íconos + fondos con degradé (2026-09-16, a pedido del usuario)
- `SectionShell` (ui.tsx) ahora acepta `tint: 'none'|'dorado'|'rosa'` — pinta un mesh radial muy
  sutil (6-9% opacidad, misma técnica del fondo del Hero) para romper la repetición de bloques de
  color plano al hacer scroll. Alternancia: Problema=rosa, Solución=dorado, AppPorDentro=rosa,
  Testimonios=rosa, Oferta=dorado, Garantía=dorado, FAQ=ninguno (se deja neutro para no competir
  con la lectura densa del acordeón).
- Agitación: cada frase ahora lleva un ícono muted (Clock3/TrendingDown/RotateCcw) — antes era
  texto plano sin ancla visual.
- Solución: el bloque antes/después ahora lleva ícono (X para "antes", Sparkles para "después").
- Testimonios: cada tarjeta lleva un ícono de comillas (Quote, en rosa) — antes solo tenía texto.

## Ajuste de matices rosa pastel (2026-09-16, a pedido del usuario: "más tierna")
- El Orbe del hero ahora usa el degradé EXACTO de FICHA-ARTE (dorado→rosa, no solo dorado):
  `radial-gradient(circle at 32% 28%, accent 38%+white, accent-2 55%+white 75%)`.
- El componente `<Hairline>` del kit (usado en el chip del mecanismo, la garantía, la tarjeta del
  plan anual y los testimonios) ahora degrada dorado→rosa en el borde, tal como pedía la ficha
  ("hairline degradé dorado→rosa") — antes solo iba a transparente.
- La tarjeta del plan Mensual lleva un borde rosa pastel sutil (antes neutro), como las
  `chip-dato`/`animo-card` del diseño original de la app.

## Ajustes de contraste y luminosidad del botón (2026-09-16, tras revisiones + feedback del usuario)
- El dorado de FICHA-ARTE (#C2921F) usado directo como fondo de botón con texto claro daba
  ~2.7:1 de contraste (falla AA 4.5:1) — corregido primero oscureciéndolo, pero el usuario pidió
  "más luminoso y llamativo". Solución final: `--accent-cta` (fondo del botón) es una versión
  MÁS CLARA del dorado (`color-mix(in oklab, var(--accent) 82%, white)`) emparejada con texto
  OSCURO (`--text-primary`) encima — así el botón se ve más brillante Y el contraste sube a la
  vez (~5:1), en vez de bajar. `--accent-ink` (dorado oscurecido) se reserva para cuando el
  acento se usa como TEXTO sobre fondo claro (botón mensual en outline). Tokens en
  `components/landing/tokens.css`.

## 10. FOOTER LEGAL
- `appName`: "Refugio PAS"
- `soporteEmail`: ⚠️ PENDIENTE — falta el correo de soporte real de la marca (se define cuando
  el usuario elija el dominio, Sesión 6/8). No se publica un email inventado.
- `enlaces`: Privacidad, Términos y Condiciones, Reembolsos, Aviso de IA (⚠️ estas 4 páginas
  legales NO existen todavía — se redactan con `47-LEGAL-FISCAL-Y-PRIVACIDAD.md` antes de
  declarar la landing terminada; el kit no se publica con enlaces muertos)

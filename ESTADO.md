# ESTADO — Refugio PAS: Guía & Autohipnosis
Última actualización: 2026-09-15 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: FICHA-MODELO.md, FICHA-AVATAR.md (BORRADOR) y FICHA-MERCADO.md creadas; usuario confirmó que los audios de autohipnosis se graban con voz humana real / Siguiente acción exacta: definir arquitectura técnica (datos/RLS/auth) de la Sesión 1, presentar Plan Maestro y pasar a Sesión 2 (identidad visual).

## Qué es esta app (3 líneas máximo)
Botiquín móvil de autorregulación emocional, desintoxicación sensorial y autohipnosis guiada para Personas Altamente Sensibles (PAS) en español. Test de arquetipo PAS + botón SOS + biblioteca de audios de autohipnosis + módulos didácticos + diario de journaling. Suscripción mensual/anual con prueba gratis de 3 días.

## Promesa central
"Esta app ayuda a personas altamente sensibles de LATAM y España a calmar su sistema nervioso y dormir en paz sin sesiones de terapia caras ni apps genéricas en inglés, mediante autohipnosis guiada en español + un botón SOS de alivio inmediato."

## Reporte de validación (aportado por el usuario — no se re-valida)
- Veredicto: Excelente oportunidad (idea ya investigada por el usuario con el prompt de ideación del curso)
- Apps de referencia: Therapyside/Unobravo ($35-50 USD/sesión, cobro automático) · Reveri ($99.99 USD/año, solo inglés, tono impersonal) · Yana y apps de meditación genéricas (catálogos saturados)
- Lo que los usuarios odian de la competencia (oportunidad): sin traducción/conexión emocional en español · contenido estático que "podría estar gratis en YouTube" · demasiadas opciones quitan claridad · sin protocolos específicos para sobrecarga sensorial PAS · cobro automático poco flexible
- Brecha LATAM confirmada: sí — baja saturación de apps PAS en español, alta saturación de meditación genérica en inglés
- Precio de referencia del mercado: $4.99 USD/mes · $34.99-39.99 USD/año (benchmark Reveri $99.99/año)
- Nicho: Salud mental / bienestar emocional — rasgo PAS (20% de la población, evidencia citada por el usuario)

## Cliente ideal (resumen — ficha completa pendiente en FICHA-AVATAR.md)
- Valeria, 34 años, profesional (educadora/diseñadora/consultora/salud), LATAM o España, poder adquisitivo medio/medio-alto
- Dolor #1: absorbe emociones/tensiones ajenas sin saber cómo desengancharse
- Deseo #1: desactivar la sobrecarga sensorial en menos de 5 minutos en momentos de crisis
- Objeción #1: teme suscripciones automáticas caras y difíciles de cancelar

## Sesión 2 en curso — Identidad visual
- Ruta de diseño: propuesta propia, con restricción de color dada por el usuario (rosa pastel + dorado + blanco, minimalista)
- Comparativa A/B/C creada: `direcciones-abc.html` (raíz del proyecto) — 3 direcciones, misma paleta, distinta composición:
  - A "Refugio Cálido": botón SOS al centro con halo dorado + cards (Fraunces + Albert Sans)
  - B "Anillo de Calma": anillo dorado sobre pista rosa + grid 2x2 de progreso semanal (Instrument Serif + Onest)
  - C "Ritual en Tres Actos": timeline editorial de 3 momentos del día + filete dorado (Marcellus + Figtree)
- Verificado: fuentes cargan en su clase real (sin fallback-trampa), 3 layouts estructuralmente distintos
- Pendiente: elección del usuario (elegir/combinar/otras 3/ajustar) → cierra FICHA-ARTE.md

## Fichas de memoria (Sesión 1)
- FICHA-MODELO.md: APROBADA (2026-09-15) — app modelo: Reveri (2 señales de tracción: descargas/ranking + financiamiento)
- FICHA-AVATAR.md: BORRADOR (2026-09-15) — 7 frases VoC reunidas, faltan ≥3 para aprobar; PROHIBIDO derivar copy de venta hasta completarla en Sesión 3
- FICHA-MERCADO.md: completa (2026-09-15) — vence 2027-03-15

## Dirección de Arte (Sesión 2 — pendiente)
- FICHA-ARTE.md: NO existe todavía
- ¿Hubo referencia visual del usuario?: NO (por confirmar con la pregunta de referencia del 54)

## Estrategia de monetización (decidida por el usuario en su investigación)
- Modelo: Freemium con suscripción mensual y anual
- Precio: $4.99 USD/mes · $34.99 USD/año (~$2.92/mes)
- Trial: 3 días, vinculado al plan anual
- Justificación: ya validado por el usuario contra benchmark del nicho (Reveri, apps de salud mental LATAM)

## MVP — funciones núcleo (definidas por el usuario)
1. Test interactivo PAS + 5 Arquetipos (Alma Introspectiva, Solar, Visionaria, Empática, Luminosa) con diagnóstico personalizado
2. Botón SOS de Desintoxicación Sensorial: audios de 2-5 min
3. Biblioteca de Autohipnosis Guiada (Reset Emocional, El Jardín Interior, Limpieza Energética Nocturna)
4. Módulos didácticos progresivos (Reconocerme, Comprenderme, Sostenerme, Honrarme)
5. Diario digital de journaling + registro de ánimo

## Qué NO construir todavía (definido por el usuario)
- Videollamadas 1:1 o agendamiento nativo (redirigir a Calendly externo)
- Asistente de IA conversacional complejo
- Red social o muro comunitario interno

## Primera victoria (<5 min)
Completar el Test de Arquetipos (3 min), descubrir su arquetipo, y escuchar un audio SOS de 2 min que baja la tensión corporal de inmediato.

## Riesgos identificados (por el usuario)
1. Riesgo legal/salud: confusión entre acompañamiento emocional y tratamiento de crisis psiquiátricas → mitigación: términos de uso y disclaimer visibles antes de ingresar
2. Percepción de contenido estático → mitigación: liberación progresiva + 1-2 audios nuevos por mes
3. Fricción técnica por videollamadas → mitigación: fuera del MVP, redirigir a Calendly

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: aún no iniciada — falta cerrar Sesión 1 (fichas + arquitectura)
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- Landing: pendiente
- Onboarding: pendiente
- Paywall: pendiente
- Login/Auth: pendiente
- App interna: pendiente
- Servicios externos: pendiente

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: Next.js (App Router) — landing con SEO + funnel integrado + futura app; decidido 2026-09-15
- Audios: voz humana real (grabada por la psicóloga/locutor del proyecto), NO generados por IA — confirmado por el usuario 2026-09-15. Se almacenan como archivos estáticos en Supabase Storage, sin necesidad de arquitectura de IA de audio (30-INTEGRACION-IA.md no aplica para este MVP)
- Auth: Supabase Auth con magic link (correo sin contraseña) + Google OAuth — mínima fricción para una app de bienestar donde pedir contraseña agrega barrera emocional innecesaria
- Modelo de datos (esquema base, se refina en Sesión 6): `profiles` (datos de usuario + arquetipo PAS resultante del test) · `subscriptions` (plan, estado, origen=hotmart, vigencia) · `audio_library` (categoría: SOS/biblioteca, título, duración, url del archivo) · `audio_progress` (qué escuchó cada usuario, favoritos) · `journal_entries` (texto, estado de ánimo, fecha) — todas con RLS por `(select auth.uid()) = user_id`, columna user_id indexada

## Sesiones completadas ✅
(ninguna aún)

## Sesión en progreso 🔧
- Sesión 1 — Validación, avatar, monetización y arquitectura: idea capturada, falta FICHA-MODELO.md, FICHA-AVATAR.md, FICHA-MERCADO.md y arquitectura técnica

## Próximas sesiones 📋
- Sesión 2: Identidad visual y sistema de diseño
- Sesión 3: Página de ventas
- Sesión 4: Onboarding, paywall y login
- Sesión 5: App interna simplificada
- Sesión 6: Integraciones reales y seguridad
- Sesión 7: Testing, pulido y rigor de entrega
- Sesión 8: Adquisición, lanzamiento y backoffice

## Problemas conocidos ⚠️
- Ninguno abierto por ahora.

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Ninguna todavía — se avisará cuando llegue el momento de crear cuentas

## Notas para la próxima sesión
- El usuario pegó el RESUMEN FINAL — IDEA VALIDADA completo; no se re-valida el mercado.
- Falta definir: quién provee la voz/los audios de autohipnosis (persona real vs IA) — esto condiciona la arquitectura de la Sesión 1 (30-INTEGRACION-IA.md si aplica).

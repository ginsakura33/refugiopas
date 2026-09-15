# FICHA DE DIRECCIÓN DE ARTE — Refugio PAS

## Referencia del usuario (CONTRATO — ver 16)
- ¿Hay imagen(es) de referencia del usuario?: NO — el usuario dio una preferencia verbal de paleta y estilo ("minimalista, rosa pastel, dorado y blanco"), no una captura. Se trató como restricción de color/identidad (gustos que solo él puede dar), no como referencia-mandato de composición.
- Extracción: N/A — no hay imagen que extraer

## Identidad derivada (fusión de líderes del nicho + restricción de color del usuario)
- TABLA DE LÍDERES (ver FICHA-MODELO.md §1 para el detalle de Reveri): Reveri → sesiones cortas por objetivo, momento aha medible; apps de bienestar femenino en general → paletas suaves/claras, jerarquía por tamaño, mucho aire.
- Combinación tipográfica usada: Fraunces (display, serif con curvas suaves, óptica display) + Albert Sans (body, sans humanista) — par de clase contrastante, dentro de las combinaciones probadas de apps premium/editoriales del 29; NUNCA Inter/Roboto/system-ui.
- Arquetipo: Cuidador (con toque de Inocente) — cálido, protector, suave, luminoso. Coincide con el pedido explícito del usuario (rosa pastel + dorado + blanco = paleta clásica de este arquetipo).
- Mundo del sujeto (0.45): el refugio/santuario personal — luz cálida de una vela, un textil suave, el gesto de "envolver" algo frágil con cuidado → de ahí el HALO dorado alrededor del botón SOS (el gesto de "abrazar" el momento de crisis).
- Dirección del banco 54 usada para el dispositivo ownable: ninguna de las 12 nombradas coincide exactamente (ninguna es rosa+dorado+blanco); se construyó un dispositivo propio — "halo dorado + hairline degradé rosa-dorado" — siguiendo la misma lógica de materiales premium (hairline padding-box/border-box, sombra tintada, nunca negra).

## Personalidad compilada
- 3 adjetivos de personalidad: cálida, protectora, luminosa
- Compilación: spring suave (bounce 0-0.1, casi sin rebote) · duración base 300-350ms · exclamaciones máx 1/pantalla · celebración nivel medio (sin fuegos artificiales, un halo que se intensifica) · radio tendencial 16-20px

## Brand kit final (COMBINACIÓN "Refugio Cálido" + "Anillo de Calma" — ELEGIDA y confirmada 2026-09-15, cosa juzgada)
> Nota de recorrido: entre medio se exploraron y descartaron una ronda 2 (Tarjetas en Cascada / Respiración Central+Nota del Día / Nota del Día) y una ronda 3 (Semana en Calma / Conversación Gentil / Carta Sellada). El usuario las vio todas y pidió volver explícitamente a esta — es la definitiva.
- Fondo: #FFF9F5 · Superficie: #FFFFFF · Hundido: N/A (app clara, sin modo hundido marcado) · Texto 1º/2º: #4A3B3F / #9C8388
- Acento: #C2921F — dorado intenso (CTA principal, badges, íconos de chip, hairlines) · 2ª nota: #F0C9CD (rosa pastel claro — bordes de card, pista) · Botón SOS: gradiente radial dorado luminoso #FDF3DC → #F0CD78 → #C2921F, con glow suave (no anillo duro)
- Semánticos: éxito #7FB59B (verde salvia suave) · error #D97060 (terracota suave, no rojo puro) · aviso #E0B458
- Display: Fraunces (pesos 400/600) · Body: Albert Sans (pesos 400/600/700) · Escala: display 25px / title 17px / body 14-15px / label 11-12px
- Radio: 20px cards / 14px botones · Profundidad: hairline degradé padding-box/border-box (dorado→rosa) en el módulo héroe, sombras tintadas del propio dorado (nunca negras) · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: el ORBE QUE RESPIRA — círculo grande (140px) con degradé suave dorado→rosa (de la dirección "Respiración Central" explorada en la ronda 2), con el texto "2 min" (Fraunces itálica) + "Toca para comenzar" dentro — versión FINAL: tras 5 iteraciones sobre un botón más chico (rosa+halo dorado → dorado+halo dorado → dorado luminoso → dorado con profundidad → medallón satinado), el usuario volvió a ESTE botón (orbe grande) pero pidió el texto "2 min" en vez de "Inhala" (ese texto solo se usa en la pantalla del mecanismo/SOS en acción, no en el botón de Inicio). APROBADO 2026-09-15. Sigue acompañado de la grilla 2x2 de resumen semanal debajo (arquetipo, racha, audios escuchados, próxima sesión)
- Se probó un detalle botánico de línea fina (inspirado en el "Jardín Interior" del ebook) y el usuario lo RECHAZÓ explícitamente — no reintentar ilustraciones botánicas/naturales en este proyecto sin que el usuario lo pida de nuevo.
- Motion signature: ease-out suave `cubic-bezier(0.16, 1, 0.3, 1)` · stagger 70-90ms · firma: fades amplios, casi sin rebote — coherente con arquetipo Cuidador

## Trazabilidad y vetos
- Ruta de diseño: propuesta propia (el usuario dio la restricción de color, no una captura)
- RONDA 1 (2026-09-15): A "Refugio Cálido" (halo dorado, Fraunces/Albert Sans) + B "Anillo de Calma" (grilla 2x2) combinadas — el usuario las combinó, luego pidió explorar más, y al final del recorrido VOLVIÓ a pedir esta combinación exacta. Es la dirección FINAL. C "Ritual en Tres Actos" (Marcellus/Figtree) descartada.
- RONDA 2 (explorada y descartada): A "Tarjetas en Cascada" (Domine/Work Sans) · combinación B "Respiración Central" + C "Nota del Día" (Cormorant/Karla)
- RONDA 3 (explorada y descartada): A "Semana en Calma" (Spectral/Mulish) · B "Conversación Gentil" (Lora/Manrope) · C "Carta Sellada" (Bitter/Sora)
- Nota técnica (por si se reusa Spectral en otro proyecto): necesita pedirse con pesos ESTÁTICOS en la URL de Google Fonts (`ital,wght@0,400;0,600;0,700;1,400;1,600`), no con rango de variable font — con rango cae al fallback-trampa.
- página comparativa: `direcciones-abc.html` (restaurada a la versión de la Ronda 1 combinada) · screenshots: verificados en sesión (fuentes cargando en su clase real, sin fallback-trampa) — no se guardó copia PNG en docs/revisiones/ por no contar con herramienta de captura a archivo en este entorno; el HTML mismo queda como evidencia versionada en git
- Tour de la app: `vista-previa-app.html` (restaurado a la versión Refugio Cálido) — 4 vistas: Inicio/M0 (halo dorado + grilla), Onboarding, Paywall ($39.99/año), Mecanismo (SOS en acción con anillo de respiración) · aprobado por el usuario: PENDIENTE — se re-confirma a continuación
- Paleta derivada de: restricción de color del usuario (rosa pastel + dorado + blanco) + lógica de "1 acento, uso disciplinado" de los líderes de bienestar · Dispositivo ownable elegido: halo dorado en el botón SOS + grilla 2x2
- Registro anti-repetición: paleta (rosa pastel #F0C9CD + dorado #C2921F + blanco cálido #FFF9F5) y par tipográfico (Fraunces + Albert Sans) quedan anotados en ESTADO.md como VETADOS para el PRÓXIMO proyecto del SO (dentro de este proyecto siguen vigentes)
- Modo (claro/oscuro) DERIVADO por: arquetipo Cuidador/Inocente + pedido explícito del usuario de blanco como base

## Idioma UI: Español latino neutro · Fecha de cierre de la ficha: 2026-09-15 · Aprobada por el usuario: SÍ (2026-09-15) — cosa juzgada, no se redecide a mitad de proyecto

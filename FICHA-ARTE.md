# FICHA DE DIRECCIÓN DE ARTE — Refugio PAS

## Referencia del usuario (CONTRATO — ver 16)
- ¿Hay imagen(es) de referencia del usuario?: NO — el usuario dio una preferencia verbal de paleta y estilo ("minimalista, rosa pastel, dorado y blanco"), no una captura. Se trató como restricción de color/identidad (gustos que solo él puede dar), no como referencia-mandato de composición.
- Extracción: N/A — no hay imagen que extraer

## Identidad derivada (fusión de líderes del nicho + restricción de color del usuario)
- TABLA DE LÍDERES (ver FICHA-MODELO.md §1 para el detalle de Reveri): Reveri → sesiones cortas por objetivo, momento aha medible; apps de bienestar femenino en general → paletas suaves/claras, jerarquía por tamaño, mucho aire. La composición de las 3 opciones A/B/C se derivó de patrones probados de apps de bienestar (héroe+cards / anillo de progreso / timeline editorial), no de un solo líder.
- Combinación tipográfica usada: Fraunces (display, serif con curvas suaves, óptica display) + Albert Sans (body, sans humanista) — par de clase contrastante (serif display + sans geométrica), dentro de las combinaciones probadas de apps premium/editoriales del 29; NUNCA Inter/Roboto/system-ui.
- Arquetipo: Cuidador (con toque de Inocente) — cálido, protector, suave, luminoso. Coincide con el pedido explícito del usuario (rosa pastel + dorado + blanco = paleta clásica de este arquetipo).
- Mundo del sujeto (0.45): el refugio/santuario personal — luz cálida de una vela, un textil suave, el gesto de "envolver" algo frágil con cuidado → de ahí el HALO dorado alrededor del botón SOS (el gesto de "abrazar" el momento de crisis).
- Dirección del banco 54 usada para el dispositivo ownable: ninguna de las 12 nombradas coincide exactamente (ninguna es rosa+dorado+blanco); se construyó un dispositivo propio compatible con el espíritu del banco — "halo dorado + hairline degradé rosa-dorado" — siguiendo la misma lógica de materiales premium (hairline padding-box/border-box, sombra tintada, nunca negra).

## Personalidad compilada
- 3 adjetivos de personalidad: cálida, protectora, luminosa
- Compilación: spring suave (bounce 0-0.1, casi sin rebote) · duración base 300-350ms · exclamaciones máx 1/pantalla · celebración nivel medio (sin fuegos artificiales, un halo que se intensifica) · radio tendencial 16-20px

## Brand kit final (COMBINACIÓN "Respiración Central" + "Nota del Día" — elegida 2026-09-15, cosa juzgada)
- Fondo: #FFFBF8 · Superficie: #FFFFFF · Hundido: N/A (app clara, sin modo hundido marcado) · Texto 1º/2º: #4B3A3E / #A08D91
- Acento: #CFA05C — dorado suave (SOLO en: orbe de respiración, CTA principal, sello de la nota, filete superior de tarjetas, chips destacados) · 2ª nota: #F3D6D9 (rosa pastel — pista del orbe, bordes de tarjeta; reservada a detalles secundarios para que el dorado siga siendo EL acento)
- Semánticos: éxito #7FB59B (verde salvia suave, coherente con la paleta cálida) · error #D97060 (terracota suave, no rojo puro) · aviso #E0B458
- Display: Cormorant, itálica (pesos 400/600) · Body: Karla (pesos 400/600/700) · Escala: display 21-26px / title 16px / body 14-15px / label 10-11px
- Radio: 20px cards / 999px botones (píldora) · Profundidad: sombras tintadas del propio dorado (nunca negras), el orbe con halo de luz radial · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: el ORBE que respira (círculo cálido central, la pantalla entera gira en torno a él — "menos interfaz, más alivio") + la tarjeta "Nota del Día" con sello circular y filete dorado superior, debajo del orbe
- Se probó un detalle botánico de línea fina (inspirado en el "Jardín Interior" del ebook) y el usuario lo RECHAZÓ explícitamente (2026-09-15) — retirado. NO reintentar ilustraciones botánicas/naturales en este proyecto sin que el usuario lo pida de nuevo.
- Motion signature: ease-out suave `cubic-bezier(0.16, 1, 0.3, 1)` · stagger 70-90ms · firma: fades amplios, casi sin rebote, el orbe pulsa lento (inhala/exhala) — coherente con arquetipo Cuidador

## Trazabilidad y vetos
- Ruta de diseño: propuesta propia (el usuario dio la restricción de color, no una captura)
- RONDA 1 (descartada por completo — el usuario pidió "3 direcciones totalmente nuevas" el 2026-09-15): combinación de A "Refugio Cálido" (halo dorado + Fraunces/Albert Sans) + B "Anillo de Calma" (grilla 2x2), y C "Ritual en Tres Actos" (timeline editorial, Marcellus/Figtree) — NO re-proponer esta composición ni estos pares tipográficos.
- RONDA 2: A "Tarjetas en Cascada" (Domine/Work Sans) descartada · la combinación B "Respiración Central" + C "Nota del Día" (Cormorant/Karla) se probó, el usuario la vio y luego pidió una RONDA 3 completa — también descartada, no re-proponer.
- RONDA 3 (vigente, 2026-09-15): A "Semana en Calma" (franja de 7 días, Spectral/Mulish) · B "Conversación Gentil" (chat de check-in, Lora/Manrope) · C "Carta Sellada" (sobre que se abre, Bitter/Sora) — página comparativa: `direcciones-abc.html` (reescrita otra vez) · pendiente de elección del usuario
- Nota técnica: Spectral necesitó pedirse con pesos ESTÁTICOS en la URL de Google Fonts (`ital,wght@0,400;0,600;0,700;1,400;1,600`), no con rango de variable font (`0,400..700`) — con rango no cargaba y caía al fallback-trampa (monospace). Si se reusa Spectral en este proyecto, mantener la sintaxis de pesos estáticos.
- screenshots: verificados en sesión (fuentes cargando en su clase real, sin fallback-trampa) — no se guardó copia PNG en docs/revisiones/ por no contar con herramienta de captura a archivo en este entorno; el HTML mismo queda como evidencia versionada en git
- Tour de la app: `vista-previa-app.html` (reconstruido 2026-09-15 con la combinación B+C) — 4 vistas: Inicio/M0 (orbe + nota del día), Onboarding, Paywall ($39.99/año), Mecanismo (orbe grande en pantalla completa) · aprobado por el usuario: PENDIENTE — se presenta a continuación en esta sesión
- Paleta derivada de: restricción de color del usuario (rosa pastel + dorado + blanco) + lógica de "1 acento, uso disciplinado" de los líderes de bienestar · Dispositivo ownable elegido: halo dorado en el botón SOS
- Registro anti-repetición: paleta (rosa pastel #F0C9CD + dorado #C2921F + blanco cálido #FFF9F5) y par tipográfico (Fraunces + Albert Sans) quedan anotados en ESTADO.md como VETADOS para el próximo proyecto del SO
- Modo (claro/oscuro) DERIVADO por: arquetipo Cuidador/Inocente + pedido explícito del usuario de blanco como base — claro es, además, más distintivo hoy que oscuro+neón

## Idioma UI: Español latino neutro · Fecha de cierre de la ficha: 2026-09-15 · Aprobada por el usuario: PENDIENTE (falta aprobar el tour)

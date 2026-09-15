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

## Brand kit final (Opción A — "Refugio Cálido", dorado intensificado por pedido del usuario)
- Fondo: #FFF9F5 · Superficie: #FFFFFF · Hundido: N/A (app clara, sin modo hundido marcado) · Texto 1º/2º: #4A3B3F / #9C8388
- Acento: #C2921F — dorado intenso (ajustado desde #C9A15A por pedido del usuario) (SOLO en: botón SOS, CTA principal, badges, íconos de chip, hairlines) · 2ª nota: #F0C9CD (rosa pastel — en bordes de card, pista del anillo, nodos de timeline; porqué: es la mitad de la paleta pedida por el usuario, reservada a detalles secundarios para que el dorado siga siendo EL acento)
- Semánticos: éxito #7FB59B (verde salvia suave, coherente con la paleta cálida) · error #D97060 (terracota suave, no rojo puro) · aviso #E0B458
- Display: Fraunces (pesos 400/600) · Body: Albert Sans (pesos 400/600/700) · Escala: display 25px / title 17px / body 14-15px / label 11-12px
- Radio: 20px cards / 14px botones · Profundidad: hairline degradé padding-box/border-box (dorado→rosa) en el módulo héroe, sombras tintadas del propio dorado (nunca negras) · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: halo dorado alrededor del botón SOS (anillo de luz que comunica "aquí está tu ayuda" en el primer segundo) — propio del proyecto, inspirado en el banco 54 pero sin dirección exacta que coincidiera. Se combina con el módulo de grilla 2x2 (tomado de la Opción B) para el resumen semanal: arquetipo, racha, audios escuchados, próxima sesión.
- Se probó un detalle botánico de línea fina (inspirado en el "Jardín Interior" del ebook) y el usuario lo RECHAZÓ explícitamente (2026-09-15) — retirado de ambos archivos. NO reintentar ilustraciones botánicas/naturales en este proyecto sin que el usuario lo pida de nuevo.
- Motion signature: ease-out suave `cubic-bezier(0.16, 1, 0.3, 1)` · stagger 70-90ms · firma: fades amplios, casi sin rebote — coherente con arquetipo Cuidador

## Trazabilidad y vetos
- Ruta de diseño: propuesta propia (el usuario dio la restricción de color, no una captura)
- Protocolo A/B/C: opción elegida COMBINACIÓN de A + B — el botón SOS con halo dorado (dispositivo ownable de A) como héroe, más la grilla 2x2 de resumen semanal (módulo de B: arquetipo, racha, audios, próxima sesión), todo con la tipografía y paleta de A (Fraunces + Albert Sans, dorado intensificado #C2921F) · descartada: C "Ritual en Tres Actos" (timeline editorial, Marcellus + Figtree) — queda disponible como dirección alternativa si se quisiera retomar · página comparativa: `direcciones-abc.html` (raíz del proyecto, opción A actualizada con la combinación) · screenshots: verificados en sesión (fuentes cargando en su clase real, sin fallback-trampa) — no se guardó copia PNG en docs/revisiones/ por no contar con herramienta de captura a archivo en este entorno; el HTML mismo queda como evidencia versionada en git
- Tour de la app: `vista-previa-app.html` (raíz del proyecto) — 4 vistas: Inicio/M0 (con la grilla combinada), Onboarding (pregunta del test PAS), Paywall (plan anual recomendado, $39.99/año), Mecanismo (SOS en acción con anillo de respiración) · aprobado por el usuario: PENDIENTE — se presenta a continuación en esta sesión
- Paleta derivada de: restricción de color del usuario (rosa pastel + dorado + blanco) + lógica de "1 acento, uso disciplinado" de los líderes de bienestar · Dispositivo ownable elegido: halo dorado en el botón SOS
- Registro anti-repetición: paleta (rosa pastel #F0C9CD + dorado #C2921F + blanco cálido #FFF9F5) y par tipográfico (Fraunces + Albert Sans) quedan anotados en ESTADO.md como VETADOS para el próximo proyecto del SO
- Modo (claro/oscuro) DERIVADO por: arquetipo Cuidador/Inocente + pedido explícito del usuario de blanco como base — claro es, además, más distintivo hoy que oscuro+neón

## Idioma UI: Español latino neutro · Fecha de cierre de la ficha: 2026-09-15 · Aprobada por el usuario: PENDIENTE (falta aprobar el tour)

# VEREDICTO revisor-visual — paywall (paso 1 recap + paso 2 planes)
Fecha: 2026-10-12 12:00
Screenshot: docs/revisiones/paywall-precio-375.png (paso 1: docs/revisiones/paywall-recap-375.png)
Usabilidad: 27/40
Craft: 14/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Paso 2, titular "Sigue por $0.17 al día"] El titular es fijo: con Mensual seleccionado ($7.99/mes, ~$0.26/día) afirma un precio que no corresponde -> hacer el titular dependiente de `seleccion` (mensual: "Sigue por $7.99 al mes") o fijarlo solo al anual con etiqueta.
2. [Paso 1 recap, toda la pantalla] Personalización invisible y vacío muerto: fallback "para tu Refugio — con tu ritual pensado para cuando lo necesites" suena genérico y repite "Refugio"; ~150px de aire entre la tarjeta y el CTA; cero prueba (hay 5 testimonios reales en FICHA-AVATAR sin usar) ni escena de dolor -> mostrar arquetipo/momento/dolor reales del onboarding (con datos semilla en el screenshot), añadir 1 testimonio real con fuente y llenar el hueco.
3. [Paso 2, tarjetas Anual/Mensual] Estado seleccionado débil: sin radio/check, y la tarjeta Mensual (borde rosa fino, "3 días gratis" suelto) es casi indistinguible en jerarquía; las tarjetas no tienen whileTap -> añadir indicador de selección (círculo/check) y whileTap 0.98.
4. [Paso 2, zona bajo el CTA] Redundancia y objeciones sin responder: "$59.88" aparece 4 veces (timeline, tarjeta, línea bajo CTA, y CTA) mientras faltan medios de pago (objeción 5 de FICHA-AVATAR) y el aviso de que no sustituye tratamiento (objeción 6); icono ShieldCheck desalineado respecto al texto de 2 líneas -> quitar la línea duplicada, añadir una línea de medios de pago/seguridad y alinear el icono arriba (items-start).
5. [Paso 2, CTA y salidas] El CTA no es sticky (en pantallas <700px baja del pliegue), "Empezar" va a /entrar sin estado de error ni reintento, y desde el paso 2 la X manda a /onboarding en lugar de volver al recap; el estado "Un momento…" cae en disabled gris -> hacer CtaFijo sticky al pie, spinner inline en vez de disabled, X del paso 2 vuelve al paso 1.

Notas verificadas: precios $4.99/$7.99/$59.88, prueba 7/3 días y garantía 15 días coinciden con FICHA-MERCADO; la garantía no fija fecha de inicio (correcto). Paleta/tipografía (Fraunces + Albert Sans, dorado + rosa) coinciden con FICHA-ARTE; no hay clon de ejemplos vetados. Identidad ownable ausente en el paywall (sin orbe ni dispositivo firma): eje 3 = 2. CTA: 52px, whileTap 0.97, no disabled por defecto (cumple). Motion: stagger, línea de timeline dibujada, reduced-motion en useReveal; la línea del timeline no respeta reduced-motion; sin celebración ni conteo (aceptable en paywall). Heurística 3/7 en código: salida "Ahora no" y X presentes; sin atajos ni "restaurar compra" (oculto a propósito). Copy: idea 3, especificidad 2, emoción 2, oferta 3, acción 3 (CTA en 1ª persona, bien).

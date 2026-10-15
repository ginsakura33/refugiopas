# VEREDICTO revisor-visual — onboarding
Fecha: 2026-10-12 17:00
Screenshot: docs/revisiones/onboarding-resultado-375.png (también onboarding-pregunta-375.png, onboarding-orbe-375.png, onboarding-salida-375.png [versión anterior del diálogo; etiquetas actuales verificadas en código])
Usabilidad: 28/40
Craft: 13/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Paso 19, CTA final + diálogo de salida, app/onboarding/page.tsx PrimeraVictoria] Al terminar la sesión el botón dice "Ver mi Refugio", pero onContinuar hace router.push('/paywall'). El diálogo promete "Tu primera sesión sigue disponible dentro de la app", y el usuario aún no tiene cuenta ni pago. Promesa que no se cumple, mensaje y destino que no coinciden. Fix: rotular "Ver mis planes" y quitar o corregir la frase de "dentro de la app".
2. [Pasos 10 y 17, momentos héroe] Faltan las baselines de movimiento. El "6 de 10" no cuenta de 0 a 6. No hay celebración al revelar el arquetipo ni al completar la sesión. El diálogo de salida aparece sin animación ni scrim. Fix: conteo animado del número héroe, un halo breve al revelar el arquetipo y entrada animada del diálogo, todo con reduced-motion.
3. [Paso 12 con "Otra cosa", CTA "Continuar"] Pill deshabilitado por defecto y sin hint, lo que viola el CTA héroe vivo. Además, "Atrás" no cierra el campo de texto: salta al paso 11 y deja mostrarOtroDolor activo. Fix: dejar el CTA habilitado y validar al toque con mensaje; que atrás cierre primero el input.
4. [Pasos 12 a 17, flujo] El dolor elegido en el paso 12 no se usa en ningún reconocimiento ni en el loading (solo siesCount, arquetipo y minutos). La pantalla "Tiene sentido" es genérica y su claim comparativo "el Orbe sí" no tiene prueba. El estado se pierde al recargar (paso en useState, sin persistencia). Fix: espejar la frase literal del dolor en los pasos 14 y 17, y persistir el paso en sessionStorage.
5. [Paso 11, pregunta de arquetipo, screenshot] Hay 5 opciones, que es el límite del gate de carga. La instrucción dice "Elige la frase" pero son listas de palabras. "Amor, compasión e intuición" y "Conexión, canalización y propósito" se confunden, y los íconos Heart y HandHeart no ayudan. Además, el % de progreso (12px, text-tertiary #9C8388 sobre crema) está bajo AA, y el resultado (paso 10) es texto plano sin superficie ni profundidad. Fix: reformular a frases con verbo, oscurecer el color del %, y dar al paso 10 una card con hairline.

Detalle usabilidad: h1:3 h2:3 h3:3 h4:3 h5:2 h6:3 h7:2 h8:3 h9:3 h10:3
Detalle craft: jerarquía:3 profundidad:2 identidad:3 movimiento:2 encaje:3
Detalle copy: idea:3 especificidad:2 emoción:3 oferta:2 acción:3
Notas: No se encontró desvío de paleta, fuente ni radios frente a FICHA-ARTE (Fraunces + Albert Sans, dorado, rosa, crema). No coincide con las paletas vetadas. El logo del paso 0 es un cuadrado de acento sin tratamiento. Heurísticas 3 y 7 verificadas en código: atrás, pausa, "Terminar sesión" y confirmación de salida están bien; no hay saltar ni reanudar. No hay prueba social ni nombre de garantía en el recorrido; la garantía se verifica en el paywall.

# VEREDICTO revisor-visual — inicio
Fecha: 2026-10-12 12:00
Screenshot: docs/revisiones/inicio-375.png
Usabilidad: 28/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Pantalla completa, 6 bloques: orbe, ánimo, frase, proceso, 3 chips] Gate de carga cognitiva: más de 4 bloques en la primera vista y los 3 chips quedan bajo el pliegue (~120px de scroll). Fix: quitar la frase del día o fusionarla bajo el saludo, y sacar los chips o llevarlos a Perfil.
2. [Orbe SOS, zona central] El orbe es el botón SOS pero nada dice "SOS" ni "calma ahora". Dentro dice "2 min / Toca para comenzar" y debajo repite "Toca el orbe para liberar la sobrecarga". Fix: dejar una sola instrucción, con el verbo de crisis ("Calmarme ahora · 2 min").
3. [Chequeo de ánimo, 5 caritas] Las etiquetas de 12px en --text-tertiary y la fecha de 13px tienen contraste dudoso sobre blanco o crema (a ojo en el screenshot parece ~3:1, no la corrección AA de la ficha). Las caritas son emojis del sistema (excepción aprobada, pero rompen la identidad dorado/rosa). Fix: pasar las etiquetas a --text-secondary y medir el contraste real; unificar el estilo de las caritas.
4. [Chequeo de ánimo, tras tocar] El guardado solo da una línea de texto ("Ánimo de hoy guardado: Tensa."), sin deshacer ni cambiar de forma visible, y el CTA del diario aparece de golpe y desplaza el layout. Fix: reservar el alto del bloque y mostrar un check animado con "Cambiar".
5. [Chips inferiores y progreso] "días de racha" y "audios" son datos fijos de ejemplo (PERFIL_DEMO) y no cambian con el uso. No hay celebración en hitos (sesión completada solo muestra un texto de 13px), ni hápticos. El movimiento llega a 3/4; falta la celebración. Fix: leer los valores reales y añadir un halo o spring al completar la sesión del Orbe.
Notas de código: reduced-motion implementado (useReveal, Orbe, CountUp). Control verificado: pausa/reanuda, "Terminar sesión", "Cancelar" en la preparación y error con solución. Atajos: ninguno (sin ánimo precargado ni "continuar sesión"). Paleta y tipografía coinciden con FICHA-ARTE (Fraunces + Albert Sans, dorado + rosa); no es clon de Capítulo ni de Umbral. Hay 7 tamaños de texto (12/13/14/15/18/22/26) frente al máximo de 3-4 niveles.

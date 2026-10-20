-- Lo que la persona eligió en el recorrido de inicio: su dolor principal y el momento en que más necesita calma.
-- Sirve para recomendarle el audio que mejor le responde. Solo se guarda la CATEGORÍA elegida (nunca texto libre).
-- Las columnas se llenan una sola vez, cuando la persona entra por primera vez, y ella puede cambiarlas después.

alter table public.profiles
  add column if not exists dolor text check (dolor in ('emociones', 'ruido', 'limites', 'rumiacion', 'otro')),
  add column if not exists momento text check (momento in ('casa', 'trabajo', 'noche', 'cualquiera'));

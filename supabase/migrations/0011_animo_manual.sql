-- Distingue la intensidad que la persona ELIGIÓ de la que la app puso por defecto (5) al tocar solo el ánimo en
-- Inicio. Así, un valor por defecto nunca pisa un valor elegido en otro dispositivo. Lo que ya existía se considera elegido.
alter table public.animo_dias add column if not exists manual boolean not null default true;

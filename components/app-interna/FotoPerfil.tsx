'use client';

// Foto de perfil. Tres piezas que comparten la misma lógica:
//  · useFotoPerfil — carga, sube y quita la foto.
//  · AvatarPerfil  — el círculo con la foto (o el ícono si no hay), con o sin camarita.
//  · EditorFoto    — la foto grande con "Cambiar foto" y "Quitar foto" (se usa en Editar perfil).
// La foto se elige de la galería o se toma con la cámara, se recorta a cuadrado y se reduce a 256x256 JPEG EN EL
// CELULAR (así pesa ~30 KB y se borran los datos ocultos, como la ubicación) y se guarda en un espacio privado:
// solo esta cuenta puede verla (bucket "avatars", RLS por carpeta).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const LADO = 256;
const MAX_ORIGINAL = 15 * 1024 * 1024;

async function reducir(archivo: File): Promise<Blob> {
  const bmp = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
  const lado = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement('canvas');
  canvas.width = LADO;
  canvas.height = LADO;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, LADO, LADO);
  ctx.drawImage(bmp, (bmp.width - lado) / 2, (bmp.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  bmp.close();
  return new Promise((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error('blob'))), 'image/jpeg', 0.85));
}

export function useFotoPerfil() {
  const [url, setUrl] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'subiendo'>('cargando');
  const [aviso, setAviso] = useState('');

  const cargar = useCallback(async (id: string) => {
    // Solo se pide el enlace si hay una foto guardada (así no hay peticiones que fallen para quien no tiene).
    const sb = createClient();
    const { data: lista } = await sb.storage.from('avatars').list(id, { limit: 1, search: 'avatar.jpg' });
    if (!lista?.some((f) => f.name === 'avatar.jpg')) return setUrl(null);
    const { data } = await sb.storage.from('avatars').createSignedUrl(`${id}/avatar.jpg`, 3600);
    setUrl(data?.signedUrl ?? null);
  }, []);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(async ({ data }) => {
        const id = data.session?.user.id;
        if (id) {
          setUid(id);
          await cargar(id);
        }
        setEstado('listo');
      });
  }, [cargar]);

  const elegir = async (archivo: File | undefined) => {
    if (!archivo || !uid) return;
    setAviso('');
    if (!archivo.type.startsWith('image/')) return setAviso('Elige una imagen (una foto de tu galería o de la cámara).');
    if (archivo.size > MAX_ORIGINAL) return setAviso('Esa foto es demasiado pesada. Elige otra.');
    setEstado('subiendo');
    try {
      const blob = await reducir(archivo);
      const { error } = await createClient()
        .storage.from('avatars')
        .upload(`${uid}/avatar.jpg`, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
      if (error) throw error;
      await cargar(uid);
    } catch {
      setAviso('No pudimos guardar tu foto. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setEstado('listo');
    }
  };

  const quitar = async () => {
    if (!uid) return;
    setAviso('');
    setEstado('subiendo');
    const { error } = await createClient().storage.from('avatars').remove([`${uid}/avatar.jpg`]);
    if (error) setAviso('No pudimos quitar tu foto. Inténtalo de nuevo.');
    else setUrl(null);
    setEstado('listo');
  };

  return { url, subiendo: estado === 'subiendo', ocupado: estado !== 'listo', puedeSubir: !!uid, aviso, elegir, quitar };
}

/** El círculo con la foto (o el ícono si no hay). `grande` = 96 px; si no, 64 px. `camarita` solo adorna: el toque lo da quien lo envuelve. */
export function AvatarPerfil({ url, subiendo = false, grande = false, camarita = false }: { url: string | null; subiendo?: boolean; grande?: boolean; camarita?: boolean }) {
  return (
    <span className="relative inline-block shrink-0">
      <span
        className={`flex items-center justify-center overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--chip-bg)] shadow-[var(--shadow-1)] ${grande ? 'size-24' : 'size-16'}`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Tu foto de perfil" width={grande ? 96 : 64} height={grande ? 96 : 64} className="size-full object-cover" />
        ) : (
          <User size={grande ? 44 : 32} strokeWidth={1.6} color="var(--accent-ink)" aria-hidden="true" />
        )}
        {subiendo && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]">
            <Loader2 size={24} className="animate-spin" color="var(--accent-ink)" aria-label="Guardando tu foto" />
          </span>
        )}
      </span>
      {camarita && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--surface)] shadow-[var(--shadow-1)]"
        >
          <Camera size={14} strokeWidth={2} color="var(--accent-ink)" />
        </span>
      )}
    </span>
  );
}

/** La foto grande con sus dos acciones. Vive en "Editar perfil". */
export function EditorFoto() {
  const foto = useFotoPerfil();
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col items-center">
      <AvatarPerfil url={foto.url} subiendo={foto.subiendo} grande />
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          await foto.elegir(e.target.files?.[0]);
          if (input.current) input.current.value = '';
        }}
      />
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={foto.ocupado || !foto.puedeSubir}
          className="flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent-cta)] px-4 text-[14px] font-semibold text-[var(--bg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
        >
          <Camera size={16} aria-hidden="true" /> {foto.url ? 'Cambiar foto' : 'Añadir foto'}
        </button>
        {foto.url && (
          <button
            type="button"
            onClick={foto.quitar}
            disabled={foto.ocupado}
            className="flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] px-4 text-[14px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
          >
            <Trash2 size={16} aria-hidden="true" /> Quitar foto
          </button>
        )}
      </div>
      {foto.aviso && (
        <p role="alert" className="mt-3 text-center text-[13px] text-[var(--text-secondary)]">
          {foto.aviso}
        </p>
      )}
    </div>
  );
}

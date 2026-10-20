'use client';

// Foto de perfil. Se elige de la galería o se toma con la cámara, se recorta a cuadrado y se reduce a
// 256x256 JPEG EN EL CELULAR (así pesa ~30 KB y se borran los datos ocultos de la foto, como la ubicación)
// y se guarda en un espacio privado: solo esta cuenta puede verla (bucket "avatars", RLS por carpeta).

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

export function FotoPerfil() {
  const [url, setUrl] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'subiendo'>('cargando');
  const [aviso, setAviso] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async (id: string) => {
    const { data } = await createClient().storage.from('avatars').createSignedUrl(`${id}/avatar.jpg`, 3600);
    setUrl(data?.signedUrl ?? null);
  }, []);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(async ({ data }) => {
        if (data.user) {
          setUid(data.user.id);
          await cargar(data.user.id);
        }
        setEstado('listo');
      });
  }, [cargar]);

  const elegida = async (archivo: File | undefined) => {
    if (!archivo || !uid) return;
    setAviso('');
    if (!archivo.type.startsWith('image/')) return setAviso('Elige una imagen (foto de tu galería o de la cámara).');
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
      if (input.current) input.current.value = '';
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

  const ocupado = estado !== 'listo';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--chip-bg)] shadow-[var(--shadow-1)]"
          aria-hidden={!url}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Tu foto de perfil" width={96} height={96} className="size-full object-cover" />
          ) : (
            <User size={40} strokeWidth={1.6} color="var(--accent-ink)" aria-hidden="true" />
          )}
          {estado === 'subiendo' && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]">
              <Loader2 size={26} className="animate-spin" color="var(--accent-ink)" aria-label="Guardando tu foto" />
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={ocupado || !uid}
          aria-label={url ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
          className="absolute -bottom-1 -right-1 flex size-11 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-[var(--accent-cta)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
        >
          <Camera size={18} strokeWidth={2} color="var(--bg)" aria-hidden="true" />
        </button>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => elegida(e.target.files?.[0])} />
      </div>

      {url && (
        <button
          type="button"
          onClick={quitar}
          disabled={ocupado}
          className="mt-3 flex min-h-11 items-center gap-1.5 rounded-[var(--radius-button)] px-3 text-[13px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
        >
          <Trash2 size={14} aria-hidden="true" /> Quitar foto
        </button>
      )}
      {!url && estado === 'listo' && (
        <p className="mt-3 text-[13px] text-[var(--text-tertiary)]">Toca la cámara para añadir tu foto</p>
      )}
      {aviso && (
        <p role="alert" className="mt-2 max-w-[280px] text-center text-[13px] text-[var(--text-secondary)]">
          {aviso}
        </p>
      )}
    </div>
  );
}

'use client';

// Cabecera del Perfil: foto con camarita a la izquierda y, al lado, lo que pase el Perfil (nombre y tipo).
// La foto se elige de la galería o se toma con la cámara, se recorta a cuadrado y se reduce a 256x256 JPEG
// EN EL CELULAR (así pesa ~30 KB y se borran los datos ocultos de la foto, como la ubicación) y se guarda
// en un espacio privado: solo esta cuenta puede verla (bucket "avatars", RLS por carpeta).

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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

export function FotoPerfil({ children }: { children?: ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'subiendo'>('cargando');
  const [aviso, setAviso] = useState('');
  const input = useRef<HTMLInputElement>(null);

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

  const elegida = async (archivo: File | undefined) => {
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
    <div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--chip-bg)] shadow-[var(--shadow-1)]">
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Tu foto de perfil" width={64} height={64} className="size-full object-cover" />
            ) : (
              <User size={32} strokeWidth={1.6} color="var(--accent-ink)" aria-hidden="true" />
            )}
            {estado === 'subiendo' && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]">
                <Loader2 size={24} className="animate-spin" color="var(--accent-ink)" aria-label="Guardando tu foto" />
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={ocupado || !uid}
            aria-label={url ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
            className="absolute -bottom-3 -right-3 flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--surface)] shadow-[var(--shadow-1)]">
              <Camera size={14} strokeWidth={2} color="var(--accent-ink)" aria-hidden="true" />
            </span>
          </button>
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => elegida(e.target.files?.[0])} />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {url && (
        <button
          type="button"
          onClick={quitar}
          disabled={ocupado}
          className="mt-2 flex min-h-11 items-center gap-1.5 rounded-[var(--radius-button)] px-1 text-[13px] font-semibold text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-60"
        >
          <Trash2 size={14} aria-hidden="true" /> Quitar foto
        </button>
      )}
      {aviso && (
        <p role="alert" className="mt-2 text-[13px] text-[var(--text-secondary)]">
          {aviso}
        </p>
      )}
    </div>
  );
}

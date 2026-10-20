import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Ingreso con enlace "de mano" (token_hash). Dos pasos a propósito:
//  1) GET solo muestra un botón. Los revisores automáticos (vistas previas, antivirus del correo)
//     abren enlaces pero no tocan botones, así que no gastan el enlace.
//  2) POST (el toque de la persona) valida el enlace en Supabase y abre la sesión.
// Solo acepta enlaces de ingreso (magiclink / email).

const TIPOS = ['magiclink', 'email'];

function pagina(tokenHash: string, tipo: string) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Entrar a Refugio PAS</title>
<style>body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#fbf6ee;font-family:system-ui,sans-serif;color:#2b2326}main{width:100%;max-width:360px;padding:32px 24px;text-align:center}h1{font-size:24px;margin:0 0 8px}p{font-size:15px;color:#5f5156;margin:0 0 24px}button{width:100%;min-height:48px;border:0;border-radius:14px;background:#c2921f;color:#fff;font-size:16px;font-weight:600}</style></head>
<body><main><h1>Refugio PAS</h1><p>Toca el botón para entrar a tu espacio.</p>
<form method="post"><input type="hidden" name="token_hash" value="${tokenHash.replace(/[^A-Za-z0-9_-]/g, '')}"><input type="hidden" name="type" value="${tipo}"><button type="submit">Entrar</button></form></main></body></html>`;
  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const tipo = searchParams.get('type');
  if (!tokenHash || !tipo || !TIPOS.includes(tipo)) return NextResponse.redirect(`${origin}/entrar?error=enlace`);
  return pagina(tokenHash, tipo);
}

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  const form = await request.formData();
  const tokenHash = String(form.get('token_hash') ?? '');
  const tipo = String(form.get('type') ?? '');

  if (tokenHash && TIPOS.includes(tipo)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo as EmailOtpType });
    if (!error) return NextResponse.redirect(`${origin}/app`, 303);
  }
  return NextResponse.redirect(`${origin}/entrar?error=enlace`, 303);
}

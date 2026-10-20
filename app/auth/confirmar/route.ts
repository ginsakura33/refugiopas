import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Ingreso con enlace "de mano" (token_hash): no depende del navegador donde se pidió ni de un código
// guardado, así que sirve cuando el correo estándar se gasta antes de tiempo. Solo acepta enlaces
// de ingreso (magiclink / email) y los valida Supabase en el servidor.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const tipo = searchParams.get('type');

  if (tokenHash && (tipo === 'magiclink' || tipo === 'email')) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo as EmailOtpType });
    if (!error) return NextResponse.redirect(`${origin}/app`);
  }
  return NextResponse.redirect(`${origin}/entrar?error=enlace`);
}

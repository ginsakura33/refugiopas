import 'server-only';
import crypto from 'node:crypto';

// Utilidades del webhook de Hotmart: verificación del hottok (tiempo constante) y mapa de eventos.

export function hottokValido(recibido: string | null | undefined): boolean {
  const esperado = process.env.HOTMART_HOTTOK;
  if (!esperado || !recibido) return false; // fail-secure: sin secreto configurado nada pasa
  const a = Buffer.from(recibido, 'utf8');
  const b = Buffer.from(esperado, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export type EstadoSub = 'prueba' | 'activa' | 'cancelada' | 'vencida' | 'reembolsada';

/** Evento de Hotmart → estado de la suscripción. Eventos no listados se ignoran (200, sin cambios). */
export const EVENTO_A_ESTADO: Record<string, EstadoSub> = {
  PURCHASE_APPROVED: 'activa',
  PURCHASE_COMPLETE: 'activa',
  PURCHASE_REFUNDED: 'reembolsada',
  PURCHASE_CHARGEBACK: 'reembolsada',
  SUBSCRIPTION_CANCELLATION: 'cancelada',
  PURCHASE_DELAYED: 'vencida',
  PURCHASE_EXPIRED: 'vencida',
};

export interface PayloadHotmart {
  id?: string;
  creation_date?: number;
  event?: string;
  data?: {
    buyer?: { email?: string; name?: string };
    purchase?: {
      transaction?: string;
      offer?: { code?: string };
      price?: { value?: number };
      date_next_charge?: number;
    };
    subscription?: { plan?: { name?: string } };
  };
}

/** Mensual o anual según el código de oferta (env) o, si no, el nombre del plan. */
export function planDelPayload(p: PayloadHotmart): 'mensual' | 'anual' {
  const oferta = p.data?.purchase?.offer?.code;
  if (oferta && process.env.HOTMART_OFFER_ANUAL && oferta === process.env.HOTMART_OFFER_ANUAL) return 'anual';
  if (oferta && process.env.HOTMART_OFFER_MENSUAL && oferta === process.env.HOTMART_OFFER_MENSUAL) return 'mensual';
  const nombre = (p.data?.subscription?.plan?.name ?? '').toLowerCase();
  return nombre.includes('anual') || nombre.includes('year') ? 'anual' : 'mensual';
}

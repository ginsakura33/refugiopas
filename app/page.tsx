'use client';

// Página de ventas de Refugio PAS — compone las 10 secciones canónicas del kit
// (plantillas-codigo/landing/, doctrina en su README) en el orden de 19-PAGINA-DE-VENTAS.md.
// Copy MARCADO y trazado a FICHA-AVATAR.md: docs/copy/landing.md.

import { HeartHandshake, Volume2, HandHeart, Moon, Quote } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { Problema } from '@/components/landing/Problema';
import { Agitacion } from '@/components/landing/Agitacion';
import { Solucion } from '@/components/landing/Solucion';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { Oferta } from '@/components/landing/Oferta';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { StickyCtaMobile, SectionShell, Kicker, Hairline } from '@/components/landing/ui';
import { MarkedCopy } from '@/components/landing/MarkedCopy';
import { OrbeHeroVisual } from '@/components/OrbeHeroVisual';

// Modelo onboarding-first (primera victoria = el test de arquetipo, gratis y sin
// registro): el CTA lleva a /onboarding, nunca directo al checkout.
const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Descubrir mi arquetipo PAS gratis';

export default function LandingRefugioPAS() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO */}
      <Hero
        appName="Refugio PAS"
        loginHref="/entrar"
        h1Marked="Hoy tu sobrecarga baja en [acento]2 minutos[/acento] con el Orbe"
        subtitleMarked="Audios de autohipnosis en [b]español[/b], hechos para personas altamente sensibles"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={
          <span>
            Experiencias reales de personas que vivieron este proceso con Ginette Rivas, psicóloga
            clínica creadora de Refugio PAS
          </span>
        }
        visual={<OrbeHeroVisual />}
      />

      {/* 2. PROBLEMA */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: HeartHandshake, textoMarked: '¿Absorbes las emociones y tensiones de los demás sin saber cómo soltarlas?' },
          { icon: Volume2, textoMarked: '¿Te agobias en lugares ruidosos o llenos de gente?' },
          { icon: HandHeart, textoMarked: '¿Te cuesta decir que no sin sentir culpa después?' },
          { icon: Moon, textoMarked: '¿Rumias la noche entera lo que viviste, sin poder dormir?' },
        ]}
      />

      {/* 3. AGITACIÓN */}
      <Agitacion
        frases={[
          'Cada noche sin soltar el día es [acento]sueño reparador[/acento] que ya no vuelve.',
          'Ya probaste apps de meditación genéricas — y las abandonaste porque [b]te aburriste[/b].',
          'Seguir igual no te hace menos sensible: solo te deja más agotado/a.',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Sobrecarga sensorial, culpa por poner límites y noches en vela.',
          labelFuturo: 'En 6 meses, si nada cambia',
          futuro: 'Son 6 meses menos de sueño reparador.',
        }}
      />

      {/* 4. SOLUCIÓN */}
      <Solucion
        tituloMarked="Tu calma en [acento]2 minutos[/acento], para tu sensibilidad"
        mecanismo="el Orbe que Respira"
        bigIdeaMarked="No te falta fuerza de voluntad — te falta un protocolo hecho para un sistema nervioso PAS. [b]El Orbe que Respira[/b] lo activa en 2 minutos."
        pasos={[
          { titulo: 'Tocas el Orbe', detalle: 'Un toque cuando sientes la sobrecarga llegar.' },
          { titulo: 'Respiras con guía', detalle: 'Un audio real en español te guía 2 minutos.' },
          { titulo: 'Vuelves a tu centro', detalle: 'Tu sistema nervioso baja de revoluciones.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Sobrecarga que no sabes bajar, solo/a.',
          labelDespues: 'Después',
          despues: '2 minutos y tu cuerpo reconoce el camino de vuelta a la calma.',
        }}
      />

      {/* 5. LA APP POR DENTRO */}
      <AppPorDentro
        tituloMarked="Tu refugio, [acento]siempre a un toque[/acento]"
        frames={[
          { src: '/app-screens/arquetipo.png', alt: 'Pregunta del test de arquetipos de Refugio PAS', label: 'Descubre tu arquetipo PAS' },
          { src: '/app-screens/inicio.png', alt: 'Inicio de Refugio PAS con el Orbe S.O.S., tu ánimo del día y la frase del día', label: 'Tu Orbe, a un toque, incluso sin internet' },
          { src: '/app-screens/habitos.png', alt: 'Hábitos de calma con la racha de 7 días y la semana completa', label: 'Hábitos con racha y los tuyos propios' },
          { src: '/app-screens/diario.png', alt: 'Diario con el gráfico de intensidad de la semana y las entradas con su ánimo', label: 'Tu diario y tu intensidad, día a día' },
          { src: '/app-screens/biblioteca.png', alt: 'Biblioteca de audios de autohipnosis guiada en español', label: 'Audios de autohipnosis guiada en español' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      {/* Testimonios reales (≥3, aportados por el usuario) — el kit no trae un
          slot propio para esto en AppPorDentro; se compone aquí con los mismos
          átomos (SectionShell/Hairline/Kicker) sin tocar ningún .tsx del kit,
          en el mismo lugar que 19 §5 exige. Divulgado con honestidad: son
          testimonios de las sesiones de terapia/hipnosis de la autora, no de
          la app (que aún no existe) — anotado también en ESTADO.md. */}
      <SectionShell elevacion="elevada" tint="rosa" ariaLabel="Experiencias en sesión">
        <div className="mx-auto max-w-2xl text-center">
          <Kicker>EXPERIENCIAS EN SESIÓN</Kicker>
          <h2 className="text-balance text-3xl font-bold leading-tight text-[var(--text-primary)] [font-family:var(--font-display)] md:text-4xl">
            Lo que ya vivieron en sesión con Psicóloga Ginette Rivas
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Experiencias reales de sesiones online de Personas Altamente Sensibles &quot;PAS&quot; con el
            mismo método de autohipnosis que grabó en los audios de la app.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              texto:
                'Te agradezco porque realmente siento mejoría en la respiración y mi sensibilidad. Siento que ahora aprendí a regular lo que siento sin rechazarlo, sino integrando la experiencia.',
              autor: 'Pablo M. · proceso de regulación emocional',
            },
            {
              texto:
                'Me encantan los ejercicios que recomiendas: apenas llevo dos días y ya me he podido controlar. Hoy trabajé full y me regulé con la respiración.',
              autor: 'Andrea V. · práctica de respiración guiada',
            },
            {
              texto:
                'Me siento más liviana, y después de mucho tiempo he vuelto a dormir mejor y a conectar más conmigo misma.',
              autor: 'Luisa H. · proceso de acompañamiento emocional',
            },
          ].map((t, i) => (
            <Hairline key={i} surface="surface" className="shadow-[var(--shadow-1)]">
              <div className="flex h-full flex-col gap-3 p-6">
                <Quote
                  size={20}
                  strokeWidth={2}
                  color="var(--accent-2)"
                  aria-hidden="true"
                  className="shrink-0"
                />
                <p className="text-base leading-relaxed text-[var(--text-primary)]">“{t.texto}”</p>
                <p className="mt-auto text-sm font-medium text-[var(--text-tertiary)]">{t.autor}</p>
              </div>
            </Hairline>
          ))}
        </div>
      </SectionShell>

      {/* 6. OFERTA — prueba gratis SOLO en el plan anual (7 días; decisión del usuario, 2026-10-12:
          el mensual se paga desde el primer día). Se comunica como feature del anual (no se usa
          el badge compartido `trialDias`, que marcaría también al mensual). */}
      <Oferta
        tituloMarked="Empieza gratis. Sigue por [acento]$0.17 al día[/acento]"
        garantia="Garantía del Primer Alivio: tienes 15 días para pedir tu reembolso si no sientes alivio real."
        anual={{
          nombre: 'Anual',
          badge: '7 DÍAS GRATIS · MÁS POPULAR',
          precioMes: '$4.99',
          totalAnual: 'Se cobra $59.88/año',
          ahorro: 'Ahorras 4 meses',
          descomposicionDia: 'menos de $0.17 al día',
          ctaLabel: 'Empezar mi prueba de 7 días gratis',
          ctaHref: `${CTA_HREF}?plan=anual`,
          features: [
            'Incluye 7 días de prueba gratis',
            'Tu Orbe que Respira, incluso sin internet',
            'Biblioteca de audios de autohipnosis guiada',
            'Un audio nuevo cada mes, sin costo extra',
            'Hábitos con racha, recordatorio suave y hábitos propios',
            'Diario con tu intensidad y los 4 módulos de tu proceso PAS',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: '$7.99',
          ctaLabel: 'Empezar con el plan mensual',
          ctaHref: `${CTA_HREF}?plan=mensual`,
          features: [
            'Acceso completo desde el primer día',
            'Tu Orbe que Respira, incluso sin internet',
            'Biblioteca de audios de autohipnosis guiada',
            'Un audio nuevo cada mes, sin costo extra',
            'Hábitos, diario y los 4 módulos de tu proceso PAS',
            'Cancelas cuando quieras',
          ],
        }}
      />

      {/* 8. FAQ */}
      <Faq
        items={[
          {
            pregunta: '¿Esto reemplaza a mi terapeuta?',
            respuestaMarked:
              'No: Refugio PAS te acompaña entre sesiones, [b]no sustituye tratamiento psiquiátrico[/b] ni de crisis. Ante una emergencia, busca ayuda profesional de inmediato.',
          },
          {
            pregunta: '¿Los audios son genéricos, como en otras apps?',
            respuestaMarked:
              'No: los grabó Ginette Rivas, psicóloga especializada en PAS, con protocolos para sobrecarga sensorial — [b]no meditación general[/b].',
          },
          {
            pregunta: 'Ya probé apps de meditación y me aburrí, ¿esto es distinto?',
            respuestaMarked:
              'Sí: el Orbe no es meditación genérica — es un protocolo de 2 minutos [b]hecho para tu sistema nervioso[/b] altamente sensible.',
          },
          {
            pregunta: '¿Puedo cancelar cuando quiera?',
            respuestaMarked: 'Sí, cancelas cuando quieras desde tu cuenta, [b]sin llamadas ni letra chica[/b].',
          },
          {
            pregunta: '¿Es seguro pagar en dólares desde mi país?',
            respuestaMarked:
              'Sí: Hotmart procesa tu pago con tarjeta, PayPal u otros medios locales de forma segura.',
          },
        ]}
      />

      {/* 9. CTA FINAL EMOCIONAL */}
      <CtaFinal
        h2Marked="Tu calma, [acento]a 2 minutos[/acento]"
        futurePacingMarked="Sientes la sobrecarga llegar, tocas el Orbe, y en 2 minutos tu cuerpo vuelve a su centro, sin culpa, sin esperar a que pase."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Alivio de 15 días · 7 días de prueba gratis en el plan anual"
        psMarked="PS: Refugio PAS calma tu sobrecarga sensorial en 2 minutos con el Orbe que Respira, en audios reales de autohipnosis en español hechos por una psicóloga especializada en PAS. Hoy entras con 7 días gratis en el plan anual y la Garantía del Primer Alivio de 15 días."
      />

      {/* 10. FOOTER LEGAL — ⚠️ enlaces y correo PENDIENTES (ver ESTADO.md):
          las 4 páginas legales aún no existen (se redactan con 47 antes de
          publicar) y el correo de soporte se define con el dominio. Se deja
          apuntando a rutas que se crearán en la Sesión 6/8, nunca "#". */}
      <FooterLegal
        appName="Refugio PAS"
        soporteEmail="soporte@refugiopas.com"
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
          { label: 'Aviso de IA', href: '/aviso-ia' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}

// Silencia el warning de "no usado" del import de MarkedCopy si el linter lo
// marca — se usa dentro de cada sección del kit, no aquí directamente.
void MarkedCopy;

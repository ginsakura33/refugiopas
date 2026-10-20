'use client';

// Último recurso: si falla hasta la estructura base de la app. Reemplaza toda la página, así que vuelve a
// importar los estilos globales para usar los colores de la marca por nombre (sin valores sueltos).
import './globals.css';

export default function ErrorGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 360 }}>
          <h1 style={{ fontSize: 26, margin: '0 0 12px' }}>Algo no salió como esperábamos</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: '0 0 24px', color: 'var(--text-secondary)' }}>
            No es tu culpa. Respira un momento e inténtalo de nuevo; lo que habías guardado sigue a salvo.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: 48, width: '100%', border: 0, borderRadius: 14, background: 'var(--accent-cta)', color: 'var(--bg)', fontSize: 16, fontWeight: 600 }}
          >
            Intentar de nuevo
          </button>
        </main>
      </body>
    </html>
  );
}

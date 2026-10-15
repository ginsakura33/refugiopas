import type { ReactNode } from 'react';
import { TabBar } from '@/components/app-interna/ui';

// Fondo con profundidad (mismo mesh sutil dorado→rosa del onboarding) aplicado como background
// del propio contenedor — sin capas absolutas, para no crear contextos de apilamiento que tapen la barra.
const FONDO_MESH =
  'radial-gradient(680px 420px at 50% -8%, color-mix(in oklab, var(--accent) 9%, transparent) 0%, transparent 60%), ' +
  'radial-gradient(520px 360px at 100% 100%, color-mix(in oklab, var(--accent-2) 18%, transparent) 0%, transparent 55%)';

export default function AppInternaLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]"
      style={{ backgroundImage: FONDO_MESH, backgroundAttachment: 'fixed' }}
    >
      <div className="flex flex-1 flex-col">{children}</div>
      <TabBar />
    </div>
  );
}

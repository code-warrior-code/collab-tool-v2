import { useRef } from 'react';
import CardStack from '../CardStack';

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  const panelRef = useRef(null);
  const illustrationRef = useRef(null);
  const frame = useRef(null);

  function handlePanelMouseMove(e) {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const panel = panelRef.current;
    const illustration = illustrationRef.current;
    if (!panel || !illustration) return;

    const rect = panel.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 16;
    const rotateX = (0.5 - py) * 16;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      illustration.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }

  function handlePanelMouseLeave() {
    if (frame.current) cancelAnimationFrame(frame.current);
    const illustration = illustrationRef.current;
    if (illustration) illustration.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel - hidden on small screens to keep the form front and center */}
      <div
        ref={panelRef}
        onMouseMove={handlePanelMouseMove}
        onMouseLeave={handlePanelMouseLeave}
        className="hidden lg:flex relative flex-col justify-between p-12 bg-surface border-r border-border overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-floatSlow" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-white text-sm">
            S
          </div>
          <span className="font-display text-lg font-semibold">Stackline</span>
        </div>

        <div className="relative [perspective:1000px]">
          <div
            ref={illustrationRef}
            className="transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
          >
            <CardStack className="w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>

        <div className="relative max-w-sm">
          <p className="font-display text-2xl leading-snug">
            One board for the whole team to plan, assign, and ship work together.
          </p>
          <p className="mt-3 text-sm text-inkMuted">
            Projects, boards, tasks, and comments stay in sync the moment anyone makes a move.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-white text-sm">
              S
            </div>
            <span className="font-display text-lg font-semibold">Stackline</span>
          </div>

          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-bright mb-2">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-inkMuted">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

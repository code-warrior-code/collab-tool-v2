import { useRef } from 'react';

/**
 * Wraps any content in a lightweight 3D tilt effect driven by the cursor
 * position. Pointer-coarse devices (touch) are left flat since there is no
 * hover/cursor to drive the effect, which keeps things usable on mobile.
 *
 * Usage: <Tilt className="..."><Card /></Tilt>
 */
export default function Tilt({ children, className = '', max = 8, scale = 1.015, glare = true }) {
  const wrapRef = useRef(null);
  const frame = useRef(null);

  function handleMouseMove(e) {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0 - 1
    const py = (e.clientY - rect.top) / rect.height; // 0 - 1

    const rotateY = (px - 0.5) * max * 2;
    const rotateX = (0.5 - py) * max * 2;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!wrapRef.current) return;
      wrapRef.current.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      if (glare) {
        wrapRef.current.style.setProperty('--tilt-glare-x', `${px * 100}%`);
        wrapRef.current.style.setProperty('--tilt-glare-y', `${py * 100}%`);
      }
    });
  }

  function handleMouseLeave() {
    if (frame.current) cancelAnimationFrame(frame.current);
    const el = wrapRef.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d] ${className}`}
    >
      {children}
      {glare && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at var(--tilt-glare-x, 50%) var(--tilt-glare-y, 50%), rgba(255,255,255,0.10), transparent 55%)'
          }}
        />
      )}
    </div>
  );
}

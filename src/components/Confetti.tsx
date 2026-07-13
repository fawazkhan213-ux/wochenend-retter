import { useEffect, useRef } from "react";

// Dependency-free canvas confetti burst. Fires once when `trigger` changes to
// a new truthy value. Overlays the whole viewport with pointer-events:none.

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
};

const COLORS = ["#fcd34d", "#fb923c", "#f87171", "#34d399", "#60a5fa", "#a78bfa"];

export function Confetti({ trigger }: { trigger: number | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTrigger = useRef<number | null>(null);

  useEffect(() => {
    if (trigger == null || trigger === lastTrigger.current) return;
    lastTrigger.current = trigger;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = [];
    const cx = w / 2;
    const cy = h * 0.4;
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        size: 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      });
    }

    let start = performance.now();
    const tick = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of particles) {
        p.vy += 0.18; // gravity
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 2600);
        if (p.life > 0 && p.y < h + 40) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.5);
          ctx.restore();
        }
      }
      if (alive > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
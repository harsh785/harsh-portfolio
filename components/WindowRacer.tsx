"use client";
import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Vec2 = { x: number; y: number };
type Skid = { x: number; y: number; a: number; life: number };

// ── Generate waypoints around a DOM rect (with page-scroll offset) ─────────
function rectWaypoints(el: Element, step = 6): Vec2[] {
  const r = el.getBoundingClientRect();
  const sx = window.scrollX, sy = window.scrollY;
  const L = r.left + sx, T = r.top + sy, R = r.right + sx, B = r.bottom + sy;
  const pts: Vec2[] = [];
  for (let x = L; x < R; x += step) pts.push({ x, y: T });       // top →
  for (let y = T; y < B; y += step) pts.push({ x: R, y });         // right ↓
  for (let x = R; x > L; x -= step) pts.push({ x, y: B });         // bottom ←
  for (let y = B; y > T; y -= step) pts.push({ x: L, y });         // left ↑
  return pts;
}

// ── Draw low-poly car ─────────────────────────────────────────────────────────
function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, driftAngle: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading + driftAngle * 0.4);

  const W = 9, H = 20;

  // glow halo
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
  glow.addColorStop(0, color + "55");
  glow.addColorStop(1, color + "00");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // body (slightly tapered front)
  ctx.beginPath();
  ctx.moveTo(-W * 0.85, H / 2);
  ctx.lineTo(W * 0.85, H / 2);
  ctx.lineTo(W, -H * 0.1);
  ctx.lineTo(W * 0.7, -H / 2);
  ctx.lineTo(-W * 0.7, -H / 2);
  ctx.lineTo(-W, -H * 0.1);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowBlur = 6;
  ctx.shadowColor = color;
  ctx.fill();

  // cab/roof
  ctx.beginPath();
  ctx.roundRect(-W * 0.55, -H * 0.35, W * 1.1, H * 0.42, 2);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 0;
  ctx.fill();

  // headlights (front = -y)
  [[-W * 0.5, -H / 2 + 1], [W * 0.5, -H / 2 + 1]].forEach(([lx, ly]) => {
    ctx.beginPath();
    ctx.arc(lx, ly, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = "#fffbe6";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#fffbe6";
    ctx.fill();
  });

  // tail lights
  [[-W * 0.5, H / 2 - 1], [W * 0.5, H / 2 - 1]].forEach(([lx, ly]) => {
    ctx.beginPath();
    ctx.arc(lx, ly, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ff3344";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#ff3344";
    ctx.fill();
  });

  // wheels
  ctx.shadowBlur = 0;
  [[-W - 1.5, -H * 0.28], [W + 1.5, -H * 0.28], [-W - 1.5, H * 0.2], [W + 1.5, H * 0.2]].forEach(([wx, wy]) => {
    ctx.beginPath();
    ctx.roundRect(wx - 3, wy - 4, 5, 8, 1);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wx - 0.5, wy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#aaa";
    ctx.fill();
  });

  ctx.restore();
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WindowRacer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // car state
    let waypoints: Vec2[] = [];
    let wpIdx = 0;
    let pos: Vec2 = { x: 0, y: 0 };
    let heading = 0;           // where the car is actually going
    let visualHeading = 0;     // lagged for drift look
    let speed = 3.2;
    const skids: Skid[] = [];
    let frame = 0;
    let prevCorner = -1;

    // rebuild track from all [data-track] elements
    function buildTrack() {
      const els = document.querySelectorAll("[data-track]");
      if (!els.length) return;
      const all: Vec2[] = [];
      els.forEach(el => all.push(...rectWaypoints(el, 7)));
      waypoints = all;
      if (waypoints.length && (pos.x === 0 && pos.y === 0)) {
        pos = { ...waypoints[0] };
      }
    }

    // resize canvas to full document size
    function resize() {
      if (!canvas) return;
      canvas.width  = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
      buildTrack();
    }
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", buildTrack, { passive: true });

    let raf: number;
    function tick() {
      if (!canvas || !waypoints.length) { raf = requestAnimationFrame(tick); return; }
      frame++;

      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── advance toward next waypoint ──────────────────────────────────
      const target = waypoints[wpIdx % waypoints.length];
      const dx = target.x - pos.x, dy = target.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < speed + 1) {
        wpIdx = (wpIdx + 1) % waypoints.length;
      } else {
        const targetHeading = Math.atan2(dy, dx);
        // detect corner (big heading change)
        let diff = targetHeading - heading;
        while (diff > Math.PI)  diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        const isCorner = Math.abs(diff) > 0.25;
        heading += diff * 0.18;

        // drift: visual heading lags behind real heading
        let vDiff = heading - visualHeading;
        while (vDiff > Math.PI)  vDiff -= 2 * Math.PI;
        while (vDiff < -Math.PI) vDiff += 2 * Math.PI;
        visualHeading += vDiff * (isCorner ? 0.07 : 0.25);

        // emit skid marks at corners
        if (isCorner && wpIdx !== prevCorner && frame % 3 === 0) {
          skids.push({ x: pos.x, y: pos.y, a: visualHeading, life: 1 });
          prevCorner = wpIdx;
          speed = 2.0;
        } else {
          speed += (3.2 - speed) * 0.06;
        }

        pos.x += Math.cos(heading) * speed;
        pos.y += Math.sin(heading) * speed;
      }

      // ── draw skid marks ───────────────────────────────────────────────
      for (let i = skids.length - 1; i >= 0; i--) {
        const s = skids[i];
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.a);
        ctx.globalAlpha = s.life * 0.35;
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-4, -6);
        ctx.lineTo(-4, 6);
        ctx.moveTo(4, -6);
        ctx.lineTo(4, 6);
        ctx.stroke();
        ctx.restore();
        s.life -= 0.012;
        if (s.life <= 0) skids.splice(i, 1);
      }

      // ── exhaust trail ─────────────────────────────────────────────────
      if (frame % 2 === 0) {
        const ex = pos.x - Math.cos(heading) * 11;
        const ey = pos.y - Math.sin(heading) * 11;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(137,220,235,0.25)";
        ctx.fill();
      }

      // ── draw car ──────────────────────────────────────────────────────
      const driftAmount = visualHeading - heading;
      drawCar(ctx, pos.x, pos.y, visualHeading - Math.PI / 2, driftAmount, "#e63946");

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", buildTrack);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 5 }}
      />
      {/* Toggle button */}
      <button
        onClick={() => setVisible(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full border border-[#e63946]/40 bg-[#0d0d14]/80 backdrop-blur-md flex items-center justify-center text-base transition-all hover:border-[#e63946]/80 hover:scale-110"
        title="Toggle window racer"
      >
        🏎
      </button>
    </>
  );
}

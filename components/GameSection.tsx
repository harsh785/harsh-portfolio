"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
type ServerObj = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  type: "server" | "lambda" | "db" | "bug";
  label: string;
  color: string;
  points: number;
};

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
};

type Phase = "idle" | "playing" | "gameover";

// ── Constants ─────────────────────────────────────────────────────────────────
const SHIELD_H    = 14;
const SHIELD_W    = 110;
const LIVES_MAX   = 3;
const CATCH_MSGS  = ["✓ Deployed!", "Zero downtime!", "Terraform apply ✓", "Nice catch!", "K8s pod healthy!", "Pipeline passed!"];
const SERVER_TYPES: Omit<ServerObj, "id" | "x" | "y" | "speed">[] = [
  { w: 52, h: 32, type: "server",  label: "EC2",    color: "#FF9900", points: 10 },
  { w: 44, h: 28, type: "lambda",  label: "λ",      color: "#00d4ff", points: 20 },
  { w: 56, h: 34, type: "db",      label: "RDS",    color: "#7c3aed", points: 15 },
  { w: 48, h: 30, type: "bug",     label: "☠ BUG",  color: "#ef4444", points: -15 },
];

let idCounter = 0;

// ── Game canvas component ─────────────────────────────────────────────────────
export default function GameSection() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const stateRef     = useRef({
    shield:    { x: 0 },
    servers:   [] as ServerObj[],
    particles: [] as Particle[],
    score:     0,
    lives:     LIVES_MAX,
    phase:     "idle" as Phase,
    tick:      0,
    spawnRate: 90,       // frames between spawns
    baseSpeed: 2.2,
    msgs:      [] as { text: string; x: number; y: number; life: number }[],
  });

  const [phase,     setPhase]     = useState<Phase>("idle");
  const [score,     setScore]     = useState(0);
  const [lives,     setLives]     = useState(LIVES_MAX);
  const [hiScore,   setHiScore]   = useState(0);
  const [catchMsg,  setCatchMsg]  = useState("");
  const rafRef      = useRef<number>(0);
  const mouseX      = useRef<number | null>(null);

  // Canvas size
  const W = 640, H = 400;

  // ── Spawn a server ──────────────────────────────────────────────────────────
  const spawnServer = useCallback((canvasW: number) => {
    const s = stateRef.current;
    // Bug appears ~20% of time after 10s
    const pool = s.tick > 600
      ? [...SERVER_TYPES, SERVER_TYPES[3]]
      : SERVER_TYPES.slice(0, 3);
    const tpl = pool[Math.floor(Math.random() * pool.length)];
    const obj: ServerObj = {
      ...tpl,
      id: idCounter++,
      x: tpl.w / 2 + Math.random() * (canvasW - tpl.w),
      y: -tpl.h,
      speed: s.baseSpeed + Math.random() * 1.2,
    };
    s.servers.push(obj);
  }, []);

  // ── Spawn particles ─────────────────────────────────────────────────────────
  const spawnParticles = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      stateRef.current.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1, maxLife: 1,
        color, size: 3 + Math.random() * 3,
      });
    }
  };

  // ── Draw ────────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s   = stateRef.current;
    const cW  = canvas.width, cH = canvas.height;

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, cW, cH);

    // Grid
    ctx.strokeStyle = "rgba(0,212,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < cW; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cH); ctx.stroke(); }
    for (let y = 0; y < cH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cW, y); ctx.stroke(); }

    // Falling servers
    s.servers.forEach(sv => {
      const rx = sv.x - sv.w / 2, ry = sv.y;
      // Shadow glow
      ctx.shadowColor = sv.color;
      ctx.shadowBlur  = 12;
      // Box
      ctx.fillStyle   = sv.color + "22";
      ctx.strokeStyle = sv.color;
      ctx.lineWidth   = 1.5;
      roundRect(ctx, rx, ry, sv.w, sv.h, 6);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      // Label
      ctx.fillStyle  = sv.color;
      ctx.font       = `bold ${sv.type === "bug" ? 11 : 12}px monospace`;
      ctx.textAlign  = "center";
      ctx.fillText(sv.label, sv.x, ry + sv.h / 2 + 4);
    });

    // Shield
    const shieldX = s.shield.x - SHIELD_W / 2;
    const shieldY = cH - 30;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur  = 20;
    const grad = ctx.createLinearGradient(shieldX, 0, shieldX + SHIELD_W, 0);
    grad.addColorStop(0, "#00d4ff44");
    grad.addColorStop(0.5, "#00d4ff");
    grad.addColorStop(1, "#00d4ff44");
    ctx.fillStyle = grad;
    roundRect(ctx, shieldX, shieldY, SHIELD_W, SHIELD_H, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Shield label
    ctx.fillStyle = "#0a0a0f";
    ctx.font      = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("⚡ SHIELD", s.shield.x, shieldY + 9);

    // Particles
    s.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Float messages
    s.msgs.forEach(m => {
      ctx.globalAlpha = m.life;
      ctx.fillStyle   = "#39ff14";
      ctx.font        = "bold 13px monospace";
      ctx.textAlign   = "center";
      ctx.fillText(m.text, m.x, m.y);
    });
    ctx.globalAlpha = 1;
  }, []);

  // ── Game loop ───────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s  = stateRef.current;
    const cW = canvas.width, cH = canvas.height;

    if (s.phase !== "playing") { draw(); return; }

    s.tick++;

    // Move shield
    if (mouseX.current !== null) {
      const target = mouseX.current;
      s.shield.x += (target - s.shield.x) * 0.18;
    }
    s.shield.x = Math.max(SHIELD_W / 2, Math.min(cW - SHIELD_W / 2, s.shield.x));

    // Increase difficulty every 15s
    if (s.tick % 900 === 0) {
      s.baseSpeed  = Math.min(s.baseSpeed + 0.5, 7);
      s.spawnRate  = Math.max(s.spawnRate - 8, 35);
    }

    // Spawn
    if (s.tick % s.spawnRate === 0) spawnServer(cW);

    // Move servers
    s.servers = s.servers.filter(sv => {
      sv.y += sv.speed;

      // Caught by shield
      const shieldY = cH - 30;
      if (
        sv.y + sv.h >= shieldY &&
        sv.y + sv.h <= shieldY + SHIELD_H + 8 &&
        sv.x > s.shield.x - SHIELD_W / 2 - sv.w / 4 &&
        sv.x < s.shield.x + SHIELD_W / 2 + sv.w / 4
      ) {
        s.score += sv.points;
        if (sv.type === "bug") {
          spawnParticles(sv.x, sv.y, "#ef4444", 8);
        } else {
          spawnParticles(sv.x, sv.y, sv.color);
          const msg = CATCH_MSGS[Math.floor(Math.random() * CATCH_MSGS.length)];
          s.msgs.push({ text: msg, x: sv.x, y: shieldY - 10, life: 1 });
          setCatchMsg(msg);
          setTimeout(() => setCatchMsg(""), 800);
        }
        setScore(Math.max(0, s.score));
        return false;
      }

      // Missed (hit ground)
      if (sv.y > cH + 10) {
        if (sv.type !== "bug") {
          s.lives--;
          setLives(s.lives);
          if (s.lives <= 0) {
            s.phase = "gameover";
            setPhase("gameover");
            setHiScore(prev => Math.max(prev, s.score));
          }
        }
        return false;
      }
      return true;
    });

    // Update particles
    s.particles = s.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.035;
      return p.life > 0;
    });

    // Update msgs
    s.msgs = s.msgs.filter(m => {
      m.y -= 0.8; m.life -= 0.025;
      return m.life > 0;
    });

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, spawnServer]);

  // ── Start / Restart ─────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    s.shield.x  = canvas.width / 2;
    s.servers   = [];
    s.particles = [];
    s.msgs      = [];
    s.score     = 0;
    s.lives     = LIVES_MAX;
    s.tick      = 0;
    s.spawnRate = 90;
    s.baseSpeed = 2.2;
    s.phase     = "playing";
    setScore(0);
    setLives(LIVES_MAX);
    setPhase("playing");
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  // ── Input handlers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const keys = new Set<string>();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft","ArrowRight","a","d"].includes(e.key)) {
        keys.add(e.key);
        e.preventDefault();
      }
    };
    const offKey = (e: KeyboardEvent) => keys.delete(e.key);

    const keyLoop = setInterval(() => {
      const s = stateRef.current;
      if (s.phase !== "playing") return;
      const speed = 14;
      if (keys.has("ArrowLeft")  || keys.has("a")) mouseX.current = (mouseX.current ?? s.shield.x) - speed;
      if (keys.has("ArrowRight") || keys.has("d")) mouseX.current = (mouseX.current ?? s.shield.x) + speed;
    }, 16);

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup",   offKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup",   offKey);
      clearInterval(keyLoop);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    mouseX.current = (e.clientX - rect.left) * (W / rect.width);
  };
  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    mouseX.current = (e.touches[0].clientX - rect.left) * (W / rect.width);
  };

  // Initial idle draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stateRef.current.shield.x = W / 2;
    draw();
  }, [draw]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <span>🎮</span><span>mini_game.exe</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Don't Let Production Break</h2>
          <p className="text-slate-400 mt-2 text-sm">Catch servers · dodge bugs · keep uptime at 99.9%</p>
        </motion.div>

        {/* Game wrapper */}
        <div className="relative flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-[#00d4ff]/15"
            style={{ width: "100%", maxWidth: W }}>

            {/* HUD */}
            {phase === "playing" && (
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  {Array.from({ length: LIVES_MAX }).map((_, i) => (
                    <span key={i} className={`text-sm transition-all ${i < lives ? "opacity-100" : "opacity-20 grayscale"}`}>🖥️</span>
                  ))}
                </div>
                <div className="text-[#00d4ff] font-mono font-bold text-sm">{score} pts</div>
                {hiScore > 0 && <div className="text-slate-500 font-mono text-xs">HI {hiScore}</div>}
              </div>
            )}

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="w-full block"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouch}
              style={{ touchAction: "none", cursor: phase === "playing" ? "none" : "default" }}
            />

            {/* Idle overlay */}
            <AnimatePresence>
              {phase === "idle" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
                >
                  <div className="text-5xl mb-4">🖥️</div>
                  <h3 className="text-2xl font-black text-white mb-2">Production is stable.</h3>
                  <p className="text-slate-400 text-sm mb-2">For now.</p>
                  <div className="text-slate-500 text-xs font-mono mb-6 space-y-1 text-center">
                    <p>← → or A/D — move shield</p>
                    <p>🟠 EC2 +10 · 🔵 λ +20 · 🟣 RDS +15 · ☠ BUG -15</p>
                    <p>Miss 3 servers → INCIDENT DECLARED</p>
                  </div>
                  <button onClick={startGame}
                    className="px-8 py-3 rounded-xl font-bold text-black text-sm transition-all hover:scale-105"
                    style={{ background: "#39ff14", boxShadow: "0 0 24px #39ff1450" }}>
                    Deploy Shield 🚀
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game over overlay */}
            <AnimatePresence>
              {phase === "gameover" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: [0, -5, 5, -3, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl mb-3"
                  >🚨</motion.div>
                  <h3 className="text-3xl font-black text-red-400 mb-1">INCIDENT DECLARED</h3>
                  <p className="text-slate-400 text-sm font-mono mb-1">Production is down.</p>
                  <p className="text-slate-500 text-xs font-mono mb-4">PagerDuty is ringing.</p>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-black text-white">{score}</p>
                      <p className="text-xs text-slate-500">score</p>
                    </div>
                    {hiScore > 0 && (
                      <div className="text-center">
                        <p className="text-2xl font-black" style={{ color: "#FF9900" }}>{hiScore}</p>
                        <p className="text-xs text-slate-500">best</p>
                      </div>
                    )}
                  </div>

                  <button onClick={startGame}
                    className="px-8 py-3 rounded-xl font-bold text-black text-sm transition-all hover:scale-105"
                    style={{ background: "#00d4ff", boxShadow: "0 0 24px #00d4ff40" }}>
                    Run incident_response.sh 🔧
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Catch message toast */}
        <AnimatePresence>
          {catchMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center mt-3 text-xs font-mono"
              style={{ color: "#39ff14" }}
            >
              {catchMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-slate-700 text-xs font-mono mt-4">
          move mouse over game · or use ← → keys
        </p>
      </div>
    </section>
  );
}

// ── Rounded rect helper ───────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

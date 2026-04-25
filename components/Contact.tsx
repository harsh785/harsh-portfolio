"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, GitBranch, ExternalLink, Send, Copy, Check } from "lucide-react";
import { personalInfo } from "@/lib/data";

const cards = [
  { icon: Mail,        label: "Email",    value: personalInfo.email,                          href: `mailto:${personalInfo.email}`,  color: "#00d4ff", emoji: "📧" },
  { icon: Phone,       label: "Phone",    value: personalInfo.phone,                          href: `tel:${personalInfo.phone}`,     color: "#7c3aed", emoji: "📱" },
  { icon: GitBranch,   label: "GitHub",   value: "github.com/harsh785",                      href: personalInfo.github,             color: "#f59e0b", emoji: "💻" },
  { icon: ExternalLink,label: "LinkedIn", value: "harsh-dixit-156a371b0",                    href: personalInfo.linkedin,           color: "#0ea5e9", emoji: "🔗" },
  { icon: Send,        label: "Available",value: "Open to opportunities",                     href: `mailto:${personalInfo.email}`,  color: "#39ff14", emoji: "🚀" },
];

// ── Scratch canvas ────────────────────────────────────────────────────────────
function ScratchCard({ card, onRevealed }: { card: typeof cards[0]; onRevealed: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDrawing = useRef(false);
  const hasNotified = useRef(false);

  // Fill the scratch layer once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Textured scratch surface
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid texture
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 12) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 12) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Label on top of scratch surface
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("✦ SCRATCH TO REVEAL ✦", canvas.width / 2, canvas.height / 2 - 8);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.font = "22px sans-serif";
    ctx.fillText(card.emoji, canvas.width / 2, canvas.height / 2 + 20);
  }, [card.emoji]);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    // Check % scratched
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] === 0) cleared++;
    const pct = cleared / (canvas.width * canvas.height);
    if (pct > 0.5 && !hasNotified.current) {
      hasNotified.current = true;
      setRevealed(true);
      onRevealed();
      // Fade canvas out
      canvas.style.transition = "opacity 0.4s";
      canvas.style.opacity = "0";
      setTimeout(() => { canvas.style.display = "none"; }, 400);
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(card.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height: 120 }}>
      {/* Revealed layer underneath */}
      <a
        href={card.href}
        target={card.href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center gap-4 px-5"
        style={{ background: `${card.color}10`, borderRadius: 16 }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{ background: `${card.color}15`, borderColor: `${card.color}30` }}>
          <card.icon size={20} style={{ color: card.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono mb-0.5" style={{ color: card.color }}>{card.label}</p>
          <p className="text-white font-semibold text-sm truncate">{card.value}</p>
        </div>
        <AnimatePresence>
          {revealed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={copy}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all flex-shrink-0"
              style={{ color: copied ? "#39ff14" : "#64748b" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </motion.button>
          )}
        </AnimatePresence>
      </a>

      {/* Scratch surface — sits on top */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full rounded-2xl cursor-crosshair"
        style={{ border: "1px solid rgba(255,255,255,0.06)", touchAction: "none" }}
        onMouseDown={(e) => { isDrawing.current = true; scratch(...Object.values(getPos(e, e.currentTarget)) as [number, number]); }}
        onMouseMove={(e) => { if (isDrawing.current) scratch(...Object.values(getPos(e, e.currentTarget)) as [number, number]); }}
        onMouseUp={() => { isDrawing.current = false; }}
        onMouseLeave={() => { isDrawing.current = false; }}
        onTouchStart={(e) => { isDrawing.current = true; scratch(...Object.values(getPos(e, e.currentTarget)) as [number, number]); }}
        onTouchMove={(e) => { e.preventDefault(); scratch(...Object.values(getPos(e, e.currentTarget)) as [number, number]); }}
        onTouchEnd={() => { isDrawing.current = false; }}
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Contact() {
  const [revealedCount, setRevealedCount] = useState(0);
  const [key, setKey] = useState(0); // reset trick

  return (
    <section id="contact" className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Send size={14} />
            <span>contact.scratch</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Get In Touch</h2>
          <p className="text-slate-400 mt-2 text-sm">
            Scratch each card to reveal my contact info
          </p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8 max-w-xs mx-auto">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #00d4ff, #39ff14)" }}
              animate={{ width: `${(revealedCount / cards.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs font-mono text-slate-600">{revealedCount}/{cards.length}</span>
        </div>

        {/* Cards */}
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {cards.map((card, i) => (
            <motion.div
              key={`${key}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ScratchCard
                card={card}
                onRevealed={() => setRevealedCount((c) => c + 1)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* All revealed celebration */}
        <AnimatePresence>
          {revealedCount === cards.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <motion.p
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 3, duration: 0.4 }}
                className="text-2xl mb-2"
              >
                🎉
              </motion.p>
              <p className="text-slate-400 text-sm mb-4">All cards revealed! Let's connect.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black text-sm transition-all hover:scale-105"
                  style={{ background: "#00d4ff", boxShadow: "0 0 20px #00d4ff30" }}
                >
                  <Mail size={15} /> Send a Message
                </a>
                <button
                  onClick={() => { setRevealedCount(0); setKey((k) => k + 1); }}
                  className="px-6 py-3 rounded-xl text-slate-500 border border-white/8 hover:text-white hover:border-white/20 transition-all text-sm"
                >
                  Scratch again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-20 text-center text-slate-700 text-xs">
        Built with Next.js & ❤️ · {new Date().getFullYear()} Harsh Dixit
      </div>
    </section>
  );
}

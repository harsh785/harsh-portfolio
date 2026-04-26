"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Mail, Phone, GitBranch, ExternalLink, Send, Check } from "lucide-react";
import { personalInfo } from "@/lib/data";

const cards = [
  { icon: Mail,         label: "Email",     value: personalInfo.email,            href: `mailto:${personalInfo.email}`, color: "#89dceb", emoji: "📧" },
  { icon: Phone,        label: "Phone",     value: personalInfo.phone,            href: `tel:${personalInfo.phone}`,    color: "#cba6f7", emoji: "📱" },
  { icon: GitBranch,    label: "GitHub",    value: "github.com/harsh785",         href: personalInfo.github,            color: "#f59e0b", emoji: "💻" },
  { icon: ExternalLink, label: "LinkedIn",  value: "harsh-dixit-156a371b0",       href: personalInfo.linkedin,          color: "#0ea5e9", emoji: "🔗" },
  { icon: Send,         label: "Available", value: "Open to opportunities",       href: `mailto:${personalInfo.email}`, color: "#39ff14", emoji: "🚀" },
];

// Natural float positions so cards don't overlap (% of container)
const basePositions = [
  { x: 10,  y: 8  },
  { x: 60,  y: 5  },
  { x: 35,  y: 42 },
  { x: 8,   y: 62 },
  { x: 62,  y: 60 },
];

const PULL_RADIUS   = 180;  // px — within this distance card is attracted
const MAX_PULL      = 45;   // px — max displacement toward cursor
const FLOAT_RANGE   = 10;   // px — ambient float amplitude

function MagneticCard({
  card,
  basePos,
  mouseX,
  mouseY,
  containerRef,
}: {
  card: typeof cards[0];
  basePos: { x: number; y: number };
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);
  const [copied, setCopied]   = useState(false);
  const [ripple, setRipple]   = useState(false);
  const [glowing, setGlowing] = useState(false);

  // Sprung motion values for smooth magnetic movement
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 180, damping: 18, mass: 0.6 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 18, mass: 0.6 });

  // Ambient float offset
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });

  // Unique float phase per card so they don't sync
  const phase = useRef(Math.random() * Math.PI * 2);
  const phaseY = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    let t = 0;
    const floatLoop = () => {
      t += 0.012;
      setFloatOffset({
        x: Math.sin(t + phase.current)  * FLOAT_RANGE * 0.5,
        y: Math.cos(t + phaseY.current) * FLOAT_RANGE,
      });
      rafRef.current = requestAnimationFrame(floatLoop);
    };
    floatLoop();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Magnetic pull loop
  useEffect(() => {
    let raf: number;
    const loop = () => {
      if (cardRef.current && containerRef.current) {
        const cardRect      = cardRef.current.getBoundingClientRect();
        const cardCX        = cardRect.left + cardRect.width  / 2;
        const cardCY        = cardRect.top  + cardRect.height / 2;
        const dx            = mouseX.current - cardCX;
        const dy            = mouseY.current - cardCY;
        const dist          = Math.sqrt(dx * dx + dy * dy);

        if (dist < PULL_RADIUS && dist > 0) {
          const strength = (1 - dist / PULL_RADIUS) ** 1.5;
          rawX.set(dx * strength * (MAX_PULL / PULL_RADIUS) * 3);
          rawY.set(dy * strength * (MAX_PULL / PULL_RADIUS) * 3);
          setGlowing(dist < 100);
        } else {
          rawX.set(0);
          rawY.set(0);
          setGlowing(false);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [containerRef, mouseX, mouseY, rawX, rawY]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (card.href.startsWith("http")) {
      window.open(card.href, "_blank", "noopener,noreferrer");
    } else {
      navigator.clipboard.writeText(card.value);
      setCopied(true);
      setRipple(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setRipple(false), 600);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        position: "absolute",
        left: `${basePos.x}%`,
        top:  `${basePos.y}%`,
        x: springX,
        y: springY,
        translateX: floatOffset.x,
        translateY: floatOffset.y,
      }}
      className="cursor-pointer select-none"
      whileTap={{ scale: 0.93 }}
      onClick={handleClick}
    >
      {/* Ripple */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ background: `radial-gradient(circle, ${card.color}80, transparent)` }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          boxShadow: glowing
            ? `0 0 0 2px ${card.color}80, 0 0 40px ${card.color}40, 0 8px 32px rgba(0,0,0,0.4)`
            : `0 0 0 1px ${card.color}20, 0 4px 20px rgba(0,0,0,0.3)`,
        }}
        transition={{ duration: 0.25 }}
        className="relative rounded-2xl px-5 py-4 backdrop-blur-md w-52"
        style={{ background: `linear-gradient(135deg, ${card.color}12, rgba(15,15,30,0.95))`, border: `1px solid ${card.color}20` }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{ background: `${card.color}15`, borderColor: `${card.color}25` }}>
            <card.icon size={16} style={{ color: card.color }} />
          </div>

          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ color: "#39ff14", background: "#39ff1415", border: "1px solid #39ff1430" }}
              >
                <Check size={11} className="inline mr-0.5" />copied!
              </motion.span>
            ) : (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: glowing ? 1 : 0.4 }}
                className="text-xs text-slate-600 font-mono"
              >
                click to copy
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Label */}
        <p className="text-xs font-mono mb-0.5" style={{ color: card.color }}>{card.label}</p>

        {/* Value */}
        <p className="text-white text-sm font-semibold truncate">{card.value}</p>

        {/* Glow dot */}
        <motion.div
          className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
          style={{ background: card.color }}
          animate={{ opacity: glowing ? [1, 0.3, 1] : 0.3, scale: glowing ? [1, 1.4, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(-9999);
  const mouseY = useRef(-9999);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <section id="contact" className="py-24 px-6 bg-[#0d0d14] overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#89dceb] text-sm font-mono mb-3">
            <Send size={14} />
            <span>contact.magnetic</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Get In Touch</h2>
          <p className="text-slate-500 mt-2 text-sm font-mono">
            move your cursor near the cards · click to open or copy
          </p>
        </motion.div>

        {/* Floating arena */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative w-full"
          style={{ height: 420 }}
        >
          {/* Subtle radial bg */}
          <div className="absolute inset-0 rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.03) 0%, transparent 70%)" }} />

          {/* Orbit rings (decorative) */}
          {[140, 220, 300].map((r) => (
            <div key={r} className="absolute rounded-full border border-white/[0.03] -translate-x-1/2 -translate-y-1/2"
              style={{ width: r * 2, height: r * 2, top: "50%", left: "50%" }} />
          ))}

          {cards.map((card, i) => (
            <MagneticCard
              key={card.label}
              card={card}
              basePos={basePositions[i]}
              mouseX={mouseX}
              mouseY={mouseY}
              containerRef={containerRef}
            />
          ))}
        </motion.div>

        {/* Direct CTA below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-4"
        >
          <a
            href={`mailto:${personalInfo.email}`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black text-sm transition-all hover:scale-105"
            style={{ background: "#89dceb", boxShadow: "0 0 24px #89dceb30" }}
          >
            <Mail size={15} /> Send a Message
          </a>
        </motion.div>
      </div>

    </section>
  );
}

"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Zap } from "lucide-react";
import TiltCard from "./TiltCard";

// ── Cinematic slide-up line ───────────────────────────────────────────────────
function CineLine({ text, color, delay }: { text: string; color?: "neon" | "white"; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.span
        initial={{ y: "110%" }}
        animate={inView ? { y: 0 } : {}}
        transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
        className="block text-4xl md:text-5xl font-black leading-tight tracking-tight"
        style={color === "neon" ? { color: "#39ff14", textShadow: "0 0 30px #39ff1460" } : { color: "#fff" }}
      >
        {text}
      </motion.span>
    </div>
  );
}

// ── Animated terminal inside a bento card ─────────────────────────────────────
const configLines = [
  { text: 'name:       "Harsh Dixit"',          color: "#e2e8f0" },
  { text: 'role:       "Senior Cloud Engineer"', color: "#e2e8f0" },
  { text: 'company:    "Caylent"',               color: "#39ff14" },
  { text: 'location:   "India (Remote)"',        color: "#e2e8f0" },
  { text: 'experience: "5+ years"',              color: "#00d4ff" },
  { text: 'certified:  "AWS SAA-C03"',           color: "#FF9900" },
  { text: 'stack:      ["AWS","K8s","TF","Docker"]', color: "#7c3aed" },
  { text: 'available:  true',                    color: "#39ff14" },
];

function BentoTerminal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= configLines.length) clearInterval(t);
    }, 180);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <div ref={ref} className="h-full flex flex-col">
      {/* Chrome */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-slate-600 text-xs font-mono">cat harsh.config</span>
      </div>
      {/* Output */}
      <div className="font-mono text-xs space-y-1.5 flex-1">
        <div className="text-slate-600 mb-2">$ cat ~/.config/harsh.yml</div>
        {configLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={visibleCount > i ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.2 }}
            style={{ color: line.color }}
          >
            {line.text}
          </motion.div>
        ))}
        {visibleCount >= configLines.length && (
          <span className="inline-block w-1.5 h-3.5 bg-[#00d4ff] animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

// ── Bento card wrapper ────────────────────────────────────────────────────────
function BentoCard({ children, className = "", style = {}, tilt = true, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tilt?: boolean;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const inner = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border border-white/5 bg-[#1a1a2e]/50 p-5 h-full ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
  return tilt ? <TiltCard intensity={6} className="h-full">{inner}</TiltCard> : inner;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function About() {
  const sectionRef = useRef(null);

  return (
    <section id="about" ref={sectionRef} className="relative py-24 px-6 bg-[#0a0a0f] overflow-hidden">
      {/* Bg glow */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: "rgba(0,212,255,0.04)", transform: "translate(-50%,-50%)" }} />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Eyebrow */}
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xs font-mono text-slate-600 uppercase tracking-[0.25em] mb-8">
          — who am i
        </motion.p>

        {/* Bento grid */}
        <div className="grid grid-cols-12 grid-rows-[auto_auto_auto] gap-4">

          {/* ── Cinematic text — spans 7 cols, row 1 ── */}
          <div className="col-span-12 lg:col-span-7 row-span-1">
            <div className="space-y-0.5 mb-6">
              <CineLine text="I build infrastructure" delay={0} />
              <CineLine text="that never breaks" delay={0.12} />
              <CineLine text="at 3am." color="neon" delay={0.24} />
            </div>
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-base leading-relaxed max-w-lg">
              5+ years turning complex infrastructure problems into clean, automated, observable systems on AWS. I live in the terminal, think in pipelines, and sleep well knowing my alerts are tuned.
            </motion.p>
          </div>

          {/* ── Status card — top right ── */}
          <div className="col-span-6 lg:col-span-2 row-span-1">
            <BentoCard delay={0.15} style={{ background: "#39ff1408", borderColor: "#39ff1420" }}>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono">Available</span>
              </div>
              <p className="text-white font-bold text-sm">Open to roles</p>
              <p className="text-slate-500 text-xs mt-0.5">Remote · Full-time</p>
            </BentoCard>
          </div>

          {/* ── Location card ── */}
          <div className="col-span-6 lg:col-span-3 row-span-1">
            <BentoCard delay={0.2} style={{ background: "#7c3aed08", borderColor: "#7c3aed20" }}>
              <MapPin size={16} className="text-[#7c3aed] mb-3" />
              <p className="text-white font-bold text-sm">India</p>
              <p className="text-slate-500 text-xs mt-0.5">Remote-first · IST</p>
              <p className="text-slate-600 text-xs mt-2 font-mono">@ Caylent · US client</p>
            </BentoCard>
          </div>

          {/* ── Terminal card — spans 7 cols, row 2 ── */}
          <div className="col-span-12 lg:col-span-7">
            <BentoCard delay={0.25} className="min-h-[220px]"
              style={{ background: "rgba(13,13,26,0.8)", borderColor: "rgba(0,212,255,0.08)" }}>
              <BentoTerminal />
            </BentoCard>
          </div>

          {/* ── Cert card ── */}
          <div className="col-span-6 lg:col-span-2">
            <BentoCard delay={0.3} style={{ background: "#FF990008", borderColor: "#FF990020" }}>
              <span className="text-3xl">☁️</span>
              <p className="text-[#FF9900] font-black text-lg mt-2">SAA-C03</p>
              <p className="text-slate-400 text-xs leading-snug mt-1">AWS Solutions Architect Associate</p>
              <div className="mt-3 px-2 py-1 rounded-lg text-xs font-mono w-fit"
                style={{ background: "#FF990015", color: "#FF9900", border: "1px solid #FF990025" }}>
                ✓ Certified
              </div>
            </BentoCard>
          </div>

          {/* ── Experience badge ── */}
          <div className="col-span-6 lg:col-span-3">
            <BentoCard delay={0.35} style={{ background: "#00d4ff06", borderColor: "#00d4ff15" }}>
              <Zap size={16} className="text-[#00d4ff] mb-3" />
              <p className="text-3xl font-black text-white">5+</p>
              <p className="text-[#00d4ff] text-sm font-semibold">Years</p>
              <p className="text-slate-500 text-xs mt-1">4 companies · 50+ pipelines</p>
            </BentoCard>
          </div>

          {/* ── 4 trait cards, full width row ── */}
          {[
            { emoji: "☁️", label: "Cloud Architect",         desc: "Designs AWS infra that scales", color: "#00d4ff" },
            { emoji: "🔧", label: "Automation Obsessed",     desc: "If it runs twice, it gets a pipeline", color: "#7c3aed" },
            { emoji: "🛡️", label: "Security-first",          desc: "CIS, FSBP, SOC2 by default", color: "#39ff14" },
            { emoji: "📊", label: "Observability Nerd",      desc: "Prometheus, Grafana, ELK always on", color: "#f59e0b" },
          ].map((t, i) => (
            <div key={t.label} className="col-span-6 lg:col-span-3">
              <BentoCard delay={0.4 + i * 0.07} style={{ borderColor: `${t.color}15` }}>
                <span className="text-2xl">{t.emoji}</span>
                <p className="text-white font-semibold text-sm mt-2">{t.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{t.desc}</p>
                <div className="mt-3 h-px w-full rounded-full" style={{ background: `linear-gradient(90deg, ${t.color}40, transparent)` }} />
              </BentoCard>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

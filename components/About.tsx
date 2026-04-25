"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const lines = [
  { text: "I build infrastructure",  size: "text-4xl md:text-5xl", color: "text-white",      delay: 0    },
  { text: "that never breaks",       size: "text-4xl md:text-5xl", color: "text-white",      delay: 0.12 },
  { text: "at 3am.",                 size: "text-4xl md:text-5xl", color: "neon",            delay: 0.24 },
];

const facts = [
  { value: "5+",    label: "Years",      color: "#00d4ff" },
  { value: "4",     label: "Companies",  color: "#7c3aed" },
  { value: "20+",   label: "AWS Services", color: "#f59e0b" },
  { value: "SOC2",  label: "Compliant",  color: "#39ff14" },
];

const traits = [
  { emoji: "☁️", label: "Cloud Architect",        desc: "Designs AWS infra that scales" },
  { emoji: "🔧", label: "Automation Obsessed",    desc: "If it runs twice, it gets a pipeline" },
  { emoji: "🛡️", label: "Security-first mindset", desc: "CIS, FSBP, SOC2 by default" },
  { emoji: "📊", label: "Observability nerd",     desc: "Prometheus, Grafana, ELK always on" },
];

function CinematicLine({ text, size, color, delay }: { text: string; size: string; color: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "110%", opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`${size} font-black leading-tight tracking-tight ${color === "neon" ? "" : color}`}
        style={color === "neon" ? { color: "#39ff14", textShadow: "0 0 30px #39ff1460" } : {}}
      >
        {text}
      </motion.div>
    </div>
  );
}

function PhotoCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-center justify-center"
    >
      {/* Spinning gradient ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-[300px] h-[300px] md:w-[360px] md:h-[360px] rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #39ff14, #00d4ff, #7c3aed, #39ff14)",
          padding: 3,
        }}
      >
        <div className="w-full h-full rounded-full bg-[#0a0a0f]" />
      </motion.div>

      {/* Second slower ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute w-[330px] h-[330px] md:w-[395px] md:h-[395px] rounded-full"
        style={{
          border: "1px dashed rgba(0,212,255,0.2)",
        }}
      />

      {/* Photo */}
      <div
        className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-full overflow-hidden z-10"
        style={{ border: "3px solid rgba(0,212,255,0.15)" }}
      >
        <img
          src="/harsh-portfolio/harsh.jpg"
          alt="Harsh Dixit"
          className="w-full h-full object-cover object-top"
        />
        {/* Subtle dark overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{ background: "linear-gradient(to top, rgba(10,10,15,0.5), transparent)" }} />
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-2 -right-2 md:bottom-4 md:right-0 z-20 px-3 py-2 rounded-xl border text-xs font-mono"
        style={{ background: "#39ff1410", borderColor: "#39ff1430", color: "#39ff14", boxShadow: "0 0 20px #39ff1420" }}
      >
        ● Currently @ Caylent
      </motion.div>
    </motion.div>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section id="about" ref={sectionRef} className="relative py-28 px-6 bg-[#0a0a0f] overflow-hidden">
      {/* Parallax background glow */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: "rgba(0,212,255,0.04)" }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: "rgba(57,255,20,0.03)" }} />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Photo */}
          <div className="flex justify-center lg:justify-start">
            <PhotoCard />
          </div>

          {/* Right — Cinematic text */}
          <div>
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] mb-6"
            >
              — who am i
            </motion.p>

            {/* Cinematic lines */}
            <div className="mb-8 space-y-1">
              {lines.map((line) => (
                <CinematicLine key={line.text} {...line} />
              ))}
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-base leading-relaxed mb-10 max-w-md"
            >
              5+ years turning complex infrastructure problems into clean, automated, observable systems on AWS. I live in the terminal, think in pipelines, and sleep well knowing my alerts are tuned.
            </motion.p>

            {/* Fact pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              {facts.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                  className="flex items-baseline gap-1.5 px-4 py-2 rounded-xl border"
                  style={{ background: `${f.color}08`, borderColor: `${f.color}20` }}
                >
                  <span className="text-xl font-black" style={{ color: f.color }}>{f.value}</span>
                  <span className="text-xs text-slate-500">{f.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Trait cards */}
            <div className="grid grid-cols-2 gap-3">
              {traits.map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.65 + i * 0.07 }}
                  whileHover={{ y: -2, borderColor: "rgba(0,212,255,0.2)" }}
                  className="p-3 rounded-xl border border-white/5 bg-[#1e1e2e]/40 transition-colors duration-200"
                >
                  <span className="text-lg">{t.emoji}</span>
                  <p className="text-white text-xs font-semibold mt-1">{t.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

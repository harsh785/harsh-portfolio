"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Trophy, GraduationCap, Star } from "lucide-react";
import { achievements, certifications, education, careerStats } from "@/lib/data";
import TiltCard from "./TiltCard";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = 16;
    const increment = target / (1800 / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── Rarity config ─────────────────────────────────────────────────────────────
const rarityConfig: Record<string, { color: string; bg: string; stars: number }> = {
  LEGENDARY: { color: "#FF9900", bg: "#FF990015", stars: 3 },
  EPIC:      { color: "#cba6f7", bg: "#cba6f715", stars: 2 },
  RARE:      { color: "#89dceb", bg: "#89dceb10", stars: 1 },
};

// ── Achievement card ──────────────────────────────────────────────────────────
function AchievementCard({ ach, index }: { ach: typeof achievements[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [unlocked, setUnlocked] = useState(false);
  const [flash, setFlash] = useState(false);
  const cfg = rarityConfig[ach.rarity] ?? rarityConfig.RARE;

  useEffect(() => {
    if (inView && !unlocked) {
      const t = setTimeout(() => {
        setUnlocked(true);
        setFlash(true);
        setTimeout(() => setFlash(false), 500);
      }, index * 120 + 150);
      return () => clearTimeout(t);
    }
  }, [inView, unlocked, index]);

  return (
    <div ref={ref}>
      <TiltCard intensity={8}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={unlocked ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl p-5 border overflow-hidden h-full"
          style={{
            background: flash ? `${cfg.color}20` : cfg.bg,
            borderColor: `${cfg.color}25`,
            transition: "background 0.4s ease",
          }}
        >
          {/* Flash overlay */}
          {flash && (
            <motion.div
              initial={{ opacity: 0.6 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: `radial-gradient(ellipse, ${cfg.color}50, transparent)` }}
            />
          )}

          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <motion.span
              className="text-2xl"
              animate={unlocked ? { rotate: [0, -12, 12, -6, 0], scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {ach.icon}
            </motion.span>
            <div className="flex items-center gap-1">
              {Array.from({ length: cfg.stars }).map((_, i) => (
                <Star key={i} size={10} style={{ color: cfg.color }} fill={cfg.color} />
              ))}
              <span className="text-xs font-bold font-mono ml-1" style={{ color: cfg.color }}>
                {ach.rarity}
              </span>
            </div>
          </div>

          <h4 className="text-white font-bold text-sm mb-1.5 leading-snug">{ach.title}</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">{ach.description}</p>

          {/* Unlock bar */}
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={unlocked ? { width: "100%" } : {}}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{ background: `linear-gradient(90deg, ${cfg.color}60, ${cfg.color})` }}
              />
            </div>
            <span className="text-xs font-mono flex-shrink-0" style={{ color: cfg.color }}>
              {unlocked ? "✓ UNLOCKED" : "LOCKED"}
            </span>
          </div>
        </motion.div>
      </TiltCard>
    </div>
  );
}

// ── 3D flip cert card ─────────────────────────────────────────────────────────
function CertCard() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="relative w-full h-52 cursor-pointer" style={{ perspective: 1000 }}
      onClick={() => setFlipped(f => !f)}>
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between border"
          style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg,#1a1000,#0d0d14)", borderColor: "#FF990030" }}>
          <div className="flex justify-between items-start">
            <span className="text-4xl">☁️</span>
            <span className="text-xs font-mono px-2 py-1 rounded-lg border" style={{ color: "#FF9900", borderColor: "#FF990030", background: "#FF990010" }}>CERTIFIED</span>
          </div>
          <div>
            <p className="text-2xl font-black text-white">SAA-C03</p>
            <p className="text-sm font-semibold" style={{ color: "#FF9900" }}>AWS Solutions Architect Associate</p>
            <p className="text-slate-600 text-xs mt-0.5">Amazon Web Services</p>
          </div>
          <p className="text-slate-700 text-xs font-mono">click to flip →</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between border"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg,#1a1000,#0d0d14)", borderColor: "#FF990030" }}>
          <p className="text-xs text-slate-500 uppercase tracking-wider">What this certifies</p>
          <ul className="space-y-2">
            {["Design resilient, HA AWS architectures", "Choose the right service for cost & perf", "Security best practices across AWS", "Networking — VPC, Route53, CloudFront"].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                <span style={{ color: "#FF9900" }} className="mt-0.5 flex-shrink-0">▹</span>{item}
              </li>
            ))}
          </ul>
          <p className="text-slate-700 text-xs font-mono">← flip back</p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Achievements() {
  return (
    <section id="achievements" className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 text-[#89dceb] text-sm font-mono mb-3">
            <Trophy size={14} /><span>trophy_room.exe</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Trophy Room</h2>
          <p className="text-slate-400 mt-2">5 years of wins, numbers, and unlocks</p>
        </motion.div>

        {/* Stat grid — 8 counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
          {careerStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <TiltCard intensity={6}>
                <div className="rounded-2xl p-4 text-center border h-full"
                  style={{ background: `${stat.color}07`, borderColor: `${stat.color}18` }}>
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-black text-white mb-0.5">
                    <Counter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <p className="text-slate-500 text-xs leading-tight">{stat.label}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Achievement cards grid */}
        <div className="mb-12">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-6">Unlockable Achievements</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach, i) => (
              <AchievementCard key={i} ach={ach} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom row — cert + education + passive perks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cert */}
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-4">Certification</p>
            <CertCard />
          </div>

          {/* Education */}
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-4">Education</p>
            <TiltCard intensity={8}>
              <div className="rounded-2xl p-5 border h-52 flex flex-col justify-between"
                style={{ background: "#cba6f708", borderColor: "#cba6f720" }}>
                <div className="w-10 h-10 rounded-xl bg-[#cba6f7]/10 border border-[#cba6f7]/20 flex items-center justify-center">
                  <GraduationCap size={18} className="text-[#cba6f7]" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Degree</p>
                  <h4 className="text-white font-bold text-sm leading-snug">{education.degree}</h4>
                  <p className="text-[#cba6f7] text-xs font-medium mt-1">{education.institution}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{education.year}</p>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Passive perks */}
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-4">Passive Perks</p>
            <TiltCard intensity={8}>
              <div className="rounded-2xl p-5 border h-52 flex flex-col justify-between"
                style={{ background: "#89dceb05", borderColor: "#89dceb12" }}>
                <p className="text-xs text-slate-500">Soft skills that ship with the engineer</p>
                <div className="flex flex-wrap gap-2">
                  {["Problem Solving", "Continuous Learning", "Collaboration", "Communication", "Curiosity", "Team Player"].map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-full text-xs border font-medium"
                      style={{ color: "#89dceb90", borderColor: "#89dceb18", background: "#89dceb08" }}>
                      +{skill}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}

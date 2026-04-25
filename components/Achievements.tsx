"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Trophy, GraduationCap, Star, DollarSign, Users, Zap } from "lucide-react";
import { achievements, certifications, education } from "@/lib/data";

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── 3-D flip cert card ────────────────────────────────────────────────────────
function CertCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-56 cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between border"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #1a1000, #0a0a0f)",
            borderColor: "#FF990030",
          }}
        >
          <div className="flex items-start justify-between">
            <div className="text-5xl">☁️</div>
            <div
              className="px-2 py-1 rounded-lg text-xs font-mono border"
              style={{ color: "#FF9900", borderColor: "#FF990030", background: "#FF990010" }}
            >
              CERTIFIED
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white mb-1">SAA-C03</p>
            <p className="text-sm font-semibold" style={{ color: "#FF9900" }}>AWS Solutions Architect Associate</p>
            <p className="text-slate-500 text-xs mt-1">Amazon Web Services</p>
          </div>
          <p className="text-slate-600 text-xs font-mono">click to flip →</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between border"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #1a1000, #0a0a0f)",
            borderColor: "#FF990030",
          }}
        >
          <p className="text-xs text-slate-500 uppercase tracking-wider">What this means</p>
          <ul className="space-y-2">
            {[
              "Design resilient, high-availability AWS architectures",
              "Choose the right service for cost & performance",
              "Implement security best practices across AWS",
              "Manage networking with VPC, Route53, CloudFront",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                <span style={{ color: "#FF9900" }} className="mt-0.5 flex-shrink-0">▹</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-slate-600 text-xs font-mono">← flip back</p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Achievement unlock card ───────────────────────────────────────────────────
const achConfig = [
  {
    icon: DollarSign,
    color: "#10b981",
    rarity: "EPIC",
    rarityColor: "#10b981",
    emoji: "💰",
  },
  {
    icon: Users,
    color: "#00d4ff",
    rarity: "RARE",
    rarityColor: "#00d4ff",
    emoji: "🏆",
  },
];

function AchievementCard({ ach, index, config }: {
  ach: { title: string; description: string };
  index: number;
  config: typeof achConfig[0];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [unlocked, setUnlocked] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (inView && !unlocked) {
      const t = setTimeout(() => {
        setUnlocked(true);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 600);
      }, index * 300 + 200);
      return () => clearTimeout(t);
    }
  }, [inView, unlocked, index]);

  return (
    <div ref={ref} className="relative">
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            style={{ background: `radial-gradient(ellipse at center, ${config.color}60, transparent)` }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
        animate={unlocked ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-2xl p-5 border overflow-hidden group transition-all duration-300"
        style={{
          background: unlocked ? `${config.color}06` : "rgba(15,15,25,0.8)",
          borderColor: unlocked ? `${config.color}25` : "rgba(255,255,255,0.04)",
        }}
      >
        {/* Rarity badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <Star size={10} style={{ color: config.rarityColor }} fill={config.rarityColor} />
          <span className="text-xs font-bold font-mono" style={{ color: config.rarityColor }}>
            {config.rarity}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border"
            style={{ background: `${config.color}12`, borderColor: `${config.color}25` }}
            animate={unlocked ? { rotate: [0, -10, 10, -5, 0] } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {config.emoji}
          </motion.div>
          <div className="flex-1 pr-16">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-bold text-sm">{ach.title}</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{ach.description}</p>
          </div>
        </div>

        {/* Unlock status bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={unlocked ? { width: "100%" } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{ background: `linear-gradient(90deg, ${config.color}60, ${config.color})` }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: config.color }}>
            {unlocked ? "UNLOCKED ✓" : "LOCKED"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
const stats = [
  { label: "Years Experience", target: 5, suffix: "+", icon: Zap, color: "#00d4ff" },
  { label: "AWS Credits Secured", target: 5000, prefix: "$", icon: DollarSign, color: "#10b981" },
  { label: "AWS Dispute Resolved", target: 1300, prefix: "$", icon: Trophy, color: "#FF9900" },
  { label: "Pipelines Built", target: 50, suffix: "+", icon: Star, color: "#7c3aed" },
];

export default function Achievements() {
  return (
    <section id="achievements" className="py-24 px-6 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Trophy size={14} />
            <span>trophy_room.exe</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Trophy Room</h2>
          <p className="text-slate-400 mt-2">Scroll to unlock achievements</p>
        </motion.div>

        {/* Stat counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 text-center border"
              style={{ background: `${stat.color}06`, borderColor: `${stat.color}15` }}
            >
              <stat.icon size={18} className="mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-2xl font-black text-white mb-1">
                <Counter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-slate-500 text-xs leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — cert + education */}
          <div className="space-y-4">
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-2">Certification</p>
            <CertCard />

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-5 border"
              style={{ background: "#7c3aed08", borderColor: "#7c3aed20" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">Education</p>
                  <h4 className="text-white font-bold text-sm">{education.degree}</h4>
                  <p className="text-[#7c3aed] text-xs font-medium mt-0.5">{education.institution}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{education.year}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — achievement unlock cards */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-2">Unlockable Achievements</p>
            {achievements.map((ach, i) => (
              <AchievementCard
                key={i}
                ach={ach}
                index={i}
                config={achConfig[i % achConfig.length]}
              />
            ))}

            {/* Soft skills as a "passive perks" panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-5 border"
              style={{ background: "#00d4ff05", borderColor: "#00d4ff12" }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-3">
                Passive Perks
              </p>
              <div className="flex flex-wrap gap-2">
                {["Problem Solving", "Continuous Learning", "Collaboration", "Communication", "Curiosity", "Team Player"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs border font-medium"
                    style={{ color: "#00d4ff99", borderColor: "#00d4ff15", background: "#00d4ff08" }}
                  >
                    +{skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

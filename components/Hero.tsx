"use client";
import { motion } from "framer-motion";
import { GitBranch, ExternalLink, Mail, ChevronDown } from "lucide-react";
import { personalInfo } from "@/lib/data";
import MatrixRain from "./MatrixRain";
import { useState, useEffect, lazy, Suspense } from "react";
const HeroScene = lazy(() => import("./HeroScene"));

const roles = [
  "Senior Cloud Engineer",
  "AWS Architect",
  "DevOps Specialist",
  "Infrastructure Automator",
  "Kubernetes Engineer",
];

function GlitchText({ text }: { text: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 300);
    };
    const interval = setInterval(trigger, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="relative inline-block"
      style={glitching ? {
        textShadow: "2px 0 #ff00ff, -2px 0 #00ffff",
        transform: "skew(-2deg)",
      } : {}}
    >
      {text}
    </span>
  );
}

function TypewriterRoles() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = roles[idx];
    if (!deleting && displayed === target) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (deleting && displayed === "") {
      setDeleting(false);
      setIdx((i) => (i + 1) % roles.length);
      return;
    }
    const speed = deleting ? 40 : 70;
    const t = setTimeout(() => {
      setDisplayed(deleting ? displayed.slice(0, -1) : target.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [displayed, deleting, idx]);

  return (
    <span className="text-[#89dceb]">
      {displayed}
      <span className="animate-pulse">_</span>
    </span>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <MatrixRain />
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      {/* Radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#89dceb]/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#cba6f7]/6 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e2e]/80 border border-[#89dceb]/20 text-sm font-mono mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 font-medium">Available for opportunities</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight leading-none cursor-blink">
            <span className="text-white">Harsh </span>
            <span className="neon-green-text">
              <GlitchText text="Dixit" />
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-2xl md:text-3xl font-light text-slate-300 mb-3 h-10"
        >
          <TypewriterRoles />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex items-center justify-center gap-3 mb-8 flex-wrap"
        >
          <span className="px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-mono">
            AWS SAA-C03
          </span>
          <span className="px-3 py-1 rounded-full bg-[#89dceb]/10 border border-[#89dceb]/20 text-[#89dceb] text-xs font-mono">
            5+ Years
          </span>
          <span className="px-3 py-1 rounded-full bg-[#cba6f7]/10 border border-[#cba6f7]/20 text-[#cba6f7] text-xs font-mono">
            Cloud · DevOps · IaC
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <a
            href={`mailto:${personalInfo.email}`}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#89dceb] text-black font-bold hover:bg-[#00bfea] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
          >
            <Mail size={16} />
            Hire Me
          </a>
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-transparent border border-white/15 text-white font-semibold hover:border-[#89dceb]/50 hover:bg-white/5 transition-all duration-200 hover:scale-105"
          >
            <GitBranch size={16} />
            GitHub
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-transparent border border-white/15 text-white font-semibold hover:border-[#0ea5e9]/50 hover:bg-white/5 transition-all duration-200 hover:scale-105"
          >
            <ExternalLink size={16} />
            LinkedIn
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-slate-600 text-xs font-mono tracking-widest uppercase"
        >
          scroll to explore the journey
        </motion.p>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}

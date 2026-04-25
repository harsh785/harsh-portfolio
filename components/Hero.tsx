"use client";
import { motion } from "framer-motion";
import { GitBranch, ExternalLink, Mail, ChevronDown, Terminal } from "lucide-react";
import { personalInfo } from "@/lib/data";

const floatingIcons = ["☁️", "🚀", "⚙️", "🐳", "🔧", "📊", "🛡️", "⚡"];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center grid-bg overflow-hidden"
    >
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00d4ff]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-[#7c3aed]/5 blur-3xl pointer-events-none" />

      {/* Floating emoji icons */}
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-20 pointer-events-none select-none"
          style={{
            top: `${10 + ((i * 37) % 80)}%`,
            left: `${5 + ((i * 23) % 90)}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          {icon}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Terminal badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e2e] border border-[#00d4ff]/20 text-[#00d4ff] text-sm font-mono mb-8"
        >
          <Terminal size={14} />
          <span>$ whoami</span>
          <span className="inline-block w-2 h-4 bg-[#00d4ff] animate-pulse ml-1" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
        >
          <span className="text-white">{personalInfo.name.split(" ")[0]} </span>
          <span className="gradient-text">{personalInfo.name.split(" ")[1]}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 font-light mb-2"
        >
          {personalInfo.title}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-green-400 font-medium">{personalInfo.tagline}</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {personalInfo.summary}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <a
            href={`mailto:${personalInfo.email}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00d4ff] text-black font-semibold hover:bg-[#00bfea] transition-all duration-200 hover:scale-105"
          >
            <Mail size={16} />
            Get in Touch
          </a>
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e1e2e] border border-white/10 text-white font-semibold hover:border-[#00d4ff]/40 transition-all duration-200 hover:scale-105"
          >
            <GitBranch size={16} />
            GitHub
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e1e2e] border border-white/10 text-white font-semibold hover:border-[#00d4ff]/40 transition-all duration-200 hover:scale-105"
          >
            <ExternalLink size={16} />
            LinkedIn
          </a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}

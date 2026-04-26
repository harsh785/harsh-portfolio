"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Terminal } from "lucide-react";
import { SkillWorld, skillWorlds } from "@/lib/skillWorlds";

function MiniTerminal({ commands, color }: { commands: SkillWorld["terminalCommands"]; color: string }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setStep(0); setTyped(""); setShowOutput(false); setDone(false);
  }, [commands]);

  useEffect(() => {
    if (done) return;
    const cmd = commands[step]?.cmd ?? "";
    if (!showOutput && typed.length < cmd.length) {
      const t = setTimeout(() => setTyped(cmd.slice(0, typed.length + 1)), 35);
      return () => clearTimeout(t);
    }
    if (!showOutput && typed === cmd) {
      const t = setTimeout(() => setShowOutput(true), 200);
      return () => clearTimeout(t);
    }
    if (showOutput && step < commands.length - 1) {
      const t = setTimeout(() => {
        setStep((s) => s + 1);
        setTyped("");
        setShowOutput(false);
      }, 1800);
      return () => clearTimeout(t);
    }
    if (showOutput && step === commands.length - 1) {
      setDone(true);
    }
  }, [typed, showOutput, step, done, commands]);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="bg-[#181825] px-4 py-2 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-slate-500 text-xs font-mono">bash</span>
        <button
          onClick={() => { setStep(0); setTyped(""); setShowOutput(false); setDone(false); }}
          className="ml-auto text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors"
        >
          replay ↺
        </button>
      </div>
      <div className="bg-[#0d0d14] p-4 font-mono text-sm min-h-[180px] space-y-2">
        {commands.slice(0, step).map((c, i) => (
          <div key={i}>
            <div style={{ color }}>$ {c.cmd}</div>
            <div className="text-slate-400 whitespace-pre-wrap text-xs leading-5 mt-1">{c.output}</div>
          </div>
        ))}
        {step < commands.length && (
          <div>
            <div style={{ color }}>
              $ {typed}
              {!showOutput && <span className="animate-pulse">▌</span>}
            </div>
            {showOutput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-400 whitespace-pre-wrap text-xs leading-5 mt-1"
              >
                {commands[step].output}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkillWorldModal({
  skill,
  onClose,
}: {
  skill: SkillWorld;
  onClose: () => void;
}) {
  const idx = skillWorlds.findIndex((s) => s.id === skill.id);
  const prev = skillWorlds[idx - 1];
  const next = skillWorlds[idx + 1];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative min-h-screen max-w-4xl mx-auto bg-gradient-to-br ${skill.bgGradient} border-x border-white/5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{skill.icon}</span>
            <div>
              <p className="text-white font-bold">{skill.name}</p>
              <p className="text-xs font-mono" style={{ color: skill.color }}>{skill.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {prev && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("skill-nav", { detail: prev.id }))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs border border-white/5 hover:border-white/15 transition-all"
              >
                <ChevronLeft size={14} /> {prev.name.split(" ")[0]}
              </button>
            )}
            {next && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("skill-nav", { detail: next.id }))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs border border-white/5 hover:border-white/15 transition-all"
              >
                {next.name.split(" ")[0]} <ChevronRight size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-10">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-mono mb-4 border"
              style={{ color: skill.color, borderColor: skill.color + "30", background: skill.color + "10" }}
            >
              {skill.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{skill.name}</h1>
            <p className="text-xl text-slate-400 italic">"{skill.tagline}"</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {skill.keyFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl p-4 text-center border"
                style={{ background: skill.color + "08", borderColor: skill.color + "20" }}
              >
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{fact.label}</p>
                <p className="font-bold text-white text-sm">{fact.value}</p>
              </div>
            ))}
          </motion.div>

          {/* What is it */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span style={{ color: skill.color }}>01</span> What is it?
            </h2>
            <p className="text-slate-300 leading-relaxed">{skill.what}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* How I use it */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span style={{ color: skill.color }}>02</span> How I use it
              </h2>
              <ul className="space-y-3">
                {skill.howIUseIt.map((point, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed"
                  >
                    <span className="mt-1 flex-shrink-0 font-bold" style={{ color: skill.color }}>▹</span>
                    {point}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Terminal */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Terminal size={16} style={{ color: skill.color }} />
                <span style={{ color: skill.color }}>03</span> Live demo
              </h2>
              <MiniTerminal commands={skill.terminalCommands} color={skill.color} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

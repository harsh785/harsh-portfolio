"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, GitBranch, ExternalLink, Copy, Check, Send, RefreshCw } from "lucide-react";
import { personalInfo } from "@/lib/data";

// ── Pipeline stages ───────────────────────────────────────────────────────────
const stages = [
  {
    id: "init",
    label: "git push",
    icon: "📦",
    fixMsg: "Pushing code to origin/main...",
    output: ["Enumerating objects: 5, done.", "Writing objects: 100%", "Branch 'main' set up to track remote.", "✓ Code pushed successfully"],
    reveals: { label: "Email", value: personalInfo.email, href: `mailto:${personalInfo.email}`, icon: Mail, color: "#00d4ff" },
  },
  {
    id: "build",
    label: "docker build",
    icon: "🐳",
    fixMsg: "Building Docker image...",
    output: ["Step 1/4 : FROM node:20-alpine", "Step 2/4 : RUN npm ci", "Step 3/4 : COPY . .", "✓ Successfully built image"],
    reveals: { label: "Phone", value: personalInfo.phone, href: `tel:${personalInfo.phone}`, icon: Phone, color: "#7c3aed" },
  },
  {
    id: "test",
    label: "run tests",
    icon: "🧪",
    fixMsg: "Running test suite...",
    output: ["✓ Unit tests passed (42/42)", "✓ Integration tests passed", "✓ Coverage: 94%", "✓ All checks passed"],
    reveals: { label: "GitHub", value: "github.com/harsh785", href: personalInfo.github, icon: GitBranch, color: "#f59e0b" },
  },
  {
    id: "scan",
    label: "security scan",
    icon: "🛡️",
    fixMsg: "Running security checks...",
    output: ["Scanning for vulnerabilities...", "✓ 0 critical issues found", "✓ IAM policies validated", "✓ Security scan passed"],
    reveals: { label: "LinkedIn", value: "harsh-dixit-156a371b0", href: personalInfo.linkedin, icon: ExternalLink, color: "#0ea5e9" },
  },
  {
    id: "deploy",
    label: "kubectl apply",
    icon: "🚀",
    fixMsg: "Deploying to production...",
    output: ["deployment.apps/harsh configured", "service/contact-harsh unchanged", "✓ Rollout complete (3/3 pods ready)", "✓ DEPLOYMENT SUCCESSFUL 🎉"],
    reveals: { label: "Available", value: "Open to opportunities", href: `mailto:${personalInfo.email}`, icon: Send, color: "#39ff14" },
  },
];

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, color }: { text: string; color: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1 rounded-md transition-all hover:bg-white/10"
      style={{ color: copied ? "#39ff14" : "#64748b" }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── Single pipeline stage ─────────────────────────────────────────────────────
function Stage({
  stage,
  status,
  onClick,
  stageIndex,
  fixedCount,
}: {
  stage: typeof stages[0];
  status: "idle" | "fixing" | "done";
  onClick: () => void;
  stageIndex: number;
  fixedCount: number;
}) {
  const locked = stageIndex > fixedCount;

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {/* Connector line */}
      {stageIndex < stages.length - 1 && (
        <div className="absolute left-full top-6 w-full h-px -translate-y-1/2 hidden md:block" style={{ width: "calc(100% - 48px)", left: "calc(50% + 24px)" }}>
          <div className="h-px w-full bg-white/5" />
          <motion.div
            className="h-px absolute top-0 left-0"
            style={{ background: "#39ff14" }}
            initial={{ width: 0 }}
            animate={{ width: status === "done" ? "100%" : 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Node */}
      <motion.button
        onClick={!locked && status === "idle" ? onClick : undefined}
        whileHover={!locked && status === "idle" ? { scale: 1.1 } : {}}
        whileTap={!locked && status === "idle" ? { scale: 0.95 } : {}}
        className="relative w-12 h-12 rounded-xl flex items-center justify-center text-xl border transition-all duration-300"
        style={{
          background:
            status === "done" ? "#39ff1415" :
            status === "fixing" ? "#f59e0b15" :
            locked ? "#1e1e2e40" : "#1e1e2e",
          borderColor:
            status === "done" ? "#39ff1450" :
            status === "fixing" ? "#f59e0b50" :
            locked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)",
          boxShadow: status === "done" ? "0 0 20px #39ff1425" : "none",
          cursor: locked || status !== "idle" ? "default" : "pointer",
          opacity: locked ? 0.4 : 1,
        }}
      >
        {status === "fixing" ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
            <RefreshCw size={16} className="text-yellow-400" />
          </motion.div>
        ) : status === "done" ? (
          <span>{stage.icon}</span>
        ) : (
          <span className={locked ? "grayscale" : ""}>
            {locked ? "🔒" : stage.icon}
          </span>
        )}

        {/* Pulse on idle+unlocked */}
        {status === "idle" && !locked && (
          <motion.div
            className="absolute inset-0 rounded-xl border border-red-500/50"
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        )}
      </motion.button>

      <span className="text-xs font-mono text-center whitespace-nowrap"
        style={{ color: status === "done" ? "#39ff14" : status === "fixing" ? "#f59e0b" : locked ? "#334155" : "#94a3b8" }}>
        {stage.label}
      </span>

      {/* Status */}
      <span className="text-xs font-mono"
        style={{ color: status === "done" ? "#39ff14" : status === "fixing" ? "#f59e0b" : locked ? "#1e293b" : "#ef4444" }}>
        {status === "done" ? "✓ pass" : status === "fixing" ? "running" : locked ? "locked" : "✗ fail"}
      </span>
    </div>
  );
}

// ── Terminal output panel ─────────────────────────────────────────────────────
function TerminalOutput({ lines, color }: { lines: string[]; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl overflow-hidden border border-white/5 font-mono text-xs"
    >
      <div className="bg-[#1a1a2e] px-3 py-2 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-slate-600 text-xs">pipeline output</span>
      </div>
      <div className="bg-[#0d0d1a] p-4 space-y-1">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.25 }}
            style={{ color: line.startsWith("✓") ? color : "#64748b" }}
          >
            {line}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Revealed contact card ─────────────────────────────────────────────────────
function RevealedCard({ item }: { item: typeof stages[0]["reveals"] }) {
  return (
    <motion.a
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-3 p-3 rounded-xl border group transition-all duration-200"
      style={{ background: `${item.color}08`, borderColor: `${item.color}25` }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
        style={{ background: `${item.color}15`, borderColor: `${item.color}25` }}>
        <item.icon size={14} style={{ color: item.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{item.label}</p>
        <p className="text-slate-200 text-xs font-medium truncate group-hover:text-white transition-colors">{item.value}</p>
      </div>
      <CopyBtn text={item.value} color={item.color} />
    </motion.a>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Contact() {
  const [statuses, setStatuses] = useState<("idle" | "fixing" | "done")[]>(
    stages.map(() => "idle")
  );
  const [activeOutput, setActiveOutput] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);

  const fixedCount = statuses.filter((s) => s === "done").length;

  const handleFix = (idx: number) => {
    if (statuses[idx] !== "idle") return;

    // Set fixing
    setStatuses((prev) => prev.map((s, i) => (i === idx ? "fixing" : s)));
    setActiveOutput(idx);

    // After 2s → done
    setTimeout(() => {
      setStatuses((prev) => {
        const next = prev.map((s, i) => (i === idx ? "done" : s));
        if (next.every((s) => s === "done")) setTimeout(() => setAllDone(true), 400);
        return next;
      });
    }, 2000);
  };

  const reset = () => {
    setStatuses(stages.map(() => "idle"));
    setActiveOutput(null);
    setAllDone(false);
  };

  return (
    <section id="contact" className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Send size={14} />
            <span>contact.pipeline</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Deploy to Reach Me</h2>
          <p className="text-slate-400 mt-2">
            The pipeline is broken. Fix each stage to reveal my contact info.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-10 max-w-sm mx-auto">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #39ff1460, #39ff14)" }}
              animate={{ width: `${(fixedCount / stages.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs font-mono text-slate-500">{fixedCount}/{stages.length} fixed</span>
        </div>

        {/* Pipeline nodes */}
        <div className="relative grid grid-cols-5 gap-2 mb-8 px-4">
          {stages.map((stage, i) => (
            <Stage
              key={stage.id}
              stage={stage}
              status={statuses[i]}
              onClick={() => handleFix(i)}
              stageIndex={i}
              fixedCount={fixedCount}
            />
          ))}
        </div>

        {/* Terminal output */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {activeOutput !== null && (
              <TerminalOutput
                key={activeOutput}
                lines={statuses[activeOutput] === "fixing"
                  ? [stages[activeOutput].fixMsg]
                  : stages[activeOutput].output}
                color="#39ff14"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Revealed contacts */}
        <AnimatePresence>
          {fixedCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              {stages.slice(0, fixedCount).map((stage) =>
                statuses[stages.indexOf(stage)] === "done" ? (
                  <RevealedCard key={stage.id} item={stage.reveals} />
                ) : null
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success state */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl p-8 text-center border mb-6"
              style={{ background: "#39ff1408", borderColor: "#39ff1430" }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-5xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-black text-white mb-2">Pipeline Deployed!</h3>
              <p className="text-slate-400 text-sm mb-6">
                All stages passing. You now have full access to reach me.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black transition-all hover:scale-105"
                  style={{ background: "#39ff14", boxShadow: "0 0 20px #39ff1440" }}
                >
                  <Mail size={16} /> Send a Message
                </a>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <RefreshCw size={14} /> Reset Pipeline
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint */}
        {fixedCount === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-slate-600 text-xs font-mono"
          >
            ↑ click the failing stage to start fixing
          </motion.p>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20 text-center text-slate-700 text-xs"
      >
        <p>Built with Next.js & ❤️ · {new Date().getFullYear()} Harsh Dixit</p>
      </motion.div>
    </section>
  );
}

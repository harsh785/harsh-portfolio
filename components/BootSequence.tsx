"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const lines = [
  { text: "$ ssh harsh@cloud.devops.io", delay: 0, color: "#89dceb" },
  { text: "Connecting to remote host...", delay: 600, color: "#64748b" },
  { text: "Authentication successful ✓", delay: 1200, color: "#10b981" },
  { text: "", delay: 1600, color: "" },
  { text: "$ whoami", delay: 1800, color: "#89dceb" },
  { text: "harsh_dixit -- Senior Cloud & DevOps Engineer", delay: 2200, color: "#e2e8f0" },
  { text: "", delay: 2500, color: "" },
  { text: "$ cat certifications.txt", delay: 2700, color: "#89dceb" },
  { text: "[✓] AWS Solutions Architect Associate (SAA-C03)", delay: 3100, color: "#FF9900" },
  { text: "", delay: 3400, color: "" },
  { text: "$ ls -la experience/", delay: 3600, color: "#89dceb" },
  { text: "drwxr-xr-x  caylent/         Senior Cloud Engineer    [CURRENT]", delay: 4000, color: "#cba6f7" },
  { text: "drwxr-xr-x  hudle/           Senior DevOps Engineer", delay: 4200, color: "#e2e8f0" },
  { text: "drwxr-xr-x  squareboat/      Senior DevOps Engineer", delay: 4400, color: "#e2e8f0" },
  { text: "drwxr-xr-x  i2k2networks/    Cloud Solutions Engineer", delay: 4600, color: "#e2e8f0" },
  { text: "", delay: 4800, color: "" },
  { text: "$ ./load_portfolio.sh", delay: 5000, color: "#89dceb" },
  { text: "Initializing portfolio interface...", delay: 5400, color: "#64748b" },
  { text: "Loading complete. Welcome. 🚀", delay: 5800, color: "#10b981" },
];

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = lines.map((line, i) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
      }, line.delay)
    );

    const exitTimer = setTimeout(() => {
      setDone(true);
      setTimeout(onDone, 800);
    }, 6600);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(exitTimer);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] bg-[#0d0d14] flex items-center justify-center p-8"
        >
          <div className="w-full max-w-2xl">
            {/* Terminal window chrome */}
            <div className="bg-[#181825] rounded-t-xl border border-[#89dceb]/10 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-slate-500 text-xs font-mono">bash — 80×24</span>
            </div>
            <div className="bg-[#0d0d14] rounded-b-xl border border-t-0 border-[#89dceb]/10 p-6 min-h-[320px] font-mono text-sm">
              {lines.map((line, i) => (
                <AnimatePresence key={i}>
                  {visibleLines.includes(i) && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="leading-7"
                      style={{ color: line.color || "transparent" }}
                    >
                      {line.text || " "}
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
              {/* Blinking cursor */}
              {visibleLines.length < lines.length && (
                <span className="inline-block w-2 h-4 bg-[#89dceb] animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

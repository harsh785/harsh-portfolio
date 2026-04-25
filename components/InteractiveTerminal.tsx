"use client";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

type Line = { type: "input" | "output" | "error" | "blank"; content: string };

const COMMANDS: Record<string, () => Line[]> = {
  help: () => [
    { type: "output", content: "Available commands:" },
    { type: "output", content: "  whoami          — About me" },
    { type: "output", content: "  ls skills        — List my skills" },
    { type: "output", content: "  cat experience   — Work history" },
    { type: "output", content: "  cat certs        — Certifications" },
    { type: "output", content: "  contact          — Get in touch" },
    { type: "output", content: "  clear            — Clear terminal" },
    { type: "blank", content: "" },
  ],
  whoami: () => [
    { type: "output", content: "Harsh Dixit" },
    { type: "output", content: "Senior Cloud & DevOps Engineer" },
    { type: "output", content: "AWS SAA-C03 Certified | 5+ Years Experience" },
    { type: "output", content: "Location: India (Remote-first)" },
    { type: "blank", content: "" },
    { type: "output", content: "Currently @ Caylent — building cloud infra for enterprise clients." },
    { type: "blank", content: "" },
  ],
  "ls skills": () => [
    { type: "output", content: "cloud/          terraform/      kubernetes/" },
    { type: "output", content: "docker/         github-actions/ jenkins/" },
    { type: "output", content: "prometheus/     grafana/        elk-stack/" },
    { type: "output", content: "mysql/          postgresql/     dynamodb/" },
    { type: "output", content: "nginx/          ansible/        sentry/" },
    { type: "blank", content: "" },
  ],
  "cat experience": () => [
    { type: "output", content: "┌─ Caylent              [Dec 2025 – Present]" },
    { type: "output", content: "│  Senior Cloud Engineer · Remote" },
    { type: "output", content: "│  EKS, Lambda, Neo4j, SOC2, GitHub Actions" },
    { type: "blank", content: "" },
    { type: "output", content: "├─ Hudle                [Nov 2024 – Dec 2025]" },
    { type: "output", content: "│  Senior DevOps Engineer · On-site" },
    { type: "output", content: "│  Sole DevOps — full lifecycle ownership" },
    { type: "blank", content: "" },
    { type: "output", content: "├─ Squareboat           [Jul 2022 – Jul 2024]" },
    { type: "output", content: "│  DevOps → Senior DevOps Engineer" },
    { type: "output", content: "│  AWS, Terraform, K8s, ELK stack" },
    { type: "blank", content: "" },
    { type: "output", content: "└─ I2K2 Networks        [Mar 2021 – Jun 2022]" },
    { type: "output", content: "   Cloud Solutions Engineer" },
    { type: "output", content: "   AWS, Nginx, Apache, Docker, Terraform" },
    { type: "blank", content: "" },
  ],
  "cat certs": () => [
    { type: "output", content: "┌──────────────────────────────────────────┐" },
    { type: "output", content: "│  AWS Solutions Architect Associate        │" },
    { type: "output", content: "│  Exam Code: SAA-C03                       │" },
    { type: "output", content: "│  Issuer: Amazon Web Services              │" },
    { type: "output", content: "│  Status: ✓ CERTIFIED                      │" },
    { type: "output", content: "└──────────────────────────────────────────┘" },
    { type: "blank", content: "" },
  ],
  contact: () => [
    { type: "output", content: "Email:    Harshdixit23mar@gmail.com" },
    { type: "output", content: "GitHub:   github.com/harsh785" },
    { type: "output", content: "LinkedIn: linkedin.com/in/harsh-dixit-156a371b0" },
    { type: "blank", content: "" },
  ],
  pwd: () => [
    { type: "output", content: "/home/harsh/cloud/career" },
    { type: "blank", content: "" },
  ],
  sudo: () => [
    { type: "error", content: "harsh is not in the sudoers file. Nice try." },
    { type: "blank", content: "" },
  ],
  exit: () => [
    { type: "output", content: "Not so fast. There's more to explore. 😄" },
    { type: "blank", content: "" },
  ],
  ls: () => COMMANDS["ls skills"](),
};

const INITIAL: Line[] = [
  { type: "output", content: "Welcome to harsh@devops:~$ — Interactive Terminal" },
  { type: "output", content: 'Type "help" to see available commands.' },
  { type: "blank", content: "" },
];

export default function InteractiveTerminal() {
  const [history, setHistory] = useState<Line[]>(INITIAL);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const run = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const inputLine: Line = { type: "input", content: `$ ${cmd}` };

    if (trimmed === "clear") {
      setHistory(INITIAL);
      return;
    }

    const handler = COMMANDS[trimmed];
    const output: Line[] = handler
      ? handler()
      : [
          { type: "error", content: `Command not found: ${cmd}. Type "help" for commands.` },
          { type: "blank", content: "" },
        ];

    setHistory((prev) => [...prev, inputLine, ...output]);
    setCmdHistory((prev) => [cmd, ...prev]);
    setHistoryIdx(-1);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) { run(input); setInput(""); }
    } else if (e.key === "ArrowUp") {
      const next = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(next);
      setInput(cmdHistory[next] ?? "");
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? "" : cmdHistory[next]);
      e.preventDefault();
    }
  };

  return (
    <section className="py-24 px-6 bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Terminal size={14} />
            <span>try_me.sh</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Explore Me Interactively</h2>
          <p className="text-slate-400 mt-2">A real terminal. Type commands and discover.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={() => inputRef.current?.focus()}
          className="cursor-text"
        >
          {/* Chrome */}
          <div className="bg-[#1a1a2e] rounded-t-xl border border-[#00d4ff]/15 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-slate-500 text-xs font-mono">harsh@devops:~$</span>
          </div>

          {/* Body */}
          <div
            className="bg-[#0d0d1a] border border-t-0 border-[#00d4ff]/15 rounded-b-xl p-5 h-80 overflow-y-auto font-mono text-sm"
            onWheel={(e) => e.stopPropagation()}
          >
            {history.map((line, i) => (
              <div
                key={i}
                className={`leading-6 whitespace-pre-wrap ${
                  line.type === "input"
                    ? "text-[#00d4ff]"
                    : line.type === "error"
                    ? "text-red-400"
                    : line.type === "blank"
                    ? "h-3"
                    : "text-slate-300"
                }`}
              >
                {line.content}
              </div>
            ))}

            {/* Input row */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[#00d4ff]">$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                className="flex-1 bg-transparent outline-none text-[#00d4ff] caret-[#00d4ff] ml-1"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div ref={bottomRef} />
          </div>
        </motion.div>

        {/* Quick command hints */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {["help", "whoami", "ls skills", "cat experience", "cat certs", "contact"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => { run(cmd); inputRef.current?.focus(); }}
              className="px-3 py-1 text-xs rounded-lg bg-[#1e1e2e] border border-white/5 text-slate-400 hover:border-[#00d4ff]/30 hover:text-[#00d4ff] transition-all font-mono"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

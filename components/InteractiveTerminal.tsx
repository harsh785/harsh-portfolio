"use client";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

type TokenType = "prompt" | "cmd" | "key" | "val" | "comment" | "string" | "error" | "success" | "number" | "path" | "blank";
type Segment = { text: string; tok: TokenType };
type Line = Segment[];

function mkLine(...segments: [string, TokenType][]): Line {
  return segments.map(([text, tok]) => ({ text, tok }));
}

const COMMANDS: Record<string, () => Line[]> = {
  help: () => [
    mkLine(["# Available commands", "comment"]),
    mkLine(["  whoami         ", "key"], ["—", "comment"], [" about me", "val"]),
    mkLine(["  ls skills      ", "key"], ["—", "comment"], [" list my skills", "val"]),
    mkLine(["  cat experience ", "key"], ["—", "comment"], [" work history", "val"]),
    mkLine(["  cat certs      ", "key"], ["—", "comment"], [" certifications", "val"]),
    mkLine(["  contact        ", "key"], ["—", "comment"], [" get in touch", "val"]),
    mkLine(["  clear          ", "key"], ["—", "comment"], [" clear screen", "val"]),
    mkLine(["", "blank"]),
  ],
  whoami: () => [
    mkLine(["Harsh Dixit", "success"]),
    mkLine(["Senior Cloud & DevOps Engineer", "val"]),
    mkLine(["AWS SAA-C03", "string"], ["  |  ", "comment"], ["5+ Years", "number"], ["  |  ", "comment"], ["India (Remote)", "path"]),
    mkLine(["", "blank"]),
    mkLine(["Currently @ ", "comment"], ["Caylent", "cmd"], [" — building cloud infra for enterprise clients.", "val"]),
    mkLine(["", "blank"]),
  ],
  "ls skills": () => [
    mkLine(["drwxr-xr-x  ", "comment"], ["cloud/         ", "path"], ["terraform/     ", "path"], ["kubernetes/", "path"]),
    mkLine(["drwxr-xr-x  ", "comment"], ["docker/        ", "path"], ["github-actions/", "path"], ["jenkins/", "path"]),
    mkLine(["drwxr-xr-x  ", "comment"], ["prometheus/    ", "path"], ["grafana/       ", "path"], ["elk-stack/", "path"]),
    mkLine(["drwxr-xr-x  ", "comment"], ["mysql/         ", "path"], ["postgresql/    ", "path"], ["dynamodb/", "path"]),
    mkLine(["drwxr-xr-x  ", "comment"], ["nginx/         ", "path"], ["ansible/       ", "path"], ["sentry/", "path"]),
    mkLine(["", "blank"]),
  ],
  "cat experience": () => [
    mkLine(["┌─ ", "comment"], ["Caylent", "success"], ["              [", "comment"], ["Dec 2025 – Present", "string"], ["]", "comment"]),
    mkLine(["│  ", "comment"], ["role:     ", "key"], ["Senior Cloud Engineer · Remote", "val"]),
    mkLine(["│  ", "comment"], ["stack:    ", "key"], ["EKS, Lambda, Neo4j, SOC2, GitHub Actions", "string"]),
    mkLine(["", "blank"]),
    mkLine(["├─ ", "comment"], ["Hudle", "cmd"], ["                [", "comment"], ["Nov 2024 – Dec 2025", "string"], ["]", "comment"]),
    mkLine(["│  ", "comment"], ["role:     ", "key"], ["Senior DevOps Engineer · On-site", "val"]),
    mkLine(["│  ", "comment"], ["note:     ", "key"], ["Sole DevOps — full lifecycle ownership", "string"]),
    mkLine(["", "blank"]),
    mkLine(["├─ ", "comment"], ["Squareboat", "cmd"], ["           [", "comment"], ["Jul 2022 – Jul 2024", "string"], ["]", "comment"]),
    mkLine(["│  ", "comment"], ["role:     ", "key"], ["DevOps → Senior DevOps Engineer", "val"]),
    mkLine(["│  ", "comment"], ["stack:    ", "key"], ["AWS, Terraform, K8s, ELK", "string"]),
    mkLine(["", "blank"]),
    mkLine(["└─ ", "comment"], ["I2K2 Networks", "cmd"], ["        [", "comment"], ["Mar 2021 – Jun 2022", "string"], ["]", "comment"]),
    mkLine(["   ", "comment"], ["role:     ", "key"], ["Cloud Solutions Engineer", "val"]),
    mkLine(["   ", "comment"], ["stack:    ", "key"], ["AWS, Nginx, Apache, Docker, Terraform", "string"]),
    mkLine(["", "blank"]),
  ],
  "cat certs": () => [
    mkLine(["┌──────────────────────────────────────────┐", "comment"]),
    mkLine(["│  ", "comment"], ["name:   ", "key"], ["AWS Solutions Architect Associate   ", "val"], ["│", "comment"]),
    mkLine(["│  ", "comment"], ["code:   ", "key"], ["SAA-C03                            ", "string"], ["│", "comment"]),
    mkLine(["│  ", "comment"], ["issuer: ", "key"], ["Amazon Web Services                ", "val"], ["│", "comment"]),
    mkLine(["│  ", "comment"], ["status: ", "key"], ["✓ CERTIFIED                        ", "success"], ["│", "comment"]),
    mkLine(["└──────────────────────────────────────────┘", "comment"]),
    mkLine(["", "blank"]),
  ],
  contact: () => [
    mkLine(["email:    ", "key"], ["Harshdixit23mar@gmail.com", "string"]),
    mkLine(["github:   ", "key"], ["github.com/harsh785", "path"]),
    mkLine(["linkedin: ", "key"], ["linkedin.com/in/harsh-dixit-156a371b0", "path"]),
    mkLine(["", "blank"]),
  ],
  pwd: () => [
    mkLine(["/home/harsh/cloud/career", "path"]),
    mkLine(["", "blank"]),
  ],
  sudo: () => [
    mkLine(["harsh is not in the sudoers file. Nice try.", "error"]),
    mkLine(["", "blank"]),
  ],
  exit: () => [
    mkLine(["Not so fast. There's more to explore. 😄", "val"]),
    mkLine(["", "blank"]),
  ],
  ls: () => COMMANDS["ls skills"](),
};

const tokClass: Record<TokenType, string> = {
  prompt:  "tok-prompt",
  cmd:     "tok-cmd",
  key:     "tok-key",
  val:     "tok-val",
  comment: "tok-comment",
  string:  "tok-string",
  error:   "tok-error",
  success: "tok-success",
  number:  "tok-number",
  path:    "tok-path",
  blank:   "",
};

const INITIAL: Line[] = [
  mkLine(["# Welcome to harsh@devops:~$", "comment"]),
  mkLine(["# Type ", "comment"], ["help", "cmd"], [" to see available commands.", "comment"]),
  mkLine(["", "blank"]),
];

export default function InteractiveTerminal() {
  const [history, setHistory] = useState<Line[]>(INITIAL);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = body.scrollHeight;
  }, [history]);

  const run = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const inputLine: Line = mkLine(["$ ", "prompt"], [cmd, "cmd"]);

    if (trimmed === "clear") { setHistory(INITIAL); return; }

    const handler = COMMANDS[trimmed];
    const output: Line[] = handler
      ? handler()
      : [
          mkLine(["bash: ", "error"], [cmd, "cmd"], [": command not found. Type ", "val"], ["help", "cmd"], [" for commands.", "val"]),
          mkLine(["", "blank"]),
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
    <section className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#89dceb] text-sm font-mono mb-3">
            <Terminal size={14} />
            <span>try_me.sh</span>
          </div>
          <h2 className="text-4xl font-bold text-white cursor-blink">Explore Me Interactively</h2>
          <p className="text-slate-500 mt-2 font-mono text-sm">A real terminal. Type commands and discover.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={() => inputRef.current?.focus()}
          data-track
          className="cursor-text rounded-xl overflow-hidden shadow-2xl"
          style={{ boxShadow: "0 0 60px rgba(137,220,235,0.07), 0 25px 50px rgba(0,0,0,0.6)" }}
        >
          {/* Window chrome */}
          <div className="term-chrome px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 cursor-pointer transition-all" title="close" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 cursor-pointer transition-all" title="minimize" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 cursor-pointer transition-all" title="maximize" />
            <div className="flex-1 flex justify-center">
              <span className="text-slate-500 text-xs font-mono">harsh@devops — ~/cloud/career — bash</span>
            </div>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            className="glass p-5 h-80 overflow-y-auto font-mono text-sm"
            onWheel={(e) => e.stopPropagation()}
          >
            {history.map((line, i) => (
              <div key={i} className={`leading-6 whitespace-pre-wrap term-select rounded px-1 -mx-1 transition-all ${line.length === 1 && line[0].tok === "blank" ? "h-3" : ""}`}>
                {line.map((seg, j) =>
                  seg.tok === "blank" ? null : (
                    <span key={j} className={tokClass[seg.tok]}>{seg.text}</span>
                  )
                )}
              </div>
            ))}

            {/* Input row */}
            <div className="flex items-center gap-1 mt-1 tok-prompt">
              <span>$&nbsp;</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                className="flex-1 bg-transparent outline-none tok-cmd caret-[#89dceb]"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick command hints */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {["help", "whoami", "ls skills", "cat experience", "cat certs", "contact"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => { run(cmd); inputRef.current?.focus(); }}
              className="px-3 py-1 text-xs rounded-lg border border-white/5 text-slate-500 hover:border-[#89dceb]/30 hover:text-[#89dceb] hover:bg-[#89dceb]/5 transition-all font-mono"
              style={{ background: "rgba(30,30,46,0.6)" }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

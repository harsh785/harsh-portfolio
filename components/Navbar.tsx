"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Gamepad2 } from "lucide-react";
import GameSection from "./GameSection";
import HotWheelsGame from "./HotWheelsGame";
import ThemeToggle from "./ThemeToggle";

const links = ["About", "Experience", "Skills", "Achievements", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<"devops" | "hotwheels">("devops");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = gameOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [gameOpen]);

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0d0d14]/90 backdrop-blur-md border-b border-[#89dceb]/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="font-bold text-lg tracking-tight">
            <span className="text-[#89dceb]">&lt;</span>
            <span className="text-white">HD</span>
            <span className="text-[#89dceb]">/&gt;</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-sm text-slate-400 hover:text-[#89dceb] transition-colors duration-200 font-medium"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => { setGameOpen(true); setMenuOpen(false); }}
              className="text-sm flex items-center gap-1.5 text-[#39ff14] hover:text-[#39ff14]/70 transition-colors duration-200 font-medium"
            >
              <Gamepad2 size={14} />
              Game
            </button>
            <a
              href="/resume.pdf"
              target="_blank"
              className="text-sm px-4 py-2 rounded-lg border border-[#89dceb]/40 text-[#89dceb] hover:bg-[#89dceb]/10 transition-all duration-200 font-medium"
            >
              Resume
            </a>
            <ThemeToggle />
          </div>

          <button
            className="md:hidden text-slate-400 hover:text-[#89dceb]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0d0d14]/95 backdrop-blur-md flex flex-col items-center justify-center gap-8"
          >
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-2xl font-semibold text-slate-300 hover:text-[#89dceb] transition-colors"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => { setGameOpen(true); setMenuOpen(false); }}
              className="text-2xl font-semibold text-[#39ff14] hover:text-[#39ff14]/70 transition-colors flex items-center gap-2"
            >
              <Gamepad2 size={22} /> Game
            </button>
            <ThemeToggle />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game overlay */}
      <AnimatePresence>
        {gameOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0d0d14] flex flex-col"
          >
            {/* Game picker tab bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0d0d14]/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2 flex-1">
                {([
                  { id: "devops",    label: "🖥  Don't Let Prod Break", color: "#89dceb" },
                  { id: "hotwheels", label: "🏎  Hot Wheels Circuit",   color: "#e63946" },
                ] as const).map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGame(g.id)}
                    className="px-4 py-1.5 rounded-full text-xs font-mono border transition-all duration-200"
                    style={activeGame === g.id
                      ? { background: g.color, borderColor: g.color, color: "#000", fontWeight: 700 }
                      : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "#64748b" }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setGameOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all text-xs font-mono"
              >
                <X size={12} /> close
              </button>
            </div>

            {/* Game content */}
            <div className="flex-1 overflow-hidden">
              {activeGame === "devops"    && <GameSection />}
              {activeGame === "hotwheels" && <HotWheelsGame />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

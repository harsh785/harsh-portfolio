"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Gamepad2 } from "lucide-react";
import GameSection from "./GameSection";

const links = ["About", "Experience", "Skills", "Achievements", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

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
            ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#00d4ff]/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="font-bold text-lg tracking-tight">
            <span className="text-[#00d4ff]">&lt;</span>
            <span className="text-white">HD</span>
            <span className="text-[#00d4ff]">/&gt;</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-sm text-slate-400 hover:text-[#00d4ff] transition-colors duration-200 font-medium"
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
              className="text-sm px-4 py-2 rounded-lg border border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all duration-200 font-medium"
            >
              Resume
            </a>
          </div>

          <button
            className="md:hidden text-slate-400 hover:text-[#00d4ff]"
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
            className="fixed inset-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-md flex flex-col items-center justify-center gap-8"
          >
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-2xl font-semibold text-slate-300 hover:text-[#00d4ff] transition-colors"
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
            className="fixed inset-0 z-[60] bg-[#0a0a0f]"
          >
            <button
              onClick={() => setGameOpen(false)}
              className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm font-mono"
            >
              <X size={14} /> close
            </button>
            <GameSection />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

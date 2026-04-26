"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = ["About", "Experience", "Skills", "Achievements", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            <a
              href="/harsh-portfolio/resume.pdf"
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
            <ThemeToggle />
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

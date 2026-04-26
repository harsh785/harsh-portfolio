"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(!document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(next ? "dark" : "light");
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    /* update colorScheme so browser chrome matches */
    html.style.colorScheme = next ? "dark" : "light";
  };

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className="relative w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-200"
      style={{
        borderColor: dark ? "rgba(137,220,235,0.2)" : "rgba(4,165,229,0.2)",
        background: dark ? "rgba(137,220,235,0.05)" : "rgba(4,165,229,0.08)",
      }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait">
        {dark ? (
          <motion.span key="moon"
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={14} style={{ color: "#89dceb" }} />
          </motion.span>
        ) : (
          <motion.span key="sun"
            initial={{ opacity: 0, rotate: 30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={14} style={{ color: "#04a5e5" }} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

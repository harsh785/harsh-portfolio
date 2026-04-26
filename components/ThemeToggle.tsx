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
    html.style.colorScheme = next ? "dark" : "light";
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      className="relative w-8 h-8 flex items-center justify-center rounded-lg border transition-colors duration-300"
      style={{
        borderColor: dark ? "rgba(137,220,235,0.22)" : "rgba(101,123,131,0.28)",
        background:   dark ? "rgba(137,220,235,0.06)" : "rgba(101,123,131,0.10)",
      }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait">
        {dark ? (
          <motion.span key="moon"
            initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate:  40, scale: 0.6 }}
            transition={{ duration: 0.22 }}
            style={{ display: "flex" }}
          >
            <Moon size={14} style={{ color: "#89dceb" }} />
          </motion.span>
        ) : (
          <motion.span key="sun"
            initial={{ opacity: 0, rotate:  40, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate: -40, scale: 0.6 }}
            transition={{ duration: 0.22 }}
            style={{ display: "flex" }}
          >
            <Sun size={14} style={{ color: "#7dd3fc" }} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

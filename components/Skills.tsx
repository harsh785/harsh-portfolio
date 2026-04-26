"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ArrowUpRight } from "lucide-react";
import { skillWorlds, skillCategories, type SkillWorld } from "@/lib/skillWorlds";
import SkillWorldModal from "./SkillWorld";
import TiltCard from "./TiltCard";

function SkillCard({ skill, onClick }: { skill: SkillWorld; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <TiltCard intensity={10}>
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-left rounded-2xl p-5 border overflow-hidden group transition-all duration-300 cursor-pointer w-full"
      style={{
        background: hovered ? `${skill.color}10` : "rgba(30,30,46,0.5)",
        borderColor: hovered ? `${skill.color}40` : "rgba(255,255,255,0.05)",
        boxShadow: hovered ? `0 0 30px ${skill.color}15` : "none",
      }}
    >
      {/* Background glow blob */}
      <motion.div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: skill.color }}
        animate={{ opacity: hovered ? 0.15 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{skill.icon}</span>
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 4, y: hovered ? 0 : -4 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUpRight size={18} style={{ color: skill.color }} />
        </motion.div>
      </div>

      <h3 className="text-white font-bold text-sm mb-1 leading-tight">{skill.name}</h3>
      <p className="text-slate-500 text-xs mb-4 line-clamp-2">{skill.tagline}</p>

      <div className="flex items-center justify-between">
        <span
          className="text-xs px-2 py-0.5 rounded-full border font-mono"
          style={{
            color: skill.color + "cc",
            borderColor: skill.color + "25",
            background: skill.color + "10",
          }}
        >
          {skill.category}
        </span>
        <motion.span
          className="text-xs font-mono"
          style={{ color: skill.color }}
          animate={{ opacity: hovered ? 1 : 0 }}
        >
          explore →
        </motion.span>
      </div>
    </motion.button>
    </TiltCard>
  );
}

export default function Skills() {
  const [filter, setFilter] = useState("All");
  const [activeSkill, setActiveSkill] = useState<SkillWorld | null>(null);

  const filtered = filter === "All" ? skillWorlds : skillWorlds.filter((s) => s.category === filter);

  // Handle prev/next navigation from inside the modal
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const skill = skillWorlds.find((s) => s.id === e.detail);
      if (skill) setActiveSkill(skill);
    };
    window.addEventListener("skill-nav", handler as EventListener);
    return () => window.removeEventListener("skill-nav", handler as EventListener);
  }, []);

  return (
    <section id="skills" className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Code2 size={14} />
            <span>skills.universe</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Tech Universe</h2>
          <p className="text-slate-400 mt-2">Click any skill to enter its world and learn how I use it</p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {skillCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
              style={
                filter === cat
                  ? { background: "#00d4ff", color: "#000", borderColor: "#00d4ff" }
                  : { background: "transparent", color: "#64748b", borderColor: "rgba(255,255,255,0.08)" }
              }
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onClick={() => setActiveSkill(skill)} />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-slate-600 text-xs font-mono mt-8"
        >
          {skillWorlds.length} skills · click to explore each world
        </motion.p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeSkill && (
          <SkillWorldModal skill={activeSkill} onClose={() => setActiveSkill(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

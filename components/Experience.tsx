"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ChevronRight, Briefcase } from "lucide-react";
import { experiences } from "@/lib/data";

const companyColors = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#f43f5e"];

export default function Experience() {
  const [active, setActive] = useState(0);
  const exp = experiences[active];

  return (
    <section id="experience" className="py-24 px-6 bg-[#0d0d14] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Briefcase size={14} />
            <span>journey.log</span>
          </div>
          <h2 className="text-4xl font-bold text-white">The Journey</h2>
          <p className="text-slate-400 mt-2">5 years · 4 companies · countless deploys</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company selector */}
          <div className="space-y-3">
            {experiences.map((e, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActive(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                  active === i
                    ? "border-opacity-50 bg-[#1e1e2e]"
                    : "border-white/5 bg-[#1e1e2e]/30 hover:bg-[#1e1e2e]/60 hover:border-white/10"
                }`}
                style={active === i ? { borderColor: companyColors[i] + "60" } : {}}
              >
                <div className="flex items-center gap-3">
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300"
                    style={{
                      background: active === i ? companyColors[i] : "#334155",
                      boxShadow: active === i ? `0 0 10px ${companyColors[i]}` : "none",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{e.company}</p>
                    <p className="text-slate-500 text-xs truncate">{e.role}</p>
                  </div>
                  {active === i && (
                    <ChevronRight size={16} style={{ color: companyColors[i] }} />
                  )}
                </div>
                {active === i && (
                  <div className="mt-2 ml-6 text-xs font-mono" style={{ color: companyColors[i] + "aa" }}>
                    {e.duration}
                  </div>
                )}
              </motion.button>
            ))}

            {/* Journey stat */}
            <div className="mt-6 p-4 rounded-xl bg-[#1e1e2e]/30 border border-white/5">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Career Progress</p>
              <div className="flex gap-1">
                {experiences.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-500 cursor-pointer"
                    style={{ background: i <= active ? companyColors[i] : "#1e293b" }}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
              <p className="text-slate-400 text-xs mt-2">{active + 1} of {experiences.length} chapters</p>
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 30, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -30, filter: "blur(4px)" }}
                transition={{ duration: 0.35 }}
                className="h-full"
              >
                {/* Header */}
                <div
                  className="rounded-2xl p-6 mb-4 border"
                  style={{
                    background: `linear-gradient(135deg, ${companyColors[active]}08 0%, transparent 100%)`,
                    borderColor: companyColors[active] + "20",
                  }}
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                      style={{
                        background: companyColors[active] + "15",
                        border: `1px solid ${companyColors[active]}30`,
                        color: companyColors[active],
                      }}
                    >
                      {exp.company[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                        {exp.current && (
                          <span
                            className="px-2 py-0.5 text-xs rounded-full font-medium"
                            style={{ background: companyColors[active] + "20", color: companyColors[active], border: `1px solid ${companyColors[active]}30` }}
                          >
                            ● Current
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-lg mb-2" style={{ color: companyColors[active] }}>{exp.company}</p>
                      <div className="flex items-center gap-4 text-slate-400 text-sm flex-wrap">
                        <span className="flex items-center gap-1.5"><Calendar size={13} />{exp.duration}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={13} />{exp.location}</span>
                        <span className="text-slate-500">{exp.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="bg-[#1e1e2e]/50 border border-white/5 rounded-2xl p-6 mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Key Achievements</p>
                  <ul className="space-y-3">
                    {exp.highlights.map((h, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: j * 0.08 }}
                        className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed"
                      >
                        <span className="mt-1 flex-shrink-0 font-bold" style={{ color: companyColors[active] }}>▹</span>
                        {h}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill, j) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: j * 0.04 }}
                      className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200"
                      style={{
                        background: companyColors[active] + "10",
                        color: companyColors[active] + "cc",
                        border: `1px solid ${companyColors[active]}20`,
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

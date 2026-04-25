"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { experiences } from "@/lib/data";

export default function Experience() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Briefcase size={14} />
            <span>experience.json</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Work Experience</h2>
          <p className="text-slate-400 mt-2">4+ years building and scaling cloud infrastructure</p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00d4ff]/60 via-[#7c3aed]/40 to-transparent" />

          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-16"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 -translate-x-1/2 z-10 ${
                    exp.current
                      ? "bg-[#00d4ff] border-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.6)]"
                      : "bg-[#0a0a0f] border-[#7c3aed]"
                  }`}
                />

                <div
                  className="bg-[#1e1e2e]/60 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-[#00d4ff]/20 transition-all duration-300"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  {/* Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                          {exp.current && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20 font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[#00d4ff] font-semibold mb-2">{exp.company}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {exp.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {exp.location}
                          </span>
                          <span className="text-slate-500">{exp.type}</span>
                        </div>
                      </div>
                      <div className="text-slate-500 flex-shrink-0 mt-1">
                        {expanded === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Skills pills always visible */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs rounded-lg bg-[#00d4ff]/8 text-[#00d4ff]/80 border border-[#00d4ff]/10 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expandable highlights */}
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 border-t border-white/5 pt-4">
                          <ul className="space-y-3">
                            {exp.highlights.map((h, j) => (
                              <motion.li
                                key={j}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.05 }}
                                className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed"
                              >
                                <span className="text-[#00d4ff] mt-1 flex-shrink-0">▹</span>
                                {h}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

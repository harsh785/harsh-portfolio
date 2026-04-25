"use client";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { skills } from "@/lib/data";

const categoryIcons: Record<string, string> = {
  "Cloud & Infrastructure": "☁️",
  "Containers & Orchestration": "🐳",
  "CI/CD & DevOps": "⚙️",
  "Observability": "📊",
  "Databases": "🗄️",
  "Servers & Networking": "🌐",
};

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Code2 size={14} />
            <span>skills.config</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Tech Stack</h2>
          <p className="text-slate-400 mt-2">Tools and technologies I work with daily</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(skills).map(([category, items], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-[#1e1e2e]/60 border border-white/5 rounded-2xl p-6 hover:border-[#00d4ff]/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{categoryIcons[category]}</span>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  {category}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-xs rounded-lg bg-[#0a0a0f] border border-white/8 text-slate-300 font-medium hover:border-[#00d4ff]/30 hover:text-[#00d4ff] transition-all duration-200 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

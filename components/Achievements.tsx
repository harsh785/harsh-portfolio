"use client";
import { motion } from "framer-motion";
import { Trophy, GraduationCap, Award } from "lucide-react";
import { achievements, certifications, education } from "@/lib/data";

export default function Achievements() {
  return (
    <section id="achievements" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Trophy size={14} />
            <span>achievements.log</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Achievements & Certs</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#1e1e2e]/60 border border-white/5 rounded-2xl p-6 h-full hover:border-[#FF9900]/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <Award size={18} className="text-[#FF9900]" />
                <h3 className="font-semibold text-white">Certifications</h3>
              </div>
              {certifications.map((cert) => (
                <div key={cert.name} className="flex flex-col gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-2xl">
                    ☁️
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{cert.code}</p>
                    <p className="text-[#FF9900] font-semibold text-sm">{cert.name}</p>
                    <p className="text-slate-400 text-xs mt-1">{cert.issuer}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium inline-block w-fit">
                    Certified ✓
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Key Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {achievements.map((ach, i) => (
              <div
                key={i}
                className="bg-[#1e1e2e]/60 border border-white/5 rounded-2xl p-6 hover:border-[#00d4ff]/20 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center flex-shrink-0">
                    <Trophy size={18} className="text-[#00d4ff]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{ach.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{ach.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Education */}
            <div className="bg-[#1e1e2e]/60 border border-white/5 rounded-2xl p-6 hover:border-[#7c3aed]/20 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Education</p>
                  <h4 className="text-white font-bold">{education.degree}</h4>
                  <p className="text-[#7c3aed] text-sm font-medium">{education.institution}</p>
                  <p className="text-slate-500 text-xs mt-1">{education.year}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

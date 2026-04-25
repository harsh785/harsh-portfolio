"use client";
import { motion } from "framer-motion";
import { User, Cloud, Server, Shield } from "lucide-react";
import { personalInfo } from "@/lib/data";

const stats = [
  { label: "Years Experience", value: "4+" },
  { label: "AWS Services Mastered", value: "20+" },
  { label: "Pipelines Built", value: "50+" },
  { label: "Certifications", value: "AWS SAA" },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <User size={14} />
            <span>about.md</span>
          </div>
          <h2 className="text-4xl font-bold text-white">About Me</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-slate-300 leading-relaxed mb-6">
              {personalInfo.summary}
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              I specialize in designing and managing cloud-native infrastructure on AWS, automating deployments with Terraform and GitHub Actions, and building robust observability stacks. Currently driving cloud excellence at{" "}
              <span className="text-[#00d4ff] font-semibold">Caylent</span> as a Senior Cloud Engineer.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#1e1e2e]/60 border border-white/5 rounded-xl p-4 text-center hover:border-[#00d4ff]/20 transition-all duration-300"
                >
                  <div className="text-2xl font-bold text-[#00d4ff] mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {[
              {
                icon: Cloud,
                color: "#00d4ff",
                title: "Cloud Architecture",
                desc: "Designing scalable, highly available AWS infrastructure with a focus on cost optimization and security best practices.",
              },
              {
                icon: Server,
                color: "#7c3aed",
                title: "Infrastructure as Code",
                desc: "Writing clean, modular Terraform and CloudFormation to provision and manage infrastructure reproducibly.",
              },
              {
                icon: Shield,
                color: "#10b981",
                title: "Security & Compliance",
                desc: "Implementing SOC2-compliant environments with AWS Security Hub, CIS benchmarks, and least-privilege IAM.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 bg-[#1e1e2e]/60 border border-white/5 rounded-xl hover:border-white/10 transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}20` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

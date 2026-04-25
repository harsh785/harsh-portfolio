"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, GitBranch, ExternalLink, MapPin, Send, Copy, Check } from "lucide-react";
import { personalInfo } from "@/lib/data";

const contactItems = [
  { icon: Mail, label: "Email", value: personalInfo.email, href: `mailto:${personalInfo.email}`, color: "#00d4ff", copyable: true },
  { icon: Phone, label: "Phone", value: personalInfo.phone, href: `tel:${personalInfo.phone}`, color: "#7c3aed", copyable: true },
  { icon: MapPin, label: "Location", value: personalInfo.location, href: "#", color: "#10b981", copyable: false },
  { icon: GitBranch, label: "GitHub", value: "github.com/harsh785", href: personalInfo.github, color: "#f59e0b", copyable: true },
  { icon: ExternalLink, label: "LinkedIn", value: "linkedin.com/in/harshdixit", href: personalInfo.linkedin, color: "#0ea5e9", copyable: true },
];

function ContactItem({ icon: Icon, label, value, href, color, copyable }: typeof contactItems[0]) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 bg-[#1e1e2e]/60 border border-white/5 rounded-xl hover:border-white/15 transition-all duration-200 group"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}20` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-slate-300 text-sm group-hover:text-white transition-colors truncate">{value}</p>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/10"
          title="Copy to clipboard"
        >
          {copied
            ? <Check size={14} className="text-green-400" />
            : <Copy size={14} className="text-slate-400" />
          }
        </button>
      )}
    </a>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-[#0d0d14]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Send size={14} />
            <span>contact.sh</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Get In Touch</h2>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto">
            Open to new opportunities and interesting projects. Let&apos;s build something great together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {contactItems.map((item) => (
              <ContactItem key={item.label} {...item} />
            ))}
          </motion.div>

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#1e1e2e]/60 border border-white/5 rounded-2xl p-8 flex flex-col justify-between"
          >
            <div>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-3">Let&apos;s Work Together</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Whether you&apos;re looking to optimize your cloud infrastructure, set up CI/CD pipelines,
                or scale your DevOps operations — I&apos;m here to help make it happen.
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                {["Cloud Architecture & Migration", "CI/CD Pipeline Design", "Kubernetes & Container Orchestration", "Infrastructure as Code (Terraform)", "Observability & Monitoring"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="text-[#00d4ff]">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
            <a
              href={`mailto:${personalInfo.email}`}
              className="mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00d4ff] text-black font-semibold hover:bg-[#00bfea] transition-all duration-200 hover:scale-105"
            >
              <Mail size={16} />
              Send a Message
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-24 text-center text-slate-600 text-sm"
      >
        <p>Built with Next.js & ❤️ · {new Date().getFullYear()} Harsh Dixit</p>
      </motion.div>
    </section>
  );
}

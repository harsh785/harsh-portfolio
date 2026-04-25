"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Zap } from "lucide-react";

const categories = [
  {
    id: "cloud",
    label: "Cloud & IaC",
    color: "#FF9900",
    icon: "☁️",
    x: 50, y: 20,
    skills: [
      { name: "AWS", level: 95 },
      { name: "Terraform", level: 92 },
      { name: "CloudFormation", level: 85 },
      { name: "Ansible", level: 80 },
      { name: "EKS / Lambda / RDS", level: 90 },
    ],
  },
  {
    id: "containers",
    label: "Containers",
    color: "#2496ed",
    icon: "🐳",
    x: 15, y: 50,
    skills: [
      { name: "Docker", level: 95 },
      { name: "Kubernetes", level: 90 },
      { name: "ECS / ECR", level: 85 },
      { name: "Helm", level: 75 },
      { name: "Auto Scaling", level: 88 },
    ],
  },
  {
    id: "cicd",
    label: "CI/CD",
    color: "#00d4ff",
    icon: "⚙️",
    x: 85, y: 50,
    skills: [
      { name: "GitHub Actions", level: 95 },
      { name: "Jenkins", level: 88 },
      { name: "GitLab CI", level: 78 },
      { name: "Git", level: 98 },
    ],
  },
  {
    id: "observability",
    label: "Observability",
    color: "#f59e0b",
    icon: "📊",
    x: 20, y: 82,
    skills: [
      { name: "Prometheus", level: 88 },
      { name: "Grafana", level: 90 },
      { name: "Elasticsearch", level: 82 },
      { name: "Kibana", level: 80 },
      { name: "Sentry", level: 75 },
      { name: "CloudWatch", level: 92 },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    color: "#10b981",
    icon: "🗄️",
    x: 80, y: 82,
    skills: [
      { name: "MySQL", level: 85 },
      { name: "PostgreSQL", level: 82 },
      { name: "DynamoDB", level: 88 },
      { name: "ElastiCache", level: 78 },
      { name: "Neo4j", level: 70 },
    ],
  },
];

const connections = [
  ["cloud", "containers"],
  ["cloud", "cicd"],
  ["cloud", "observability"],
  ["cloud", "databases"],
  ["containers", "cicd"],
  ["containers", "observability"],
  ["cicd", "observability"],
];

function NodeConnections({ active }: { active: string | null }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {connections.map(([a, b]) => {
        const nodeA = categories.find((c) => c.id === a)!;
        const nodeB = categories.find((c) => c.id === b)!;
        const isHighlighted = active === a || active === b;
        return (
          <motion.line
            key={`${a}-${b}`}
            x1={`${nodeA.x}%`} y1={`${nodeA.y}%`}
            x2={`${nodeB.x}%`} y2={`${nodeB.y}%`}
            stroke={isHighlighted ? nodeA.color : "rgba(255,255,255,0.06)"}
            strokeWidth={isHighlighted ? 1.5 : 1}
            strokeDasharray={isHighlighted ? "none" : "4 4"}
            animate={{ opacity: isHighlighted ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </svg>
  );
}

export default function Skills() {
  const [active, setActive] = useState<string | null>(null);
  const activeCategory = categories.find((c) => c.id === active);

  return (
    <section id="skills" className="py-24 px-6 bg-[#0a0a0f] relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(0,212,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center"
        >
          <div className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-mono mb-3">
            <Code2 size={14} />
            <span>topology.map</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Tech Stack</h2>
          <p className="text-slate-400 mt-2">
            {active
              ? <>Viewing <span style={{ color: activeCategory?.color }}>{activeCategory?.label}</span> — click again to deselect</>
              : "Click any node to explore the stack"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Network map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[460px] w-full"
          >
            <NodeConnections active={active} />

            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActive(active === cat.id ? null : cat.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group"
                style={{ left: `${cat.x}%`, top: `${cat.y}%` }}
              >
                {/* Node */}
                <motion.div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl cursor-pointer"
                  animate={{
                    boxShadow: active === cat.id
                      ? `0 0 0 3px ${cat.color}, 0 0 30px ${cat.color}60`
                      : `0 0 0 1px ${cat.color}30, 0 0 15px ${cat.color}20`,
                    background: active === cat.id ? `${cat.color}20` : `${cat.color}10`,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {cat.icon}
                  {/* Pulse ring when active */}
                  {active === cat.id && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ border: `2px solid ${cat.color}` }}
                    />
                  )}
                </motion.div>
                {/* Label */}
                <span
                  className="text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded-full"
                  style={{
                    color: active === cat.id ? cat.color : "#94a3b8",
                    background: active === cat.id ? `${cat.color}15` : "transparent",
                  }}
                >
                  {cat.label}
                </span>
              </motion.button>
            ))}

            {/* Center hub */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.05)" }}
            >
              <Zap size={14} className="text-[#00d4ff]/40" />
            </div>
          </motion.div>

          {/* Detail panel */}
          <div className="h-[460px] flex items-center">
            <AnimatePresence mode="wait">
              {activeCategory ? (
                <motion.div
                  key={activeCategory.id}
                  initial={{ opacity: 0, x: 30, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -20, filter: "blur(6px)" }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div
                    className="rounded-2xl p-6 border"
                    style={{
                      background: `linear-gradient(135deg, ${activeCategory.color}08, transparent)`,
                      borderColor: `${activeCategory.color}25`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">{activeCategory.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{activeCategory.label}</h3>
                        <p className="text-xs font-mono" style={{ color: activeCategory.color }}>
                          {activeCategory.skills.length} technologies
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activeCategory.skills.map((skill, j) => (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.07 }}
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-slate-300 font-medium">{skill.name}</span>
                            <span className="text-xs font-mono" style={{ color: activeCategory.color }}>
                              {skill.level}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 0.8, delay: j * 0.07, ease: "easeOut" }}
                              style={{
                                background: `linear-gradient(90deg, ${activeCategory.color}80, ${activeCategory.color})`,
                                boxShadow: `0 0 8px ${activeCategory.color}60`,
                              }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center"
                >
                  <div className="text-slate-700 mb-4 text-6xl">🗺️</div>
                  <p className="text-slate-500 font-mono text-sm">← Select a node to explore</p>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActive(cat.id)}
                        className="flex items-center gap-2 p-3 rounded-xl border border-white/5 hover:border-white/10 text-left transition-all group"
                      >
                        <span>{cat.icon}</span>
                        <span className="text-slate-400 text-xs group-hover:text-slate-200 transition-colors">
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

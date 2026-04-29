"use client";

import styles from "./CapabilitiesGrid.module.css";

const CAPABILITIES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
      </svg>
    ),
    title: "AI Orchestrator",
    description: "Claude-powered brain that breaks your request into actionable steps, selects tools, and builds the full pipeline.",
    accent: "var(--accent-primary)",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
    title: "Code Generation",
    description: "Generates production-grade Python and Node.js code with error handling, logging, and retry logic built in.",
    accent: "var(--accent-cyan)",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8l3 3-3 3M12 14h4" />
      </svg>
    ),
    title: "Sandboxed Execution",
    description: "Every automation runs in an isolated Docker container. Safe, auditable, and fully logged.",
    accent: "var(--accent-emerald)",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "250+ Tool Connectors",
    description: "Email, Slack, databases, CRMs, spreadsheets, PDF parsers, browser automation — all pre-built and ready.",
    accent: "var(--accent-amber)",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Self-Evaluation",
    description: "A secondary AI agent grades every run, catches errors before they reach production, and auto-patches failures.",
    accent: "var(--accent-rose)",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M3 12h18M5.63 5.63l12.73 12.73M18.36 5.63L5.63 18.36" />
      </svg>
    ),
    title: "Pattern Memory",
    description: "Every automation enriches a vector database. New requests match past patterns to build faster and smarter.",
    accent: "var(--accent-violet)",
  },
];

export default function CapabilitiesGrid() {
  return (
    <section className={styles.section} id="capabilities">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Architecture</span>
        <h2 className={styles.title}>Four Layers of Intelligence</h2>
        <p className={styles.subtitle}>
          Not just a chatbot. A full execution engine with orchestration,
          code generation, tool integration, and self-improvement.
        </p>
      </div>

      <div className={styles.grid}>
        {CAPABILITIES.map((cap, i) => (
          <div
            key={i}
            className={styles.card}
            style={{ "--cap-accent": cap.accent, animationDelay: `${i * 80}ms` }}
          >
            <div className={styles.iconWrap}>{cap.icon}</div>
            <h3 className={styles.cardTitle}>{cap.title}</h3>
            <p className={styles.cardDesc}>{cap.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

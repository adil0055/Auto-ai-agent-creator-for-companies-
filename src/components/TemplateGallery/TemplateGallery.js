"use client";

import styles from "./TemplateGallery.module.css";

const TEMPLATES = [
  {
    id: "invoice",
    icon: "IN",
    title: "Invoice Approval",
    description: "Auto-process invoices: extract data, check thresholds, route for approval, notify stakeholders.",
    prompt: "Automate invoice approval: parse PDF invoices, extract amount and vendor, auto-approve under $5000, flag others for manager review, send Slack notifications.",
    category: "Finance",
    color: "var(--accent-primary)",
    tools: ["PDF Parser", "Database", "Slack API"],
    difficulty: "Medium",
  },
  {
    id: "email",
    icon: "EM",
    title: "Email Triage & Auto-Reply",
    description: "Categorize inbound emails, generate contextual responses, escalate urgent items.",
    prompt: "Automate email triage: categorize incoming customer emails into billing/support/sales, auto-reply to common questions, escalate urgent items to the team lead.",
    category: "Support",
    color: "var(--accent-cyan)",
    tools: ["Email API", "AI Classification", "Database"],
    difficulty: "Medium",
  },
  {
    id: "data-sync",
    icon: "DS",
    title: "Data Sync Pipeline",
    description: "Sync data between systems on schedule. Detect changes, transform schemas, resolve conflicts.",
    prompt: "Create a data sync pipeline: every hour, pull new orders from Shopify, transform to our schema, upsert into PostgreSQL, log any conflicts for review.",
    category: "Integration",
    color: "var(--accent-emerald)",
    tools: ["HTTP API", "Database", "Scheduler"],
    difficulty: "Low",
  },
  {
    id: "report",
    icon: "RP",
    title: "Report Generator",
    description: "Compile data from multiple sources into formatted PDF/Excel reports on schedule.",
    prompt: "Generate weekly sales report: query database for this week's orders, calculate totals by region and product, create a formatted summary with charts, email to leadership.",
    category: "Analytics",
    color: "var(--accent-amber)",
    tools: ["Database", "PDF Generator", "Email API"],
    difficulty: "Medium",
  },
  {
    id: "lead-scoring",
    icon: "LS",
    title: "Lead Scoring & Routing",
    description: "Score incoming leads based on criteria, enrich data, assign to sales reps automatically.",
    prompt: "Automate lead scoring: when a new form submission arrives, score based on company size, industry, and engagement, enrich with Clearbit data, assign to appropriate sales rep in CRM.",
    category: "Sales",
    color: "var(--accent-rose)",
    tools: ["CRM API", "HTTP API", "Database"],
    difficulty: "High",
  },
  {
    id: "onboarding",
    icon: "HR",
    title: "Employee Onboarding",
    description: "Collect documents, create accounts, assign training, notify teams for new hires.",
    prompt: "Automate employee onboarding: collect required documents via form, create accounts in Google Workspace and Slack, assign training modules, notify the team lead and IT.",
    category: "HR",
    color: "var(--accent-violet)",
    tools: ["Email API", "Slack API", "Forms"],
    difficulty: "Medium",
  },
];

const DIFFICULTY_COLORS = {
  Low: "var(--accent-emerald)",
  Medium: "var(--accent-amber)",
  High: "var(--accent-rose)",
};

export default function TemplateGallery({ onSelect }) {
  return (
    <section className={styles.section} id="templates">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Templates</span>
        <h2 className={styles.title}>Start From a Blueprint</h2>
        <p className={styles.subtitle}>
          Pre-built automation patterns for the most common workflows. Click to
          customize and deploy.
        </p>
      </div>

      <div className={styles.grid}>
        {TEMPLATES.map((template, i) => (
          <button
            key={template.id}
            className={styles.card}
            onClick={() => onSelect(template)}
            style={{ "--card-accent": template.color, animationDelay: `${i * 60}ms` }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>{template.icon}</span>
              <span
                className={styles.cardCategory}
                style={{ color: template.color }}
              >
                {template.category}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{template.title}</h3>
            <p className={styles.cardDescription}>{template.description}</p>

            <div className={styles.cardMeta}>
              <div className={styles.tools}>
                {template.tools.map((tool, j) => (
                  <span key={j} className={styles.tool}>{tool}</span>
                ))}
              </div>
              <span
                className={styles.difficulty}
                style={{ color: DIFFICULTY_COLORS[template.difficulty] }}
              >
                {template.difficulty}
              </span>
            </div>

            <div className={styles.cardArrow}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

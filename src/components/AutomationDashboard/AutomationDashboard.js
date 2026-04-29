"use client";

import { forwardRef, useState } from "react";
import styles from "./AutomationDashboard.module.css";

const STATUS_CONFIG = {
  active: { color: "var(--status-success)", label: "Active", icon: "●" },
  paused: { color: "var(--status-warning)", label: "Paused", icon: "◆" },
  error: { color: "var(--status-error)", label: "Error", icon: "▲" },
  building: { color: "var(--status-running)", label: "Building", icon: "◎" },
};

const AutomationDashboard = forwardRef(function AutomationDashboard(
  { automations, onDelete, onNewAutomation, onRunAutomation },
  ref
) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? automations : automations.filter((a) => a.status === filter);

  const formatDate = (iso) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div ref={ref} className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Automation Dashboard</h1>
          <p className={styles.subtitle}>
            {automations.length} automation{automations.length !== 1 ? "s" : ""} deployed
          </p>
        </div>
        <button className={styles.newBtn} onClick={onNewAutomation}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Automation
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {["all", "active", "paused", "error"].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : STATUS_CONFIG[f]?.label}
            {f === "all" && <span className={styles.filterCount}>{automations.length}</span>}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {automations.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
              <path d="M7 8l3 3-3 3M12 14h4" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No automations yet</h3>
          <p className={styles.emptyDesc}>
            Type a prompt or pick a template to create your first AI worker.
          </p>
          <button className={styles.emptyCta} onClick={onNewAutomation}>
            Create Your First Automation
          </button>
        </div>
      ) : (
        /* Automation list */
        <div className={styles.list}>
          {filtered.map((auto, i) => {
            const expanded = expandedId === auto.id;
            const status = STATUS_CONFIG[auto.status] || STATUS_CONFIG.active;

            return (
              <div
                key={auto.id}
                className={`${styles.card} ${expanded ? styles.expanded : ""}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className={styles.cardMain}
                  onClick={() => setExpandedId(expanded ? null : auto.id)}
                >
                  <div className={styles.cardLeft}>
                    <span
                      className={styles.statusIndicator}
                      style={{ color: status.color }}
                    >
                      {status.icon}
                    </span>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>{auto.name}</h3>
                      <div className={styles.cardMeta}>
                        <span>{auto.tools?.length || 0} tools</span>
                        <span>·</span>
                        <span>{auto.steps?.length || 0} steps</span>
                        <span>·</span>
                        <span>Created {formatDate(auto.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardRight}>
                    <div className={styles.cardStats}>
                      <div className={styles.miniStat}>
                        <span className={styles.miniStatVal}>{auto.runs || 0}</span>
                        <span className={styles.miniStatLabel}>Runs</span>
                      </div>
                      <div className={styles.miniStat}>
                        <span className={styles.miniStatVal}>{auto.successRate || 100}%</span>
                        <span className={styles.miniStatLabel}>Success</span>
                      </div>
                      <div className={styles.miniStat}>
                        <span className={styles.miniStatVal}>{auto.avgTime || "—"}s</span>
                        <span className={styles.miniStatLabel}>Avg</span>
                      </div>
                    </div>
                    <svg
                      className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {expanded && (
                  <div className={styles.cardExpanded}>
                    {/* Tools */}
                    <div className={styles.expandSection}>
                      <h4 className={styles.expandLabel}>Tools</h4>
                      <div className={styles.expandTools}>
                        {auto.tools?.map((tool, j) => (
                          <span key={j} className={styles.expandTool}>{tool}</span>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div className={styles.expandSection}>
                      <h4 className={styles.expandLabel}>Execution Steps</h4>
                      {auto.steps?.map((step, j) => (
                        <div key={j} className={styles.expandStep}>
                          <span className={styles.expandStepNum}>{j + 1}</span>
                          <span>{step.action}</span>
                        </div>
                      ))}
                    </div>

                    {/* Code preview */}
                    {auto.code && (
                      <div className={styles.expandSection}>
                        <h4 className={styles.expandLabel}>Generated Code</h4>
                        <pre className={styles.expandCode}>
                          <code>{auto.code.slice(0, 600)}{auto.code.length > 600 ? "\n..." : ""}</code>
                        </pre>
                      </div>
                    )}

                    {/* Actions */}
                    <div className={styles.expandActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.actionRun}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRunAutomation) onRunAutomation(auto);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Run Now
                      </button>
                      <button className={styles.actionBtn}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        Pause
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionDanger}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(auto.id);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default AutomationDashboard;

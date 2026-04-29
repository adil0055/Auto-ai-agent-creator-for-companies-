"use client";

import styles from "./StatsBar.module.css";

export default function StatsBar({ automations }) {
  const totalRuns = automations.reduce((sum, a) => sum + (a.runs || 0), 0);
  const avgTime = automations.length > 0
    ? Math.round(automations.reduce((sum, a) => sum + (a.avgTime || 2.4), 0) / automations.length * 10) / 10
    : 0;
  const successRate = automations.length > 0
    ? Math.round(automations.reduce((sum, a) => sum + (a.successRate || 98), 0) / automations.length)
    : 0;

  if (automations.length === 0) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.stat}>
          <div className={styles.statIcon + " " + styles.iconPurple}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 8h8M8 4v8" />
              <rect x="1" y="1" width="14" height="14" rx="3" />
            </svg>
          </div>
          <div>
            <span className={styles.statValue}>{automations.length}</span>
            <span className={styles.statLabel}>Automations</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <div className={styles.statIcon + " " + styles.iconCyan}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12l4-4 3 3 7-7" />
            </svg>
          </div>
          <div>
            <span className={styles.statValue}>{totalRuns}</span>
            <span className={styles.statLabel}>Total Runs</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <div className={styles.statIcon + " " + styles.iconGreen}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" />
              <path d="M5 8l2 2 4-4" />
            </svg>
          </div>
          <div>
            <span className={styles.statValue}>{successRate}%</span>
            <span className={styles.statLabel}>Success Rate</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <div className={styles.statIcon + " " + styles.iconAmber}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" />
              <path d="M8 4v4l3 2" />
            </svg>
          </div>
          <div>
            <span className={styles.statValue}>{avgTime}s</span>
            <span className={styles.statLabel}>Avg Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}

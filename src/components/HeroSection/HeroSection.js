"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const titleRef = useRef(null);

  useEffect(() => {
    // Animate gradient text on mount
    const el = titleRef.current;
    if (el) {
      el.classList.add(styles.visible);
    }
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        {/* Tiny badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>AI-Powered Automation Engine</span>
        </div>

        {/* Main title */}
        <h1 ref={titleRef} className={styles.title}>
          <span className={styles.line1}>Describe the Job.</span>
          <span className={styles.line2}>
            We Build the{" "}
            <span className={styles.gradient}>Worker.</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          Type what you want automated in plain English. Our AI orchestrator
          analyzes, plans, generates code, and deploys autonomous workers —
          all in seconds.
        </p>

        {/* Metrics */}
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>250+</span>
            <span className={styles.metricLabel}>Tool Connectors</span>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <span className={styles.metricValue}>&lt; 30s</span>
            <span className={styles.metricLabel}>Build Time</span>
          </div>
          <div className={styles.metricDivider} />
          <div className={styles.metric}>
            <span className={styles.metricValue}>99.7%</span>
            <span className={styles.metricLabel}>Success Rate</span>
          </div>
        </div>
      </div>
    </section>
  );
}

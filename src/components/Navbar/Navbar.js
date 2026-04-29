"use client";

import styles from "./Navbar.module.css";

export default function Navbar({ activeView, onViewChange, automationCount, serverConnected }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => onViewChange("home")}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="#6366F1" opacity="0.9" />
              <rect x="16" y="2" width="10" height="10" rx="2" fill="#22D3EE" opacity="0.7" />
              <rect x="2" y="16" width="10" height="10" rx="2" fill="#A78BFA" opacity="0.7" />
              <rect x="16" y="16" width="10" height="10" rx="2" fill="#34D399" opacity="0.7" />
              <circle cx="14" cy="14" r="3" fill="white" />
            </svg>
          </div>
          <span className={styles.logoText}>
            Automation<span className={styles.logoAccent}>Factory</span>
          </span>
        </div>

        {/* Nav Links */}
        <div className={styles.navLinks}>
          <button
            className={`${styles.navLink} ${activeView === "home" ? styles.active : ""}`}
            onClick={() => onViewChange("home")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 6l6-4 6 4v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z" />
              <path d="M6 14V9h4v5" />
            </svg>
            Home
          </button>
          <button
            className={`${styles.navLink} ${activeView === "dashboard" ? styles.active : ""}`}
            onClick={() => onViewChange("dashboard")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
            Dashboard
            {automationCount > 0 && (
              <span className={styles.badge}>{automationCount}</span>
            )}
          </button>
        </div>

        {/* Right side */}
        <div className={styles.navRight}>
          {serverConnected && (
            <div className={styles.statusDot}>
              <span className={styles.dotPulse} style={{ background: "var(--accent-primary)" }} />
              <span className={styles.statusText}>Gemma 4</span>
            </div>
          )}
          <div className={styles.statusDot}>
            <span className={styles.dotPulse} />
            <span className={styles.statusText}>{serverConnected ? "Online" : "Offline Mode"}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="2" fill="#6366F1" opacity="0.9" />
                <rect x="16" y="2" width="10" height="10" rx="2" fill="#22D3EE" opacity="0.7" />
                <rect x="2" y="16" width="10" height="10" rx="2" fill="#A78BFA" opacity="0.7" />
                <rect x="16" y="16" width="10" height="10" rx="2" fill="#34D399" opacity="0.7" />
                <circle cx="14" cy="14" r="3" fill="white" />
              </svg>
              <span>AutomationFactory</span>
            </div>
            <p className={styles.brandDesc}>
              AI-powered automation engine. Describe. Build. Deploy.
            </p>
          </div>

          <div className={styles.columns}>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Product</h4>
              <a className={styles.link} href="#templates">Templates</a>
              <a className={styles.link} href="#capabilities">Architecture</a>
              <a className={styles.link} href="#">API Docs</a>
              <a className={styles.link} href="#">Pricing</a>
            </div>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Integrations</h4>
              <a className={styles.link} href="#">Slack</a>
              <a className={styles.link} href="#">Gmail</a>
              <a className={styles.link} href="#">PostgreSQL</a>
              <a className={styles.link} href="#">Shopify</a>
            </div>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Company</h4>
              <a className={styles.link} href="#">About</a>
              <a className={styles.link} href="#">Blog</a>
              <a className={styles.link} href="#">Careers</a>
              <a className={styles.link} href="#">Contact</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} Automation Factory. All rights reserved.
          </span>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./PromptBox.module.css";

const SUGGESTIONS = [
  "Automate invoice approval when amount < $5,000",
  "Triage customer support emails and auto-reply to common questions",
  "Sync Shopify orders to Google Sheets every hour",
  "Generate weekly sales report PDF from database",
  "Route new leads from website form to CRM with scoring",
  "Monitor RSS feeds and post summaries to Slack",
];

export default function PromptBox({ onSubmit }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const textareaRef = useRef(null);

  // Rotate placeholder suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setValue(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <section className={styles.section}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div
          className={`${styles.promptContainer} ${focused ? styles.focused : ""} ${value ? styles.hasValue : ""}`}
        >
          {/* Glow border effect */}
          <div className={styles.glowBorder} />

          <div className={styles.inputRow}>
            {/* AI icon */}
            <div className={styles.aiIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <textarea
              ref={textareaRef}
              id="prompt-input"
              className={styles.textarea}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={SUGGESTIONS[currentSuggestion]}
              rows={1}
            />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!value.trim()}
              aria-label="Build automation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Bottom hint */}
          <div className={styles.hint}>
            <kbd className={styles.kbd}>Enter</kbd> to build
            <span className={styles.hintDivider}>·</span>
            <kbd className={styles.kbd}>Shift + Enter</kbd> for new line
          </div>
        </div>
      </form>

      {/* Quick suggestions */}
      <div className={styles.suggestions}>
        <span className={styles.suggestionsLabel}>Try:</span>
        <div className={styles.suggestionTags}>
          {SUGGESTIONS.slice(0, 4).map((s, i) => (
            <button
              key={i}
              type="button"
              className={styles.suggestionTag}
              onClick={() => handleSuggestionClick(s)}
            >
              {s.length > 50 ? s.slice(0, 50) + "…" : s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

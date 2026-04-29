"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import styles from "./ExecutionViewer.module.css";

const TOOL_MAP = {
  email: { name: "Email API", icon: "EM", color: "#000000" },
  database: { name: "PostgreSQL", icon: "DB", color: "#000000" },
  pdf: { name: "PDF Parser", icon: "IN", color: "#000000" },
  slack: { name: "Slack API", icon: "SL", color: "#000000" },
  http: { name: "HTTP Client", icon: "HT", color: "#000000" },
  scheduler: { name: "Scheduler", icon: "CR", color: "#000000" },
  ai: { name: "AI Classifier", icon: "AI", color: "#000000" },
  sheets: { name: "Spreadsheet", icon: "SH", color: "#000000" },
  crm: { name: "CRM API", icon: "CR", color: "#000000" },
  browser: { name: "Browser", icon: "BW", color: "#000000" },
};

// Simulated output data per tool
const MOCK_OUTPUTS = {
  email: [
    "Found 3 new messages in inbox",
    "Email from vendor@company.com received",
    "Message parsed: subject, sender, attachments extracted",
  ],
  pdf: [
    "Extracted text from 2-page PDF document",
    "Invoice #INV-2026-4821 | Vendor: Acme Corp | Amount: $3,450.00",
    "OCR confidence: 98.7% | All fields extracted successfully",
  ],
  ai: [
    "Classification: APPROVED (below $5,000 threshold)",
    "Confidence score: 0.96 | Decision: auto-approve",
    "Sentiment analysis: neutral | Priority: standard",
  ],
  slack: [
    'Notification sent to #approvals channel',
    "Message delivered to @john.manager",
    "Approval request posted with action buttons",
  ],
  database: [
    "INSERT INTO automations (id, status) VALUES (uuid, 'completed')",
    "Query executed: 1 row affected (2ms)",
    "Record stored: ID af-run-48291 | Status: success",
  ],
  http: [
    "GET https://api.example.com/data → 200 OK (145ms)",
    "Response: 47 records fetched | ETag: W/\"abc123\"",
    "POST webhook triggered → 201 Created",
  ],
  scheduler: [
    "Cron job registered: */60 * * * * (every hour)",
    "Next execution: 2026-04-17T01:00:00Z",
    "Schedule active | Timezone: UTC",
  ],
  sheets: [
    "Spreadsheet updated: 12 rows added to 'Sales Q2' tab",
    "Formatting applied: currency, date, conditional colors",
    "Report generated: weekly_sales_2026-04-17.xlsx",
  ],
  crm: [
    "Contact created: lead-8472 | Company: TechCorp Inc.",
    "Lead score: 85/100 | Assigned to: Sarah (West Region)",
    "Deal pipeline updated: $25,000 opportunity added",
  ],
  browser: [
    "Navigated to https://portal.example.com/dashboard",
    "Form filled: 6 fields populated | Submit clicked",
    "Screenshot captured | Data scraped: 15 records",
  ],
};

export default function ExecutionViewer({ automation, onClose, onRunComplete }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime] = useState(Date.now());
  const logsEndRef = useRef(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTotalTime((Date.now() - startTime) / 1000);
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const hasTriggeredRef = useRef(false);

  // Real Execution via WebSocket
  useEffect(() => {
    if (!automation?.steps) return;

    let isActive = true;
    let currentRunId = null;
    
    const steps = automation.steps;
    const statuses = steps.map(() => "pending");
    setStepStatuses(statuses);

    addLog("system", "> Automation execution queued for real production worker...");
    addLog("system", `Running: ${automation.name}`);
    addLog("system", `Steps: ${steps.length} | Tools: ${automation.tools?.length || 0}`);

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");

    const startExecution = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/automations/${automation.id}/run`;
        const response = await fetch(url, { method: "POST" });
        if (!response.ok) {
          throw new Error("Failed to start run");
        }
        const data = await response.json();
        currentRunId = data.runId;
        
        if (isActive) {
          setStepStatuses(steps.map(() => "running"));
        }
      } catch (err) {
        if (isActive) {
          addLog("error", `Failed to trigger execution: ${err.message}`);
          setStepStatuses(steps.map(() => "error"));
        }
      }
    };

    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      startExecution();
    } else {
      // Set to running if we already triggered it previously in strict mode
      setStepStatuses(steps.map(() => "running"));
    }

    socket.on("run:log", ({ runId, log }) => {
      if (currentRunId && runId !== currentRunId) return;
      // Map sandbox log types to UI log types
      addLog(log.type === "info" ? "detail" : log.type, log.message);
    });

    socket.on("run:complete", ({ runId, result }) => {
      if (currentRunId && runId !== currentRunId) return;
      clearInterval(timerRef.current);
      if (isActive) {
        setIsComplete(true);
        setStepStatuses(steps.map(() => "completed"));
        
        addLog("success", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        addLog("success", `• Automation executed in isolated container`);
        addLog("success", `Total execution time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
        
        if (result.success) {
           addLog("success", `Result: ${JSON.stringify(result.result)}`);
        } else {
           addLog("error", `Error: ${result.error}`);
        }

        if (onRunComplete) onRunComplete();
      }
      socket.disconnect();
    });

    return () => {
      isActive = false;
      socket.disconnect();
    };
  }, [automation]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type, message) => {
    setLogs((prev) => [
      ...prev,
      {
        type,
        message,
        time: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 1,
        }),
      },
    ]);
  };

  const completedSteps = stepStatuses.filter((s) => s === "completed").length;
  const progress = automation?.steps
    ? (completedSteps / automation.steps.length) * 100
    : 0;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`${styles.headerIcon} ${isComplete ? styles.iconDone : styles.iconRunning}`}>
              {isComplete ? "OK" : "RUN"}
            </div>
            <div>
              <h2 className={styles.headerTitle}>
                {isComplete ? "Execution Complete" : "Running Automation"}
              </h2>
              <p className={styles.headerSub}>{automation?.name}</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.timer}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {totalTime.toFixed(1)}s
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${isComplete ? styles.progressDone : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {completedSteps}/{automation?.steps?.length || 0} steps
          </span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Steps timeline */}
          <div className={styles.stepsPanel}>
            <h4 className={styles.panelTitle}>Execution Pipeline</h4>
            <div className={styles.timeline}>
              {automation?.steps?.map((step, i) => {
                const status = stepStatuses[i] || "pending";
                const tool = TOOL_MAP[step.tool] || { name: step.tool, icon: "UN", color: "#000000" };
                return (
                  <div key={i} className={`${styles.timelineStep} ${styles[`step_${status}`]}`}>
                    <div className={styles.timelineConnector}>
                      <div className={styles.timelineDot}>
                        {status === "completed" ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        ) : status === "running" ? (
                          <div className={styles.spinner} />
                        ) : (
                          <span className={styles.stepNum}>{i + 1}</span>
                        )}
                      </div>
                      {i < automation.steps.length - 1 && <div className={styles.timelineLine} />}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <span className={styles.toolBadge} style={{ "--badge-color": tool.color }}>
                          {tool.icon} {tool.name}
                        </span>
                      </div>
                      <p className={styles.timelineAction}>{step.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live logs */}
          <div className={styles.logsPanel}>
            <h4 className={styles.panelTitle}>Live Output</h4>
            <div className={styles.logsList}>
              {logs.map((log, i) => (
                <div key={i} className={`${styles.logEntry} ${styles[`log_${log.type}`]}`}>
                  <span className={styles.logTime}>{log.time}</span>
                  <span className={styles.logMsg}>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Footer */}
        {isComplete && (
          <div className={styles.footer}>
            <div className={styles.footerStats}>
              <span className={styles.footerStat}>
                <span className={styles.footerStatIcon}>✓</span>
                {completedSteps} steps passed
              </span>
              <span className={styles.footerStat}>
                <span className={styles.footerStatIcon}>⏱</span>
                {totalTime.toFixed(1)}s total
              </span>
              <span className={styles.footerStat}>
                <span className={styles.footerStatIcon}>•</span>
                100% success
              </span>
            </div>
            <button className={styles.doneBtn} onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

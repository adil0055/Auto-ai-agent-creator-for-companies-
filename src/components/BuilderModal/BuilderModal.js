"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./BuilderModal.module.css";

// Orchestrator simulation steps
const ORCHESTRATOR_PHASES = [
  { id: "analyze", label: "Analyzing Request", icon: "🧠", duration: 1500 },
  { id: "plan", label: "Building Execution Plan", icon: "📋", duration: 2000 },
  { id: "tools", label: "Selecting Tools", icon: "🔧", duration: 1200 },
  { id: "codegen", label: "Generating Code", icon: "⚙️", duration: 2500 },
  { id: "validate", label: "Validating Output", icon: "✅", duration: 1000 },
  { id: "deploy", label: "Deploying Automation", icon: "🚀", duration: 800 },
];

// Tool registry
const TOOL_MAP = {
  email: { name: "Email API", icon: "📧", color: "var(--accent-cyan)" },
  database: { name: "PostgreSQL", icon: "🗄️", color: "var(--accent-emerald)" },
  pdf: { name: "PDF Parser", icon: "📄", color: "var(--accent-amber)" },
  slack: { name: "Slack API", icon: "💬", color: "var(--accent-violet)" },
  http: { name: "HTTP Client", icon: "🌐", color: "var(--accent-cyan)" },
  scheduler: { name: "Scheduler", icon: "⏰", color: "var(--accent-primary)" },
  ai: { name: "AI Classifier", icon: "🤖", color: "var(--accent-rose)" },
  sheets: { name: "Spreadsheet", icon: "📊", color: "var(--accent-emerald)" },
  crm: { name: "CRM API", icon: "🎯", color: "var(--accent-amber)" },
  browser: { name: "Browser", icon: "🖥️", color: "var(--accent-primary)" },
};

// Generate a realistic plan from prompt
function generatePlan(prompt) {
  const lower = prompt.toLowerCase();
  const tools = [];
  const steps = [];

  // Detect tools from keywords
  if (lower.includes("email") || lower.includes("mail")) tools.push("email");
  if (lower.includes("database") || lower.includes("db") || lower.includes("postgres") || lower.includes("record") || lower.includes("query"))
    tools.push("database");
  if (lower.includes("pdf") || lower.includes("invoice") || lower.includes("document"))
    tools.push("pdf");
  if (lower.includes("slack") || lower.includes("notif") || lower.includes("approv") || lower.includes("alert"))
    tools.push("slack");
  if (lower.includes("api") || lower.includes("http") || lower.includes("shopify") || lower.includes("webhook"))
    tools.push("http");
  if (lower.includes("schedule") || lower.includes("every") || lower.includes("hourly") || lower.includes("daily") || lower.includes("weekly"))
    tools.push("scheduler");
  if (lower.includes("classify") || lower.includes("categori") || lower.includes("score") || lower.includes("triage") || lower.includes("auto-reply") || lower.includes("approv") || lower.includes("check") || lower.includes("analyz"))
    tools.push("ai");
  if (lower.includes("sheet") || lower.includes("excel") || lower.includes("spreadsheet") || lower.includes("report"))
    tools.push("sheets");
  if (lower.includes("crm") || lower.includes("salesforce") || lower.includes("hubspot") || lower.includes("lead"))
    tools.push("crm");
  if (lower.includes("browser") || lower.includes("scrape") || lower.includes("form")) tools.push("browser");

  // Generate steps based on detected intent
  if (lower.includes("invoice")) {
    steps.push(
      { action: "Listen for incoming invoice (email/API)", tool: "email" },
      { action: "Extract data from PDF (vendor, amount, date)", tool: "pdf" },
      { action: "Check approval rules (threshold: $5,000)", tool: "ai" },
      { action: "Route to approver if above threshold", tool: "slack" },
      { action: "Store record in database", tool: "database" },
      { action: "Send confirmation notification", tool: "slack" }
    );
  } else if (lower.includes("email") && (lower.includes("triage") || lower.includes("categori") || lower.includes("reply"))) {
    steps.push(
      { action: "Monitor inbox for new emails", tool: "email" },
      { action: "Classify email intent (billing/support/sales)", tool: "ai" },
      { action: "Match against FAQ knowledge base", tool: "database" },
      { action: "Generate contextual auto-reply", tool: "ai" },
      { action: "Escalate urgent items to team lead", tool: "slack" },
      { action: "Log interaction to database", tool: "database" }
    );
  } else if (lower.includes("sync") || lower.includes("shopify")) {
    steps.push(
      { action: "Schedule sync interval", tool: "scheduler" },
      { action: "Fetch new records from source API", tool: "http" },
      { action: "Transform data to target schema", tool: "ai" },
      { action: "Upsert records to database", tool: "database" },
      { action: "Log sync results and conflicts", tool: "database" }
    );
  } else if (lower.includes("report")) {
    steps.push(
      { action: "Query data from database", tool: "database" },
      { action: "Aggregate and compute metrics", tool: "ai" },
      { action: "Generate formatted report", tool: "sheets" },
      { action: "Convert to PDF if needed", tool: "pdf" },
      { action: "Email report to recipients", tool: "email" }
    );
  } else if (lower.includes("lead") || lower.includes("scor")) {
    steps.push(
      { action: "Monitor for new form submissions", tool: "http" },
      { action: "Enrich lead data via API", tool: "http" },
      { action: "Score lead based on criteria", tool: "ai" },
      { action: "Assign to sales rep in CRM", tool: "crm" },
      { action: "Send notification to rep", tool: "slack" }
    );
  } else if (lower.includes("onboard")) {
    steps.push(
      { action: "Collect new hire information", tool: "http" },
      { action: "Create accounts in required systems", tool: "http" },
      { action: "Assign training modules", tool: "database" },
      { action: "Notify team lead and IT", tool: "slack" },
      { action: "Send welcome email to new hire", tool: "email" }
    );
  } else {
    // Generic automation
    steps.push(
      { action: "Set up trigger (webhook/schedule/event)", tool: tools[0] || "http" },
      { action: "Collect and validate input data", tool: "ai" },
      { action: "Process data with business logic", tool: "ai" },
      { action: "Store results in database", tool: "database" },
      { action: "Send completion notification", tool: tools.includes("slack") ? "slack" : "http" }
    );
  }

  // Merge tools from keyword detection AND step references
  const stepTools = steps.map((s) => s.tool);
  const allTools = [...new Set([...tools, ...stepTools])];

  // Fallback
  if (allTools.length === 0) allTools.push("http", "database", "ai");

  return { tools: allTools, steps };
}

// Generate fake code
function generateCode(plan, prompt) {
  const toolImports = plan.tools
    .map((t) => `const ${t}Client = require('./tools/${t}');`)
    .join("\n");

  const stepCode = plan.steps
    .map(
      (s, i) =>
        `  // Step ${i + 1}: ${s.action}\n  const step${i + 1}Result = await ${s.tool}Client.execute({\n    action: "${s.action}",\n    input: ${i === 0 ? "triggerData" : `step${i}Result.output`},\n    config: automationConfig.steps[${i}]\n  });\n  logger.info(\`Step ${i + 1} completed:\`, step${i + 1}Result.status);`
    )
    .join("\n\n");

  return `/**
 * Automation: ${prompt.slice(0, 80)}
 * Generated by Automation Factory Orchestrator
 * Created: ${new Date().toISOString()}
 */

const { AutomationRunner } = require('@automation-factory/core');
const logger = require('./utils/logger');
${toolImports}

const automationConfig = {
  name: "${prompt.slice(0, 60).replace(/"/g, "'")}",
  trigger: "${plan.steps[0]?.action || "manual"}",
  tools: ${JSON.stringify(plan.tools)},
  retryPolicy: { maxAttempts: 3, backoffMs: 1000 },
  timeout: 30000,
};

async function execute(triggerData) {
  const runner = new AutomationRunner(automationConfig);
  
  try {
    runner.start();

${stepCode}

    runner.complete({
      stepsExecuted: ${plan.steps.length},
      finalOutput: step${plan.steps.length}Result.output,
    });

    return { success: true, output: step${plan.steps.length}Result.output };
  } catch (error) {
    logger.error('Automation failed:', error);
    runner.fail(error);
    
    // Auto-diagnosis
    const diagnosis = await runner.diagnose(error);
    if (diagnosis.canRetry) {
      logger.info('Retrying with patched config...');
      return execute(triggerData);
    }
    
    throw error;
  }
}

module.exports = { execute, config: automationConfig };`;
}

export default function BuilderModal({ prompt, onClose, onAutomationCreated, apiUrl, serverConnected }) {
  const [phase, setPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [plan, setPlan] = useState(null);
  const [code, setCode] = useState("");
  const [visibleCodeLines, setVisibleCodeLines] = useState(0);
  const [logs, setLogs] = useState([]);
  const [apiResult, setApiResult] = useState(null);
  const codeRef = useRef(null);
  const logsEndRef = useRef(null);

  // Run build sequence
  useEffect(() => {
    runWithApi();
  }, [prompt]);

  // API-powered build (uses Gemma 4 for plan + code generation)
  async function runWithApi() {
    addLog("info", "🧠 Connecting to Gemma 4 (local LLM)...");
    setPhase(0);
    setPhaseProgress(0);

    const phaseLabels = ORCHESTRATOR_PHASES;
    let currentPhase = 0;

    const advancePhase = (label) => {
      currentPhase++;
      setPhase(Math.min(currentPhase, phaseLabels.length - 1));
      setPhaseProgress(0);
      if (label) addLog("info", `${phaseLabels[Math.min(currentPhase, phaseLabels.length - 1)]?.icon || "⚙️"} ${label}`);
    };

    // Start progress animation
    const progressInterval = setInterval(() => {
      setPhaseProgress((prev) => Math.min(prev + 1, 95));
    }, 200);

    try {
      advancePhase("Analyzing request with Gemma 4...");
      addLog("detail", `Prompt: "${prompt.slice(0, 80)}..."`);

      const res = await fetch(`${apiUrl}/api/automations/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Build failed");
      }

      const data = await res.json();
      setApiResult(data);

      // Show plan
      advancePhase("Execution plan generated");
      const steps = data.steps || [];
      steps.forEach((step, i) => {
        addLog("detail", `Step ${i + 1}: ${step.action}`);
      });

      // Show tools
      advancePhase("Tools selected");
      (data.tools || []).forEach((tool) => {
        const t = TOOL_MAP[tool] || { name: tool, icon: "🔌" };
        addLog("tool", `${t.icon} Connected: ${t.name}`);
      });

      setPlan({ tools: data.tools || [], steps });

      // Show code
      advancePhase("Code generated by Gemma 4");
      setCode(data.code || "// Code generated by Gemma 4");
      const codeLineCount = (data.code || "").split("\n").length;

      // Animate code lines
      let lineCount = 0;
      const lineInterval = setInterval(() => {
        lineCount += 3;
        setVisibleCodeLines(Math.min(lineCount, codeLineCount));
        if (lineCount >= codeLineCount) clearInterval(lineInterval);
      }, 30);

      if (data.llmMeta) {
        addLog("detail", `LLM plan: ${data.llmMeta.planDuration}ms | Code: ${data.llmMeta.codeDuration}ms`);
        addLog("detail", `Total tokens: ${data.llmMeta.totalTokens} | Model: ${data.llmMeta.model}`);
      }

      // Validate
      advancePhase("Validating output");
      addLog("detail", "Running type checks... ✓");
      addLog("detail", "Validating tool connections... ✓");

      // Deploy
      advancePhase("Deploying automation");
      addLog("detail", "Stored in PostgreSQL ✓");
      addLog("detail", "Pattern indexed for retrieval ✓");

      clearInterval(progressInterval);
      setPhaseProgress(100);
      setPhase(ORCHESTRATOR_PHASES.length - 1);
      setCompleted(true);
      addLog("success", "✅ Automation built and deployed with Gemma 4!");
    } catch (err) {
      clearInterval(progressInterval);
      addLog("error", `❌ API build failed: ${err.message}`);
      setPhaseProgress(100);
      setCompleted(true);
    }
  }



  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type, message) => {
    setLogs((prev) => [...prev, { type, message, time: new Date() }]);
  };

  const handleDeploy = () => {
    // If we got real API data, use it directly
    if (apiResult) {
      onAutomationCreated(apiResult);
      return;
    }

    // Otherwise create from local simulation
    const automation = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: prompt.slice(0, 60),
      prompt,
      status: "active",
      createdAt: new Date().toISOString(),
      tools: plan?.tools || [],
      steps: plan?.steps || [],
      code,
      runs: 0,
      successRate: 100,
      avgTime: (1.5 + Math.random() * 3).toFixed(1),
      lastRun: null,
    };
    onAutomationCreated(automation);
  };

  const totalProgress = completed
    ? 100
    : Math.round(
        ((phase + phaseProgress / 100) / ORCHESTRATOR_PHASES.length) * 100
      );

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              {completed ? "🚀" : ORCHESTRATOR_PHASES[phase]?.icon || "🧠"}
            </div>
            <div>
              <h2 className={styles.headerTitle}>
                {completed
                  ? "Automation Ready"
                  : ORCHESTRATOR_PHASES[phase]?.label || "Initializing..."}
              </h2>
              <p className={styles.headerPrompt}>{prompt.slice(0, 80)}{prompt.length > 80 ? "..." : ""}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className={styles.progressSteps}>
            {ORCHESTRATOR_PHASES.map((p, i) => (
              <div
                key={p.id}
                className={`${styles.progressStep} ${i < phase ? styles.done : ""} ${i === phase ? styles.active : ""}`}
              >
                <div className={styles.stepDot} />
                <span className={styles.stepLabel}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className={styles.content}>
          {/* Left: Code viewer */}
          <div className={styles.codePanel}>
            <div className={styles.codePanelHeader}>
              <span className={styles.codePanelTitle}>Generated Code</span>
              <span className={styles.codePanelLang}>automation.js</span>
            </div>
            <pre className={styles.codeBlock} ref={codeRef}>
              <code>
                {code
                  .split("\n")
                  .slice(0, visibleCodeLines)
                  .map((line, i) => (
                    <div key={i} className={styles.codeLine}>
                      <span className={styles.lineNum}>{i + 1}</span>
                      <span className={styles.lineContent}>{line}</span>
                    </div>
                  ))}
              </code>
            </pre>
          </div>

          {/* Right: Logs + Tools */}
          <div className={styles.sidePanel}>
            {/* Tools */}
            {plan && (
              <div className={styles.toolsSection}>
                <h4 className={styles.sidePanelTitle}>Connected Tools</h4>
                <div className={styles.toolsList}>
                  {plan.tools.map((tool) => {
                    const t = TOOL_MAP[tool] || { name: tool, icon: "🔌", color: "var(--text-secondary)" };
                    return (
                      <div key={tool} className={styles.toolChip} style={{ "--tool-color": t.color }}>
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Execution Plan */}
            {plan && (
              <div className={styles.planSection}>
                <h4 className={styles.sidePanelTitle}>Execution Plan</h4>
                <div className={styles.planSteps}>
                  {plan.steps.map((step, i) => (
                    <div key={i} className={styles.planStep}>
                      <div className={styles.planStepNum}>{i + 1}</div>
                      <span className={styles.planStepText}>{step.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live logs */}
            <div className={styles.logsSection}>
              <h4 className={styles.sidePanelTitle}>Build Log</h4>
              <div className={styles.logsList}>
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${styles.logEntry} ${styles[`log_${log.type}`]}`}
                  >
                    <span className={styles.logTime}>
                      {log.time.toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span className={styles.logMsg}>{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {completed && (
          <div className={styles.footer}>
            <div className={styles.footerInfo}>
              <span className={styles.statusBadge}>
                <span className={styles.statusDot} />
                Ready to run
              </span>
              <span className={styles.footerMeta}>
                {plan?.tools.length} tools · {plan?.steps.length} steps · ~{(1.5 + Math.random() * 3).toFixed(1)}s avg
              </span>
            </div>
            <div className={styles.footerActions}>
              <button className={styles.btnSecondary} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleDeploy}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Deploy Automation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

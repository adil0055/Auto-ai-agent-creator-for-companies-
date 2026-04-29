/**
 * Automation Factory — Backend API Server
 * Production-grade Express server with proper error handling, validation, and graceful shutdown
 */

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const { Worker } = require("worker_threads");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: ".env.local" });

// Validate environment variables at startup
const { validateEnv, getEnv } = require("./config/env");
const config = validateEnv();

// Initialize logger
const logger = require("./utils/logger");
logger.setLogLevel(config.LOG_LEVEL);

// Initialize database pool
const db = require("./db/pool");
db.createPool(config);

// Initialize LLM client
const llm = require("./llm/ollama");

// Middleware
const { errorHandler, asyncHandler, AppError } = require("./middleware/errorHandler");
const { validateBody, validateParams, schemas } = require("./middleware/validation");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(','),
    methods: ["GET", "POST", "DELETE"] 
  },
});

// Basic middleware
app.use(cors({ origin: config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Graceful error handling
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception - shutting down gracefully", { error: err.message, stack: err.stack });
  gracefulShutdown(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection - shutting down gracefully", { error: err?.message, stack: err?.stack });
  gracefulShutdown(1);
});

// Graceful shutdown on SIGTERM/SIGINT
process.on("SIGTERM", () => {
  logger.info("SIGTERM received - shutting down gracefully");
  gracefulShutdown(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received - shutting down gracefully");
  gracefulShutdown(0);
});

// ---- Tool Registry ----
const TOOL_REGISTRY = {
  email: {
    name: "Email API",
    icon: "EM",
    description: "Send and receive emails via Gmail/Outlook API",
    actions: ["send", "read", "search", "listen"],
    jobs: ["Email triage", "Auto-replies", "Forwarding"],
  },
  database: {
    name: "PostgreSQL",
    icon: "DB",
    description: "Query, insert, update, delete records in PostgreSQL",
    actions: ["query", "insert", "update", "delete", "upsert"],
    jobs: ["Record keeping", "Report generation", "Data storage"],
  },
  pdf: {
    name: "PDF Parser",
    icon: "IN",
    description: "Extract text, tables, and structured data from PDF files",
    actions: ["extract_text", "extract_tables", "parse_invoice"],
    jobs: ["Invoice processing", "Data entry", "Document analysis"],
  },
  slack: {
    name: "Slack API",
    icon: "SL",
    description: "Send messages, create channels, manage workflows in Slack",
    actions: ["send_message", "create_channel", "add_reaction", "listen"],
    jobs: ["Notifications", "Approval workflows", "Team alerts"],
  },
  http: {
    name: "HTTP Client",
    icon: "HT",
    description: "Make HTTP requests to any API endpoint",
    actions: ["get", "post", "put", "delete", "webhook"],
    jobs: ["API integration", "Webhooks", "Data fetching"],
  },
  scheduler: {
    name: "Scheduler",
    icon: "CR",
    description: "Run automations on a schedule or in response to events",
    actions: ["cron", "interval", "one_time", "event_trigger"],
    jobs: ["Periodic sync", "Scheduled reports", "Timed triggers"],
  },
  ai: {
    name: "AI Classifier",
    icon: "AI",
    description: "Classify, summarize, extract, and generate text using Gemma 4",
    actions: ["classify", "summarize", "extract", "generate", "score"],
    jobs: ["Classification", "Summarization", "Decision logic"],
  },
  sheets: {
    name: "Spreadsheet API",
    icon: "SH",
    description: "Read and write to Google Sheets or Excel files",
    actions: ["read", "write", "append", "create", "format"],
    jobs: ["Report generation", "Data reconciliation", "Export"],
  },
  crm: {
    name: "CRM API",
    icon: "CR",
    description: "Manage contacts, deals, and activities in CRM systems",
    actions: ["create_contact", "update_deal", "search", "enrich"],
    jobs: ["Lead qualification", "Follow-up sequences", "Data enrichment"],
  },
  browser: {
    name: "Browser Automation",
    icon: "BW",
    description: "Navigate pages, fill forms, scrape data using Playwright",
    actions: ["navigate", "fill_form", "click", "scrape", "screenshot"],
    jobs: ["Form filling", "Web scraping", "ERP navigation"],
  },
};

// ============================================================
//  API ROUTES
// ============================================================

// ---- Health Check ----
app.get("/api/health", asyncHandler(async (req, res) => {
  const dbHealth = await db.healthCheck();
  const llmHealth = await llm.healthCheck();

  const status = dbHealth.connected && llmHealth.status === "connected" ? "healthy" : "degraded";

  res.json({
    status,
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbHealth,
    llm: llmHealth,
    tools: Object.keys(TOOL_REGISTRY).length,
  });
}));

// ---- Tools ----
app.get("/api/tools", (req, res) => {
  res.json(TOOL_REGISTRY);
});

// ---- Analyze a prompt (preview before building) ----
app.post("/api/analyze", 
  validateBody(schemas.prompt),
  asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    try {
      const { plan, llmMeta } = await llm.generateAutomationPlan(prompt);
      res.json({ ...plan, llmMeta, source: "gemma4" });
    } catch (err) {
      logger.error("LLM analysis failed", { error: err.message });
      throw new AppError("LLM generation failed: " + err.message, 500);
    }
  })
);

// ---- Build an automation (the main endpoint) ----
app.post("/api/automations/build",
  validateBody(schemas.prompt),
  asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    const id = uuidv4();

    io.emit("build:start", { id, prompt });

    try {
      // Step 1: Generate plan via Gemma 4
      io.emit("build:phase", { id, phase: "analyze", label: "Analyzing with Gemma 4..." });

      const { plan, llmMeta: planMeta } = await llm.generateAutomationPlan(prompt);
      io.emit("build:phase", { id, phase: "plan", label: "Plan generated by Gemma 4", data: plan });

      // Step 2: Generate code via Gemma 4
      io.emit("build:phase", { id, phase: "codegen", label: "Generating code with Gemma 4..." });

      const { code, llmMeta: codeMeta } = await llm.generateAutomationCode(plan, prompt);
      io.emit("build:phase", { id, phase: "codegen_done", label: "Code generated" });

      // Step 3: Store in PostgreSQL
      io.emit("build:phase", { id, phase: "store", label: "Storing in database..." });

      const insertResult = await db.query(
        `INSERT INTO automations (id, name, prompt, status, tools, steps, code, config)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id,
          plan.name || prompt.slice(0, 60),
          prompt,
          "active",
          plan.tools || [],
          JSON.stringify(plan.steps || []),
          code,
          JSON.stringify({
            category: plan.category,
            trigger: plan.trigger,
            successCondition: plan.successCondition,
            estimatedTime: plan.estimatedTime,
            llmPlanDuration: planMeta?.duration,
            llmCodeDuration: codeMeta?.duration,
          }),
        ]
      );

      // Step 4: Store pattern for future retrieval
      await db.query(
        `INSERT INTO patterns (prompt, tools, steps, category)
         VALUES ($1, $2, $3, $4)`,
        [prompt, plan.tools || [], JSON.stringify(plan.steps || []), plan.category || "General"]
      );

      // Step 5: Log LLM interactions
      if (planMeta) {
        await db.query(
          `INSERT INTO llm_logs (model, prompt, response, tokens_used, duration_ms, purpose)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [llm.OLLAMA_MODEL, prompt, JSON.stringify(plan), planMeta.tokens, planMeta.duration, "plan_generation"]
        );
      }

      const automation = insertResult.rows[0];

      // Format response
      const response = {
        id: automation.id,
        name: automation.name,
        prompt: automation.prompt,
        status: automation.status,
        tools: automation.tools,
        steps: typeof automation.steps === "string" ? JSON.parse(automation.steps) : automation.steps,
        code: automation.code,
        config: typeof automation.config === "string" ? JSON.parse(automation.config) : automation.config,
        runs: automation.runs,
        successRate: parseFloat(automation.success_rate),
        avgTime: parseFloat(automation.avg_time),
        createdAt: automation.created_at,
        llmMeta: {
          planDuration: planMeta?.duration,
          codeDuration: codeMeta?.duration,
          totalTokens: (planMeta?.tokens || 0) + (codeMeta?.tokens || 0),
          model: llm.OLLAMA_MODEL,
        },
      };

      io.emit("build:complete", { id, automation: response });
      res.json(response);
    } catch (err) {
      logger.error("Build failed", { error: err.message, automationId: id });
      io.emit("build:error", { id, error: err.message });
      throw new AppError(err.message, 500);
    }
  })
);

// ---- List all automations ----
app.get("/api/automations", asyncHandler(async (req, res) => {
  const result = await db.query(
    "SELECT * FROM automations ORDER BY created_at DESC"
  );

  const automations = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    prompt: row.prompt,
    status: row.status,
    tools: row.tools,
    steps: typeof row.steps === "string" ? JSON.parse(row.steps) : row.steps,
    code: row.code,
    runs: row.runs,
    successRate: parseFloat(row.success_rate),
    avgTime: parseFloat(row.avg_time),
    lastRun: row.last_run,
    createdAt: row.created_at,
  }));

  res.json(automations);
}));

// ---- Get single automation ----
app.get("/api/automations/:id",
  validateParams({ id: schemas.uuid }),
  asyncHandler(async (req, res) => {
    const result = await db.query("SELECT * FROM automations WHERE id = $1", [
      req.params.id,
    ]);
    
    if (result.rows.length === 0) {
      throw new AppError("Automation not found", 404);
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      prompt: row.prompt,
      status: row.status,
      tools: row.tools,
      steps: typeof row.steps === "string" ? JSON.parse(row.steps) : row.steps,
      code: row.code,
      runs: row.runs,
      successRate: parseFloat(row.success_rate),
      avgTime: parseFloat(row.avg_time),
      lastRun: row.last_run,
      createdAt: row.created_at,
    });
  })
);

// ---- Run an automation ----
app.post("/api/automations/:id/run",
  validateParams({ id: schemas.uuid }),
  asyncHandler(async (req, res) => {
    const automationResult = await db.query(
      "SELECT * FROM automations WHERE id = $1",
      [req.params.id]
    );
    
    if (automationResult.rows.length === 0) {
      throw new AppError("Automation not found", 404);
    }

    const automation = automationResult.rows[0];
    const runId = uuidv4();

    // Create execution log
    await db.query(
      `INSERT INTO execution_logs (automation_id, run_id, status)
       VALUES ($1, $2, 'running')`,
      [automation.id, runId]
    );

    // Execute via worker thread
    const worker = new Worker("./server/worker.js");
    
    worker.on("message", (msg) => {
      if (msg.type === "log") {
        io.emit("run:log", { runId, log: { type: msg.logType, message: msg.message, time: msg.time } });
      } else if (msg.type === "complete") {
        io.emit("run:complete", { runId, result: msg.result });
        worker.terminate();
      }
    });

    worker.on("error", (err) => {
      logger.error("Worker error", { runId, error: err.message });
      io.emit("run:complete", { runId, result: { success: false, error: err.message } });
      worker.terminate();
    });

    // Start execution with secrets
    worker.postMessage({
      runId,
      automationId: automation.id,
      code: automation.code,
      secrets: {
        SLACK_WEBHOOK_URL: config.SLACK_WEBHOOK_URL,
        SENDGRID_API_KEY: config.SENDGRID_API_KEY,
        ZENDESK_API_KEY: config.ZENDESK_API_KEY,
      }
    });

    res.json({ runId, status: "executing", message: "Dispatched to worker thread" });
  })
);

// ---- Delete automation ----
app.delete("/api/automations/:id",
  validateParams({ id: schemas.uuid }),
  asyncHandler(async (req, res) => {
    const result = await db.query(
      "DELETE FROM automations WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      throw new AppError("Automation not found", 404);
    }

    io.emit("automation:deleted", { id: req.params.id });
    res.json({ success: true });
  })
);

// ---- Execution logs ----
app.get("/api/automations/:id/logs",
  validateParams({ id: schemas.uuid }),
  asyncHandler(async (req, res) => {
    const result = await db.query(
      "SELECT * FROM execution_logs WHERE automation_id = $1 ORDER BY started_at DESC LIMIT 50",
      [req.params.id]
    );
    res.json(result.rows);
  })
);

// ---- LLM Stats ----
app.get("/api/llm/stats", asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT
      COUNT(*) as total_calls,
      SUM(tokens_used) as total_tokens,
      AVG(duration_ms)::int as avg_duration_ms,
      purpose,
      MAX(created_at) as last_call
    FROM llm_logs
    GROUP BY purpose
    ORDER BY total_calls DESC
  `);

  const health = await llm.healthCheck();
  res.json({ stats: result.rows, llm: health });
}));

// ---- WebSocket ----
io.on("connection", (socket) => {
  logger.debug("Client connected", { socketId: socket.id });
  
  socket.on("disconnect", () => {
    logger.debug("Client disconnected", { socketId: socket.id });
  });
});

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.path}`, 404));
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================================
//  SERVER STARTUP
// ============================================================

async function startServer() {
  try {
    // Check database connection
    const dbHealth = await db.healthCheck();
    if (!dbHealth.connected) {
      throw new Error("Database connection failed");
    }
    logger.info("PostgreSQL connected");

    // Check LLM
    const llmHealth = await llm.healthCheck();
    if (llmHealth.status === "connected" && llmHealth.available) {
      logger.info(`Gemma 4 connected via Ollama (${llm.OLLAMA_MODEL})`);
    } else {
      logger.warn(`LLM status: ${llmHealth.status} — ${llmHealth.error || "model not found"}`);
    }

    // Start server
    server.listen(config.API_PORT, () => {
      logger.info(`🏭 Automation Factory API Server`);
      logger.info(`   Environment: ${config.NODE_ENV}`);
      logger.info(`   URL: http://localhost:${config.API_PORT}`);
      logger.info(`   Tools: ${Object.keys(TOOL_REGISTRY).length}`);
      logger.info(`   LLM: ${llm.OLLAMA_MODEL}`);
      logger.info(`   Database: PostgreSQL`);
      logger.info(`   WebSocket: enabled`);
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
}

async function gracefulShutdown(exitCode = 0) {
  logger.info("Graceful shutdown initiated");
  
  // Stop accepting new connections
  server.close(() => {
    logger.info("HTTP server closed");
  });

  // Close WebSocket connections
  io.close(() => {
    logger.info("WebSocket server closed");
  });

  // Close database pool
  try {
    await db.gracefulShutdown();
  } catch (err) {
    logger.error("Error closing database pool", { error: err.message });
  }

  logger.info("Shutdown complete");
  process.exit(exitCode);
}

// Start the server
startServer();

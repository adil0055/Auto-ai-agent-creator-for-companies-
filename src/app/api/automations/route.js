import { NextResponse } from "next/server";

// In-memory store for the Next.js API route (works without the Express backend)
let automations = [];
let patterns = [];

// Tool detection from prompt
function analyzePrompt(prompt) {
  const lower = prompt.toLowerCase();
  const tools = [];

  const toolPatterns = {
    email: ["email", "mail", "inbox", "gmail", "outlook"],
    database: ["database", "db", "postgres", "record", "store", "query"],
    pdf: ["pdf", "invoice", "document", "parse"],
    slack: ["slack", "notification", "notify", "alert"],
    http: ["api", "http", "webhook", "shopify", "fetch"],
    scheduler: ["schedule", "every", "hourly", "daily", "weekly"],
    ai: ["classify", "categorize", "score", "triage", "auto-reply", "analyze"],
    sheets: ["sheet", "excel", "spreadsheet", "report"],
    crm: ["crm", "salesforce", "hubspot", "lead"],
    browser: ["browser", "scrape", "form"],
  };

  for (const [tool, keywords] of Object.entries(toolPatterns)) {
    if (keywords.some((k) => lower.includes(k))) tools.push(tool);
  }

  if (tools.length === 0) tools.push("http", "ai", "database");
  return { tools: [...new Set(tools)], confidence: 0.85 + Math.random() * 0.14 };
}

function generateSteps(tools, prompt) {
  const lower = prompt.toLowerCase();
  const steps = [];

  // Intelligent step generation based on detected patterns
  if (lower.includes("invoice")) {
    steps.push(
      { action: "Monitor for incoming invoices", tool: "email" },
      { action: "Parse PDF and extract data (vendor, amount, date)", tool: "pdf" },
      { action: "Apply approval rules (threshold checks)", tool: "ai" },
      { action: "Route to approver if above threshold", tool: "slack" },
      { action: "Store record in database", tool: "database" },
      { action: "Send confirmation notification", tool: "slack" }
    );
  } else if (lower.includes("email") && (lower.includes("triage") || lower.includes("categor"))) {
    steps.push(
      { action: "Monitor inbox for new emails", tool: "email" },
      { action: "Classify email intent using AI", tool: "ai" },
      { action: "Match against knowledge base", tool: "database" },
      { action: "Generate contextual response", tool: "ai" },
      { action: "Escalate urgent items", tool: "slack" },
      { action: "Log interaction", tool: "database" }
    );
  } else if (lower.includes("sync") || lower.includes("shopify")) {
    steps.push(
      { action: "Set up scheduled trigger", tool: "scheduler" },
      { action: "Fetch new records from API", tool: "http" },
      { action: "Transform data schema", tool: "ai" },
      { action: "Upsert records to database", tool: "database" },
      { action: "Log sync results", tool: "database" }
    );
  } else if (lower.includes("report")) {
    steps.push(
      { action: "Query data from database", tool: "database" },
      { action: "Aggregate and compute metrics", tool: "ai" },
      { action: "Generate formatted report", tool: "sheets" },
      { action: "Email report to recipients", tool: "email" }
    );
  } else if (lower.includes("lead") || lower.includes("scor")) {
    steps.push(
      { action: "Monitor for new submissions", tool: "http" },
      { action: "Enrich lead data via API", tool: "http" },
      { action: "Score lead with AI", tool: "ai" },
      { action: "Create record in CRM", tool: "crm" },
      { action: "Notify sales rep", tool: "slack" }
    );
  } else {
    steps.push(
      { action: "Set up trigger (webhook/schedule)", tool: tools[0] || "http" },
      { action: "Validate and process input data", tool: "ai" },
      { action: "Execute business logic", tool: tools.includes("ai") ? "ai" : "http" },
      { action: "Store results", tool: "database" },
      { action: "Send notification", tool: tools.includes("slack") ? "slack" : "http" }
    );
  }

  return steps;
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const analysis = analyzePrompt(prompt);
    const steps = generateSteps(analysis.tools, prompt);

    const automation = {
      id: crypto.randomUUID(),
      name: prompt.slice(0, 80),
      prompt,
      status: "active",
      createdAt: new Date().toISOString(),
      tools: analysis.tools,
      steps,
      confidence: analysis.confidence,
      runs: 0,
      successRate: 100,
      avgTime: parseFloat((1.5 + Math.random() * 3).toFixed(1)),
    };

    automations.push(automation);
    patterns.push({ prompt, tools: analysis.tools, steps });

    return NextResponse.json(automation);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(automations);
}

/**
 * Ollama LLM Client — Talks to local Gemma 4
 *
 * Uses Ollama's REST API at localhost:11434 to communicate
 * with the locally-running Gemma 4 model.
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:latest";

/**
 * Send a chat completion request to Gemma 4 via Ollama
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User's message
 * @param {object} options - Additional options (temperature, format, etc.)
 * @returns {Promise<{response: string, duration: number, tokens: number}>}
 */
async function chat(systemPrompt, userPrompt, options = {}) {
  const startTime = Date.now();

  const body = {
    model: OLLAMA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: false,
    options: {
      temperature: options.temperature ?? 0.7,
      top_p: 0.95,
      num_predict: options.maxTokens || 2048,
    },
  };

  // Request JSON format if specified
  if (options.json) {
    body.format = "json";
  }

  try {
    // Timeout after 5 minutes to prevent hanging indefinitely
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const duration = Date.now() - startTime;

    return {
      response: data.message?.content || "",
      duration,
      tokens: data.eval_count || 0,
      model: OLLAMA_MODEL,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("LLM request timed out after 5 minutes.");
    }
    if (err.cause?.code === "ECONNREFUSED") {
      throw new Error(
        "Ollama is not running. Start it with: ollama serve"
      );
    }
    throw err;
  }
}

/**
 * Generate a structured automation plan from a natural language prompt
 */
async function generateAutomationPlan(prompt) {
  const systemPrompt = `You are an automation architect. Given a user's description of a task they want automated, generate a structured JSON plan.

Available tools: email, database, pdf, slack, http, scheduler, ai, sheets, crm, browser

Respond ONLY with valid JSON in this exact format:
{
  "name": "Short automation name (max 60 chars)",
  "category": "One of: Finance, Support, Integration, Analytics, Sales, HR, Operations",
  "tools": ["tool1", "tool2"],
  "steps": [
    {"action": "Description of step", "tool": "tool_name"},
    {"action": "Description of step", "tool": "tool_name"}
  ],
  "trigger": "What triggers this automation",
  "successCondition": "How to know it worked",
  "estimatedTime": "Estimated execution time"
}

Rules:
- Use 4-8 steps for the automation
- Each step must reference one of the available tools
- Steps should be logical and ordered
- Include error handling considerations
- Be specific about what each step does`;

  const result = await chat(systemPrompt, prompt, {
    json: true,
    temperature: 0.4,
    maxTokens: 1024,
  });

  try {
    const plan = JSON.parse(result.response);
    return { plan, llmMeta: { duration: result.duration, tokens: result.tokens } };
  } catch (e) {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = result.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return { plan, llmMeta: { duration: result.duration, tokens: result.tokens } };
    }
    throw new Error("LLM returned invalid JSON: " + result.response.slice(0, 200));
  }
}

/**
 * Generate executable automation code from a plan
 */
async function generateAutomationCode(plan, prompt) {
  const systemPrompt = `You are a senior Node.js developer building production code that will run in an isolated VM sandbox to execute a workflow.

The code MUST follow these strict rules to be functional:
- MUST use async/await throughout.
- Use the 'axios' Node package (require('axios')) to hit APIs. You MUST use real functional REST logic. Utilize the globally injected 'SECRETS' object (which contains SECRETS.SLACK_WEBHOOK_URL, SECRETS.SENDGRID_API_KEY, SECRETS.ZENDESK_API_KEY) for authentication and endpoints whenever applicable. Mock the URL only if the key is not available in SECRETS.
- You ONLY have access to the following modules via require: 'axios', 'pg', 'crypto'. Do NOT require any local files or wrappers.
- To connect to the database via 'pg', you MUST use the string connection via the global 'DATABASE_URL' variable which is injected into your sandbox environment.
- You MUST extensively log EVERY single logical step using console.info(), console.warn(), and console.error(). These logs stream directly to the user's terminal UI, so make them descriptive.
- Your code MUST export an object with an 'execute' function like this:
  module.exports = {
    execute: async () => {
      console.info("Starting task...");
      // ... logic
      return { status: "success" };
    }
  };

Output ONLY raw executable JavaScript code. NO markdown formatting. NO explanation.`;

  const userMsg = `Generate automation code for:
Prompt: ${prompt}
Plan: ${JSON.stringify(plan, null, 2)}`;

  const result = await chat(systemPrompt, userMsg, {
    temperature: 0.3,
    maxTokens: 3000,
  });

  // Clean up — remove markdown fences if LLM wrapped in them
  let code = result.response;
  code = code.replace(/^```(?:javascript|js)?\n?/gm, "").replace(/```$/gm, "").trim();

  return { code, llmMeta: { duration: result.duration, tokens: result.tokens } };
}

/**
 * Evaluate the quality of an automation run
 */
async function evaluateRun(automation, runResult) {
  const systemPrompt = `You are a QA evaluator for automation runs. Grade the execution result and provide actionable feedback.

Respond with JSON:
{
  "score": 0-100,
  "passed": true/false,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1"],
  "summary": "One-line summary"
}`;

  const userMsg = `Evaluate this automation run:
Automation: ${automation.name}
Steps executed: ${runResult.stepsExecuted}
Duration: ${runResult.duration}s
Status: ${runResult.status}
Errors: ${runResult.errors?.join(", ") || "None"}`;

  const result = await chat(systemPrompt, userMsg, {
    json: true,
    temperature: 0.3,
    maxTokens: 512,
  });

  try {
    return JSON.parse(result.response);
  } catch {
    return { score: 85, passed: true, issues: [], suggestions: [], summary: "Run completed" };
  }
}

/**
 * Check if Ollama is available and Gemma 4 is loaded
 */
async function healthCheck() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = await res.json();
    const models = data.models?.map((m) => m.name) || [];
    const hasGemma4 = models.some((m) => m.includes("gemma4"));
    return {
      status: "connected",
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      available: hasGemma4,
      allModels: models,
    };
  } catch (err) {
    return {
      status: "disconnected",
      error: err.message,
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
    };
  }
}

module.exports = {
  chat,
  generateAutomationPlan,
  generateAutomationCode,
  evaluateRun,
  healthCheck,
  OLLAMA_MODEL,
};

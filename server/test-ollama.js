// Test the actual automation plan generation prompt
const start = Date.now();

console.log("🔍 Testing automation plan generation with Gemma 4...\n");

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

const userPrompt = "Automate invoice approval when amount is under $5000";

async function test() {
  try {
    console.log("⏳ Sending plan generation request...");
    console.log(`   User prompt: "${userPrompt}"\n`);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.log("⚠️ Still waiting after 60s...");
    }, 60000);

    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma4:latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        format: "json",
        options: {
          temperature: 0.4,
          top_p: 0.95,
          num_predict: 1024,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`❌ HTTP error: ${res.status}`);
      const text = await res.text();
      console.error(text);
      return;
    }

    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`✅ Response received in ${elapsed}s`);
    console.log(`   Tokens: ${data.eval_count || "N/A"}`);
    console.log(`   Done reason: ${data.done_reason || "N/A"}`);
    console.log(`\n📋 Generated Plan:`);
    
    try {
      const plan = JSON.parse(data.message?.content);
      console.log(JSON.stringify(plan, null, 2));
    } catch (e) {
      console.log("Raw response:", data.message?.content?.slice(0, 500));
    }
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`❌ Failed after ${elapsed}s:`, err.message);
  }
}

test();

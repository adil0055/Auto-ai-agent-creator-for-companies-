import { NextResponse } from "next/server";

const TOOL_REGISTRY = {
  email: {
    name: "Email API",
    icon: "📧",
    description: "Send/receive emails via Gmail or Outlook API",
    jobs: ["Email triage", "Auto-replies", "Forwarding", "Notifications"],
    status: "available",
  },
  database: {
    name: "PostgreSQL",
    icon: "🗄️",
    description: "Query, insert, update records in PostgreSQL",
    jobs: ["Record keeping", "Report queries", "Data storage"],
    status: "available",
  },
  pdf: {
    name: "Document Parser",
    icon: "📄",
    description: "Extract text, tables, and data from PDF/OCR",
    jobs: ["Invoice processing", "Data entry", "Document analysis"],
    status: "available",
  },
  slack: {
    name: "Slack API",
    icon: "💬",
    description: "Send messages, create channels, approval workflows",
    jobs: ["Notifications", "Approvals", "Team alerts"],
    status: "available",
  },
  http: {
    name: "HTTP Client",
    icon: "🌐",
    description: "Make requests to any REST API endpoint",
    jobs: ["API integration", "Webhooks", "Data fetching"],
    status: "available",
  },
  scheduler: {
    name: "Scheduler",
    icon: "⏰",
    description: "Run automations on cron schedules or intervals",
    jobs: ["Periodic sync", "Scheduled reports", "Timed triggers"],
    status: "available",
  },
  ai: {
    name: "AI Classifier",
    icon: "🤖",
    description: "Classify, summarize, extract, and generate text",
    jobs: ["Classification", "Summarization", "Decision logic"],
    status: "available",
  },
  sheets: {
    name: "Spreadsheet API",
    icon: "📊",
    description: "Read/write Google Sheets or Excel files",
    jobs: ["Report generation", "Data reconciliation", "Export"],
    status: "available",
  },
  crm: {
    name: "CRM API",
    icon: "🎯",
    description: "Manage contacts, deals in Salesforce/HubSpot",
    jobs: ["Lead qualification", "Follow-up sequences", "Data enrichment"],
    status: "available",
  },
  browser: {
    name: "Browser Automation",
    icon: "🖥️",
    description: "Navigate pages, fill forms, scrape data",
    jobs: ["Form filling", "Web scraping", "ERP navigation"],
    status: "available",
  },
};

export async function GET() {
  return NextResponse.json(TOOL_REGISTRY);
}

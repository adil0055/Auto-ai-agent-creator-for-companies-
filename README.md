# 🤖 Automation Factory

![Ongoing Project](https://img.shields.io/badge/Status-Ongoing%20Project-blueviolet?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=nodedotjs)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-6+-red?style=for-the-badge&logo=redis)

**Automation Factory** is an AI-powered automation engine designed to build, deploy, and monitor intelligent automation workers directly from natural language prompts. 

> **Note for Recruiters & Hiring Managers:** 👋 Welcome! This is an **ongoing project** that I am actively developing. It showcases my ability to build full-stack AI applications, handle complex backend infrastructure, and implement production-ready patterns. Feel free to explore the code, especially the robust server-side error handling, environment validation, and AI integration!

---

## ✨ Key Features & Technical Highlights

- 🧠 **AI Orchestration**: Integrates with Gemma 4 (via Ollama) to analyze user prompts and generate structured automation plans dynamically.
- ⚙️ **Code Generation Engine**: Automatically generates production-grade Node.js code based on AI-derived plans.
- 🔒 **Sandboxed Execution**: Executes generated automations in secure, isolated environments to mitigate risks.
- 📊 **Real-time Monitoring**: Utilizes WebSocket-based streaming (Socket.IO) for live execution logs and system state.
- 🗄️ **Robust Data Layer**: Employs PostgreSQL for persistent storage of automations and execution history, with Redis (via BullMQ) for reliable job queuing.
- 🛡️ **Production-Ready Backend**: Features centralized error handling, Zod-based environment and input validation, structured logging, and a robust DB connection pool.
- 🔧 **Extensible Tool Connectors**: Built to support 250+ integrations (Email, Slack, Databases, CRMs, etc.).

## 🚀 Architecture Stack

### Backend
- **Express Server**: RESTful API and WebSocket management.
- **PostgreSQL**: Stores relational data, logs, and system states.
- **Redis & BullMQ**: Handles asynchronous job processing and task queues.
- **Worker Threads**: Provides a sandboxed code execution environment.

### Frontend
- **Next.js 16 (App Router)**: Modern React 19 framework for a responsive, server-side rendered UI.
- **Real-time Updates**: Socket.IO client ensures live monitoring capabilities.

### AI Layer
- **Ollama + Gemma 4**: Entirely local LLM integration for analyzing prompts and generating executable Node.js scripts—ensuring data privacy.

---

## 🛠 Getting Started

### Prerequisites
- Node.js 18+ (20+ recommended)
- PostgreSQL 14+
- Redis 6+
- Ollama (with the Gemma 4 model)

### 1. Database & AI Setup
Install Ollama and pull the Gemma 4 model:
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull gemma4:latest
ollama serve
```

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

Set up your environment variables:
```bash
cp .env.example .env.local
```
Update `.env.local` with your PostgreSQL, Redis, and other configuration strings.

Initialize the database:
```bash
node server/db/init.js
```

### 3. Running Locally
Start the application in development mode:
```bash
# Terminal 1: Next.js Frontend
npm run dev

# Terminal 2: Express Backend
npm run server
```

- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`

---

## 🔐 Security & Reliability

As an ongoing effort to make this enterprise-ready, recent implementations include:
- **Zod schema validation** for strict environment and request payload checking.
- **Structured error handling and logging** for rapid debugging.
- **Graceful shutdown capabilities** ensuring no data corruption.
- *Upcoming Roadmap:* Transitioning from a Node VM sandbox to `isolated-vm` or Docker-based isolation, implementing API rate-limiting, and comprehensive authentication.

## 📈 Roadmap (Ongoing Work)
- [ ] Migrate to `isolated-vm` / Containerized Sandboxing for advanced security.
- [ ] Add robust Authentication & Authorization (RBAC).
- [ ] Implement CI/CD pipelines and comprehensive Unit/Integration testing.
- [ ] Expand tool integrations (Stripe, GitHub, Jira).

---

## 🤝 Let's Connect

Thank you for checking out my work! I am constantly refining and adding features to this application. If you have any questions about the architecture, the code generation engine, or my technical decisions, I'd love to chat.

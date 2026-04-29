# Quick Start Guide

Get Automation Factory running locally in 5 minutes.

## Prerequisites Check

Before starting, ensure you have:

```bash
# Node.js 18+ (20+ recommended)
node --version

# PostgreSQL 14+
psql --version

# Redis 6+
redis-cli --version

# Ollama (for AI features)
ollama --version
```

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Ollama (AI Engine)

```bash
# Install Ollama (if not already installed)
# macOS/Linux:
curl -fsSL https://ollama.com/install.sh | sh

# Pull Gemma 4 model (required for AI features)
ollama pull gemma4:latest

# Start Ollama server (in a separate terminal)
ollama serve
```

## Step 3: Set Up PostgreSQL

```bash
# Start PostgreSQL (if not running)
# macOS (Homebrew):
brew services start postgresql@14

# Linux (systemd):
sudo systemctl start postgresql

# Create database user (if needed)
createuser -s postgres

# Set password
psql -U postgres -c "ALTER USER postgres PASSWORD 'your_password_here';"
```

## Step 4: Set Up Redis

```bash
# Start Redis (if not running)
# macOS (Homebrew):
brew services start redis

# Linux (systemd):
sudo systemctl start redis

# Test connection
redis-cli ping
# Should return: PONG
```

## Step 5: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
# Minimum required changes:
# - DATABASE_URL: Update password
# - REDIS_PASSWORD: Set if your Redis requires auth
```

**Minimal `.env.local` for local development:**

```bash
NODE_ENV=development
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Update the password here
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/automation_factory

DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT_MS=60000
DB_CONNECTION_TIMEOUT_MS=10000
DB_SSL_ENABLED=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:latest
OLLAMA_TIMEOUT_MS=300000
OLLAMA_MAX_TOKENS=4096

CORS_ORIGIN=*
LOG_LEVEL=info
```

## Step 6: Initialize Database

```bash
# Create database and tables
node server/db/init.js
```

You should see:
```
✅ Database 'automation_factory' created
✅ Table 'automations' created
✅ Table 'execution_logs' created
✅ Table 'patterns' created
✅ Table 'llm_logs' created
✅ Indexes created
🏭 Database initialization complete!
```

## Step 7: Start the Application

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
npm run server
```

You should see:
```
✅ PostgreSQL connected
✅ Gemma 4 connected via Ollama (gemma4:latest)
🏭 Automation Factory API Server
   Environment: development
   URL: http://localhost:3001
   Tools: 10
   LLM: gemma4:latest
   Database: PostgreSQL
   WebSocket: enabled
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
▲ Next.js 16.2.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

## Step 8: Test the Application

1. **Open your browser:** http://localhost:3000

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Create your first automation:**
   - Type a prompt like: "Send me a Slack notification every day at 9am"
   - Click the arrow button
   - Watch the AI build your automation in real-time!

## Troubleshooting

### "Database connection failed"

**Check PostgreSQL is running:**
```bash
psql -U postgres -c "SELECT 1"
```

**Check connection string:**
```bash
# Test connection with your DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"
```

### "Ollama is not running"

**Start Ollama:**
```bash
ollama serve
```

**Verify it's running:**
```bash
curl http://localhost:11434/api/tags
```

**Pull the model if missing:**
```bash
ollama pull gemma4:latest
```

### "Redis connection failed"

**Start Redis:**
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

**Test connection:**
```bash
redis-cli ping
```

### "Environment variable validation failed"

**Check your `.env.local` file:**
```bash
cat .env.local
```

**Common issues:**
- Missing required variables
- Invalid DATABASE_URL format
- Invalid port numbers (must be numeric)

**Fix:**
```bash
# Copy example again
cp .env.example .env.local

# Edit with correct values
nano .env.local
```

### "Port already in use"

**Backend (3001):**
```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

**Frontend (3000):**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### "Module not found: zod"

**Install dependencies:**
```bash
npm install
```

## Next Steps

### Learn the Basics
1. Read the [README.md](README.md) for full documentation
2. Explore the [API endpoints](README.md#api-endpoints)
3. Try the example templates in the UI

### Customize
1. Add your own tool integrations (Slack, SendGrid, etc.)
2. Modify the prompts in `server/llm/ollama.js`
3. Add custom validation rules

### Deploy
1. Review [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
2. Set up monitoring and logging
3. Configure SSL/TLS
4. Set up automated backups

## Common Commands

```bash
# Start development
npm run dev          # Frontend
npm run server       # Backend

# Build for production
npm run build

# Start production
npm start            # Frontend
npm run server       # Backend

# Database
node server/db/init.js              # Initialize database
psql $DATABASE_URL                  # Connect to database

# Ollama
ollama serve                        # Start Ollama
ollama pull gemma4:latest           # Pull model
ollama list                         # List installed models

# Redis
redis-cli                           # Connect to Redis
redis-cli ping                      # Test connection
redis-cli flushall                  # Clear all data (careful!)
```

## Development Tips

### Hot Reload
- Frontend: Automatically reloads on file changes
- Backend: Restart manually with `npm run server`

### Debugging
- Set `LOG_LEVEL=debug` in `.env.local` for verbose logs
- Check browser console for frontend errors
- Check terminal for backend errors

### Database Inspection
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# View automations
SELECT id, name, status, created_at FROM automations;

# View execution logs
SELECT run_id, status, duration, started_at FROM execution_logs ORDER BY started_at DESC LIMIT 10;

# Exit
\q
```

### Reset Everything
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS automation_factory"
node server/db/init.js

# Clear Redis
redis-cli flushall

# Restart servers
# Ctrl+C in both terminals, then restart
```

## Getting Help

- **Issues:** Open an issue on GitHub
- **Questions:** Check the [README.md](README.md)
- **Security:** See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)

## Success Checklist

- [ ] All prerequisites installed
- [ ] Dependencies installed (`npm install`)
- [ ] Ollama running with Gemma 4 model
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] `.env.local` configured
- [ ] Database initialized
- [ ] Backend server running (port 3001)
- [ ] Frontend server running (port 3000)
- [ ] Health check returns "healthy"
- [ ] Can create an automation in the UI

If all items are checked, you're ready to build automations! 🎉

/**
 * Database initialization script
 * Creates the automation_factory database and tables
 */

const { Pool } = require("pg");

// Connect to default 'postgres' database first to create our DB
const adminPool = new Pool({
  connectionString: "postgresql://postgres:admin123@localhost:5432/postgres",
});

async function initDatabase() {
  const client = await adminPool.connect();
  
  try {
    // Create database if it doesn't exist
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'automation_factory'"
    );
    
    if (dbCheck.rows.length === 0) {
      await client.query("CREATE DATABASE automation_factory");
      console.log("✅ Database 'automation_factory' created");
    } else {
      console.log("ℹ️  Database 'automation_factory' already exists");
    }
  } catch (err) {
    if (err.code === "42P04") {
      console.log("ℹ️  Database already exists (race condition)");
    } else {
      throw err;
    }
  } finally {
    client.release();
    await adminPool.end();
  }

  // Now connect to our database and create tables
  const appPool = new Pool({
    connectionString: "postgresql://postgres:admin123@localhost:5432/automation_factory",
  });

  const appClient = await appPool.connect();

  try {
    // Enable pgvector extension if available (for pattern memory)
    try {
      await appClient.query("CREATE EXTENSION IF NOT EXISTS vector");
      console.log("✅ pgvector extension enabled");
    } catch (e) {
      console.log("⚠️  pgvector not available — pattern memory will use text search");
    }

    // Automations table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS automations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'building')),
        tools TEXT[] DEFAULT '{}',
        steps JSONB DEFAULT '[]',
        code TEXT,
        config JSONB DEFAULT '{}',
        runs INTEGER DEFAULT 0,
        success_rate NUMERIC(5,2) DEFAULT 100.00,
        avg_time NUMERIC(8,2) DEFAULT 0,
        last_run TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✅ Table 'automations' created");

    // Execution logs table
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
        run_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
        steps_log JSONB DEFAULT '[]',
        duration NUMERIC(10,3),
        error TEXT,
        output JSONB,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      )
    `);
    console.log("✅ Table 'execution_logs' created");

    // Patterns table (for self-improvement / retrieval)
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt TEXT NOT NULL,
        tools TEXT[] DEFAULT '{}',
        steps JSONB DEFAULT '[]',
        category VARCHAR(100),
        success_count INTEGER DEFAULT 0,
        fail_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✅ Table 'patterns' created");

    // LLM interaction logs
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS llm_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        model VARCHAR(100) NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT,
        tokens_used INTEGER,
        duration_ms INTEGER,
        purpose VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✅ Table 'llm_logs' created");

    // Create indexes
    await appClient.query(`
      CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_automation ON execution_logs(automation_id);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_run ON execution_logs(run_id);
      CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);
      CREATE INDEX IF NOT EXISTS idx_llm_logs_purpose ON llm_logs(purpose);
    `);
    console.log("✅ Indexes created");

    console.log("\n🏭 Database initialization complete!\n");
  } finally {
    appClient.release();
    await appPool.end();
  }
}

initDatabase().catch((err) => {
  console.error("❌ Database initialization failed:", err.message);
  process.exit(1);
});

/**
 * PostgreSQL Connection Pool
 * Production-grade configuration with proper error handling and graceful shutdown
 */
const { Pool } = require("pg");

let pool;
let isShuttingDown = false;

function createPool(config) {
  const poolConfig = {
    connectionString: config.DATABASE_URL,
    min: config.DB_POOL_MIN,
    max: config.DB_POOL_MAX,
    idleTimeoutMillis: config.DB_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT_MS,
    
    // Enable keep-alive to prevent connection drops
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    
    // SSL configuration for production
    ssl: config.DB_SSL_ENABLED ? {
      rejectUnauthorized: true,
    } : false,
  };

  pool = new Pool(poolConfig);

  // Handle pool errors
  pool.on("error", (err, client) => {
    console.error("❌ Unexpected database pool error:", err.message);
    console.error("   Client:", client ? "active" : "idle");
    
    // Don't exit process - let the pool handle reconnection
    // Log to monitoring system in production
  });

  // Handle connection events for monitoring
  pool.on("connect", (client) => {
    console.log("✅ New database connection established");
  });

  pool.on("acquire", (client) => {
    // Connection acquired from pool - useful for monitoring
  });

  pool.on("remove", (client) => {
    console.log("ℹ️  Database connection removed from pool");
  });

  return pool;
}

async function query(...args) {
  if (isShuttingDown) {
    throw new Error("Database pool is shutting down");
  }
  
  if (!pool) {
    throw new Error("Database pool not initialized. Call createPool() first.");
  }
  
  return pool.query(...args);
}

async function getClient() {
  if (isShuttingDown) {
    throw new Error("Database pool is shutting down");
  }
  
  if (!pool) {
    throw new Error("Database pool not initialized. Call createPool() first.");
  }
  
  return pool.connect();
}

async function gracefulShutdown() {
  if (isShuttingDown) {
    return;
  }
  
  isShuttingDown = true;
  console.log("🔄 Closing database connection pool...");
  
  if (pool) {
    try {
      await pool.end();
      console.log("✅ Database pool closed gracefully");
    } catch (err) {
      console.error("❌ Error closing database pool:", err.message);
      throw err;
    }
  }
}

async function healthCheck() {
  try {
    const result = await query("SELECT 1 as health");
    return { status: "healthy", connected: true };
  } catch (err) {
    return { status: "unhealthy", connected: false, error: err.message };
  }
}

module.exports = {
  createPool,
  query,
  getClient,
  gracefulShutdown,
  healthCheck,
  get pool() { return pool; }
};

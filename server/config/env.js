/**
 * Environment Variable Validation
 * Validates all required environment variables at startup using Zod
 * Fails fast if any required variable is missing or invalid
 */

const { z } = require('zod');

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server Configuration
  API_PORT: z.string().regex(/^\d+$/).transform(Number).default('3001'),
  
  // Database Configuration
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  DB_POOL_MIN: z.string().regex(/^\d+$/).transform(Number).default('2'),
  DB_POOL_MAX: z.string().regex(/^\d+$/).transform(Number).default('10'),
  DB_IDLE_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).default('60000'),
  DB_CONNECTION_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).default('10000'),
  DB_SSL_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
  
  // Redis Configuration
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  
  // LLM Configuration
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().min(1).default('gemma4:latest'),
  OLLAMA_TIMEOUT_MS: z.string().regex(/^\d+$/).transform(Number).default('300000'),
  OLLAMA_MAX_TOKENS: z.string().regex(/^\d+$/).transform(Number).default('4096'),
  
  // API Keys (Optional - for tool integrations)
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  ZENDESK_API_KEY: z.string().optional(),
  
  // Security
  CORS_ORIGIN: z.string().default('*'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

let validatedEnv;

function validateEnv() {
  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    console.error('❌ Environment variable validation failed:');
    console.error(error.errors.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n'));
    console.error('\n💡 Check your .env.local file and ensure all required variables are set.');
    process.exit(1);
  }
}

function getEnv() {
  if (!validatedEnv) {
    throw new Error('Environment variables not validated. Call validateEnv() first.');
  }
  return validatedEnv;
}

module.exports = { validateEnv, getEnv };
